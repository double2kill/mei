import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectHanziMultiset,
  extractHanziArray,
  hanziOrderIndexMatchRate,
  hanziShortageVsAnswer,
  hanziSurplusVsAnswer,
  segmentDefaultFromQuiz,
  segmentStorageKey,
} from "./segment-config.js";

describe("segment-config", () => {
  it("should use legacy key when quiz id is segment", () => {
    assert.equal(segmentStorageKey("segment"), "mei:segment-play-config");
  });

  it("should namespace storage key when quiz id is custom", () => {
    assert.equal(
      segmentStorageKey("segment0515"),
      "mei:segment-play-config:segment0515",
    );
  });

  it("should count repeated hanzi when collecting multiset", () => {
    const m = collectHanziMultiset("人人狼a1杀");
    assert.equal(m.get("人"), 2);
    assert.equal(m.get("狼"), 1);
    assert.equal(m.get("杀"), 1);
    assert.equal(m.has("a"), false);
  });

  it("should extract hanzi in order when parsing text", () => {
    assert.deepEqual(extractHanziArray("a狼1人杀"), ["狼", "人", "杀"]);
  });

  it("should score full match when draft equals answer order", () => {
    const r = hanziOrderIndexMatchRate("狼人杀", "狼人杀");
    assert.deepEqual(r, { percent: 100, matched: 3, total: 3 });
  });

  it("should score partial match when only prefix aligns", () => {
    const r = hanziOrderIndexMatchRate("狼人杀", "狼好人");
    assert.equal(r.matched, 1);
    assert.equal(r.total, 3);
    assert.equal(r.percent, 33.33);
  });

  it("should report shortage when draft misses answer chars", () => {
    const shortage = hanziShortageVsAnswer("狼人杀", "狼", "杀人人狼");
    assert.deepEqual(shortage, [
      { char: "杀", remaining: 1 },
      { char: "人", remaining: 1 },
    ]);
  });

  it("should report surplus when draft has extra chars", () => {
    const surplus = hanziSurplusVsAnswer("狼人", "狼人杀杀");
    assert.deepEqual(surplus, [{ char: "杀", surplus: 2 }]);
  });

  it("should use quiz answer when building segment default", () => {
    const cfg = segmentDefaultFromQuiz({
      id: "segment",
      path: "/test/segment",
      title: "每日排段",
      type: "segment",
      answerText: "答案文本",
    });
    assert.deepEqual(cfg, { title: "每日排段", answerText: "答案文本" });
  });
});
