import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  addPlayerName,
  getPlayerNames,
  removePlayerName,
} from "./player-names.js";

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

describe("player-names", () => {
  it("should append unique names when saving players", () => {
    assert.equal(addPlayerName("甲"), true);
    assert.equal(addPlayerName("乙"), true);
    assert.equal(addPlayerName("甲"), false);
    assert.deepEqual(getPlayerNames(), ["甲", "乙"]);
  });

  it("should remove existing name when deleting a player", () => {
    addPlayerName("甲");
    addPlayerName("乙");
    assert.equal(removePlayerName("甲"), true);
    assert.deepEqual(getPlayerNames(), ["乙"]);
    assert.equal(removePlayerName("甲"), false);
  });

  it("should ignore blank names when adding players", () => {
    assert.equal(addPlayerName("  "), false);
    assert.deepEqual(getPlayerNames(), []);
  });
});
