import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatSurplusLabels,
  surplusCharMessage,
  surplusSubmitMessage,
} from "./hanzi-play-messages.js";

describe("hanzi-play-messages", () => {
  it("should format surplus labels with count when surplus is greater than one", () => {
    assert.deepEqual(formatSurplusLabels([{ char: "人", surplus: 2 }]), [
      "人×2",
    ]);
  });

  it("should format surplus labels without count when surplus is one", () => {
    assert.deepEqual(formatSurplusLabels([{ char: "狼", surplus: 1 }]), [
      "狼",
    ]);
  });

  it("should build submit message when surplus cards exist", () => {
    assert.equal(
      surplusSubmitMessage(
        [
          { char: "狼", surplus: 1 },
          { char: "人", surplus: 2 },
        ],
        "提交",
      ),
      "存在多余的汉字「狼、人×2」，请删除后再提交",
    );
  });

  it("should build char message when a single surplus char is selected", () => {
    assert.equal(surplusCharMessage("杀", 1), "「杀」已多写，请从输入框删除");
    assert.equal(
      surplusCharMessage("人", 3),
      "「人」已多写 3 个，请从输入框删除",
    );
  });
});
