import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BAIKE_EN_MAX_BATCH,
  batchWordCount,
  baikeEnArticleWordKeys,
  processBaikeEnBatch,
  titleWordsGuessed,
  wordKey,
} from "./baike-en-play.js";

describe("baike-en-play", () => {
  it("should require full word match when guessing article words", () => {
    const title = "Werewolf";
    const article = baikeEnArticleWordKeys(title, "A social game");
    const guessed = new Set<string>();
    const missed = new Set<string>();
    const r = processBaikeEnBatch(title, article, guessed, missed, "wolf");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.result.newWords, []);
      assert.deepEqual(r.result.missWords, ["wolf"]);
      assert.equal(r.result.attemptDelta, 1);
    }
  });

  it("should reveal title when exact title words are guessed", () => {
    const title = "Werewolf";
    const article = baikeEnArticleWordKeys(title, "Game night");
    const guessed = new Set<string>();
    const missed = new Set<string>();
    const r = processBaikeEnBatch(title, article, guessed, missed, "Werewolf");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.result.titleDone, true);
      assert.deepEqual(r.result.newWords, ["Werewolf"]);
    }
  });

  it("should not count already guessed words toward attempt delta", () => {
    const title = "Werewolf Game";
    const article = baikeEnArticleWordKeys(title, "");
    const guessed = new Set<string>([wordKey("Werewolf")]);
    const missed = new Set<string>();
    const r = processBaikeEnBatch(title, article, guessed, missed, "Werewolf Game");
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.deepEqual(r.result.newWords, ["Game"]);
      assert.equal(r.result.attemptDelta, 1);
    }
  });

  it("should reject batch when more than ten words submitted", () => {
    const article = baikeEnArticleWordKeys("A", "b c d e f g h i j k l");
    const guessed = new Set<string>();
    const missed = new Set<string>();
    const batch = "one two three four five six seven eight nine ten eleven";
    assert.ok(batchWordCount(batch) > BAIKE_EN_MAX_BATCH);
    const r = processBaikeEnBatch("A", article, guessed, missed, batch);
    assert.equal(r.ok, false);
  });
});
