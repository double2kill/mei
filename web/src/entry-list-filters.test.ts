import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  availableFilters,
  filterEntriesByType,
  filterTypeOf,
  matchesFilter,
  parseFilterType,
} from "./entry-list-filters.js";
import type { QuizType } from "./type.js";

function entry(type: QuizType) {
  return { type };
}

describe("entry-list-filters", () => {
  it("should map fixed and random to witch when classifying type", () => {
    assert.equal(filterTypeOf("fixed"), "witch");
    assert.equal(filterTypeOf("random"), "witch");
  });

  it("should map baike and baike-en to baike when classifying type", () => {
    assert.equal(filterTypeOf("baike"), "baike");
    assert.equal(filterTypeOf("baike-en"), "baike");
  });

  it("should keep segment and sentence as themselves when classifying type", () => {
    assert.equal(filterTypeOf("segment"), "segment");
    assert.equal(filterTypeOf("sentence"), "sentence");
  });

  it("should order tabs by first appearance when scanning entries", () => {
    const available = availableFilters([
      entry("fixed"),
      entry("segment"),
      entry("baike"),
      entry("random"),
      entry("baike-en"),
      entry("sentence"),
    ]);
    assert.deepEqual(available, ["witch", "segment", "baike", "sentence"]);
  });

  it("should omit missing categories when entries lack those types", () => {
    const available = availableFilters([entry("random"), entry("random")]);
    assert.deepEqual(available, ["witch"]);
  });

  it("should return empty list when entries are empty", () => {
    assert.deepEqual(availableFilters([]), []);
  });

  it("should use first available tab when url type is missing", () => {
    assert.equal(parseFilterType(undefined, ["witch", "baike"]), "witch");
    assert.equal(parseFilterType("nope", ["segment"]), "segment");
  });

  it("should keep url type when it exists in available tabs", () => {
    assert.equal(parseFilterType("baike", ["witch", "baike"]), "baike");
  });

  it("should return null when no tabs are available", () => {
    assert.equal(parseFilterType("witch", []), null);
  });

  it("should match witch filter for fixed and random entries", () => {
    assert.equal(matchesFilter("fixed", "witch"), true);
    assert.equal(matchesFilter("random", "witch"), true);
    assert.equal(matchesFilter("segment", "witch"), false);
  });

  it("should filter entries by selected tab when filter is set", () => {
    const entries = [
      entry("fixed"),
      entry("segment"),
      entry("baike"),
      entry("baike-en"),
    ];
    assert.deepEqual(filterEntriesByType(entries, "witch"), [entry("fixed")]);
    assert.deepEqual(filterEntriesByType(entries, "baike"), [
      entry("baike"),
      entry("baike-en"),
    ]);
  });

  it("should return all entries when filter is null", () => {
    const entries = [entry("segment"), entry("sentence")];
    assert.deepEqual(filterEntriesByType(entries, null), entries);
  });
});
