import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSegmentFluencyMessages,
  labelSegmentFluency,
  parseSegmentFluencyResponseContent,
} from "./segment-fluency.js";

test("should include strict anti-inference rules when building prompt", () => {
  const sentence = "狼人杀是一款基于心理学和逻辑推理的经典社交桌游。";
  const messages = buildSegmentFluencyMessages(sentence);

  assert.equal(messages.length, 2);
  assert.equal(messages[0]?.role, "system");
  assert.equal(messages[1]?.role, "user");
  assert.match(messages[0]?.content ?? "", /JSON/);
  assert.match(messages[0]?.content ?? "", /不要脑补/);
  assert.match(messages[0]?.content ?? "", /不要把缩略语擅自扩写/);
  assert.doesNotMatch(messages[0]?.content ?? "", /rewrite/);
  assert.match(messages[1]?.content ?? "", new RegExp(sentence));
});

test("should parse fenced json when model wraps payload in markdown", () => {
  const content = [
    "```json",
    '{"score":88,"reason":"语序自然，表达完整"}',
    "```",
  ].join("\n");

  const result = parseSegmentFluencyResponseContent(content);

  assert.equal(result.score, 88);
  assert.equal(result.reason, "语序自然，表达完整");
});

test("should clamp score when model returns out of range values", () => {
  const content = '{"score":120,"reason":"整体自然"}';

  const result = parseSegmentFluencyResponseContent(content);

  assert.equal(result.score, 100);
  assert.equal(result.reason, "整体自然");
});

test("should infer score when model returns plain text", () => {
  const content = "这句话基本通顺，但节奏还可以更自然。";

  const result = parseSegmentFluencyResponseContent(content);

  assert.equal(result.score, 70);
  assert.equal(result.reason, content);
});

test("should return label when score falls into a fluency range", () => {
  assert.equal(labelSegmentFluency(92), "通顺");
  assert.equal(labelSegmentFluency(70), "基本通顺");
  assert.equal(labelSegmentFluency(45), "不够通顺");
});
