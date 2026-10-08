import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampRandomPoisonCount,
  countSafeMines,
  maxRandomPoisonCount,
  optionsFromRandomMineCount,
  parseTags,
  quizStorageKey,
  thunderRandomRoundConfig,
} from "./quiz-config.js";

describe("quiz-config", () => {
  it("should use default storage key when quiz id is main", () => {
    assert.equal(quizStorageKey("main"), "mei:test-quiz-config");
    assert.equal(quizStorageKey(""), "mei:test-quiz-config");
  });

  it("should namespace storage key when quiz id is custom", () => {
    assert.equal(quizStorageKey("eva"), "mei:test-quiz-config:eva");
  });

  it("should clamp poison count into valid range when input is extreme", () => {
    const max = maxRandomPoisonCount();
    assert.equal(clampRandomPoisonCount(0), 1);
    assert.equal(clampRandomPoisonCount(-3), 1);
    assert.equal(clampRandomPoisonCount(max + 10), max);
    assert.equal(clampRandomPoisonCount(Number.NaN), 1);
  });

  it("should create exact mine count when building random options", () => {
    const options = optionsFromRandomMineCount(3);
    const { mines, safe, total } = countSafeMines(options);
    assert.equal(mines, 3);
    assert.equal(safe, total - 3);
    assert.equal(total, options.length);
  });

  it("should parse tags from mixed separators when trimming blanks", () => {
    assert.deepEqual(parseTags("狼, 人，杀, ,好"), ["狼", "人", "杀", "好"]);
  });

  it("should limit tags to ten when input is long", () => {
    const tags = parseTags("1,2,3,4,5,6,7,8,9,10,11,12");
    assert.deepEqual(tags, ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  });

  it("should mention mine count in desc when random round has multiple poisons", () => {
    const cfg = thunderRandomRoundConfig(2, "自定义标题");
    assert.equal(cfg.title, "自定义标题");
    assert.match(cfg.desc, /2 个身份/);
    assert.equal(countSafeMines(cfg.options).mines, 2);
  });
});
