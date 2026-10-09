import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  appendPoisonRecord,
  formatPoisonClickPath,
  getKnownVictimNames,
  getPoisonHistory,
  removePoisonRecord,
} from "./poison-history.js";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  (globalThis as { window: { localStorage: Storage } }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      get length() {
        return store.size;
      },
    },
  };
});

describe("poison-history", () => {
  it("should return unique names in recent-first order when history has duplicates", () => {
    assert.equal(appendPoisonRecord("甲"), true);
    assert.equal(appendPoisonRecord("乙"), true);
    assert.equal(appendPoisonRecord("甲"), true);
    assert.deepEqual(getKnownVictimNames(), ["甲", "乙"]);
    assert.equal(getPoisonHistory().length, 3);
  });

  it("should ignore blank names when appending records", () => {
    assert.equal(appendPoisonRecord("   "), false);
    assert.deepEqual(getKnownVictimNames(), []);
  });

  it("should store click path and hit names when saving poison detail", () => {
    assert.equal(
      appendPoisonRecord("小云", {
        clicks: [
          { name: "预言家", isMine: false },
          { name: "骑士", isMine: true },
        ],
        hitNames: ["骑士"],
        taunt: "女巫：就你了",
      }),
      true,
    );
    const [row] = getPoisonHistory();
    assert.ok(row);
    assert.equal(row.name, "小云");
    assert.deepEqual(row.clicks, [
      { name: "预言家", isMine: false },
      { name: "骑士", isMine: true },
    ]);
    assert.deepEqual(row.hitNames, ["骑士"]);
    assert.equal(row.taunt, "女巫：就你了");
    assert.equal(
      formatPoisonClickPath(row.clicks),
      "预言家 → 骑士（毒）",
    );
  });

  it("should remove record by id when deleting history", () => {
    appendPoisonRecord("甲");
    appendPoisonRecord("乙");
    const [first] = getPoisonHistory();
    assert.ok(first);
    assert.equal(removePoisonRecord(first.id), true);
    assert.deepEqual(
      getPoisonHistory().map((r) => r.name),
      ["甲"],
    );
    assert.equal(removePoisonRecord(first.id), false);
  });
});
