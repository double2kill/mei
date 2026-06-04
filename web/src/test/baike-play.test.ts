import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BAIKE_MAX_BATCH,
  batchHanziCount,
  maskBaikeHanzi,
  processBaikeBatch,
  titleHanziGuessed,
  baikeArticleHanzi,
} from "./baike-play.js";

describe("baike-play", () => {
  it("should mask unguessed hanzi when rendering article", () => {
    const masked = maskBaikeHanzi("狼人杀", new Set(["人"]));
    assert.equal(masked, "□人□");
  });

  it("should count title guessed when every title hanzi is revealed", () => {
    assert.equal(titleHanziGuessed("狼人杀", new Set(["狼", "人", "杀"])), true);
    assert.equal(titleHanziGuessed("狼人杀", new Set(["狼", "人"])), false);
  });

  it("should reject batch when more than ten hanzi submitted", () => {
    const article = baikeArticleHanzi("标题", "正文用字");
    const guessed = new Set<string>();
    const batch = "一二三四五六七八九十十一";
    const missed = new Set<string>();
    const r = processBaikeBatch("标题", article, guessed, missed, batch);
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.reason, /最多/);
  });

  it("should not count already guessed hanzi toward attempt delta", () => {
    const title = "狼人";
    const article = baikeArticleHanzi(title, "杀是一款游戏");
    const guessed = new Set<string>(["狼"]);
    const missed = new Set<string>();
    const r = processBaikeBatch(title, article, guessed, missed, "狼人");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.result.newChars, ["人"]);
      assert.equal(r.result.attemptDelta, 1);
    }
  });

  it("should mark title done when title hanzi all guessed in batch", () => {
    const title = "狼人杀";
    const article = baikeArticleHanzi(title, "桌游");
    const guessed = new Set<string>();
    const missed = new Set<string>();
    const r = processBaikeBatch(title, article, guessed, missed, "狼人杀");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.result.titleDone, true);
      assert.equal(r.result.attemptDelta, 3);
    }
  });

  it("should count each new hanzi once per batch when batchHanziCount within limit", () => {
    const title = "甲乙";
    const article = baikeArticleHanzi(title, "丙丁");
    const guessed = new Set<string>();
    const batch = "甲丙甲";
    assert.equal(batchHanziCount(batch), 3);
    assert.ok(batchHanziCount(batch) <= BAIKE_MAX_BATCH);
    const missed = new Set<string>();
    const r = processBaikeBatch(title, article, guessed, missed, batch);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.result.newChars, ["甲", "丙"]);
      assert.equal(r.result.attemptDelta, 2);
    }
  });

  it("should record miss hanzi when char is not in article", () => {
    const title = "狼人";
    const article = baikeArticleHanzi(title, "杀");
    const guessed = new Set<string>();
    const missed = new Set<string>();
    const r = processBaikeBatch(title, article, guessed, missed, "狼错");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.result.newChars, ["狼"]);
      assert.deepEqual(r.result.missChars, ["错"]);
      assert.equal(r.result.attemptDelta, 2);
    }
  });
});
