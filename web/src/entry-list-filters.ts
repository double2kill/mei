import type { QuizType } from "./type";

export type FilterType = "baike" | "witch" | "segment" | "sentence";

export const filterLabels: Record<FilterType, string> = {
  witch: "🧙‍♀️ 女巫的毒药",
  segment: "📝 排段",
  sentence: "✍️ 造句",
  baike: "📖 百科",
};

export function filterTypeOf(type: QuizType): FilterType | null {
  if (type === "fixed" || type === "random") return "witch";
  if (type === "baike" || type === "baike-en") return "baike";
  if (type === "segment" || type === "sentence") return type;
  return null;
}

export function matchesFilter(type: QuizType, filterType: FilterType) {
  return filterTypeOf(type) === filterType;
}

export function availableFilters(
  entries: ReadonlyArray<{ type: QuizType }>,
): FilterType[] {
  const seen = new Set<FilterType>();
  const ordered: FilterType[] = [];
  for (const entry of entries) {
    const type = filterTypeOf(entry.type);
    if (!type || seen.has(type)) continue;
    seen.add(type);
    ordered.push(type);
  }
  return ordered;
}

export function parseFilterType(
  value: unknown,
  available: FilterType[],
): FilterType | null {
  if (typeof value === "string" && available.includes(value as FilterType)) {
    return value as FilterType;
  }
  return available[0] ?? null;
}

export function filterEntriesByType<T extends { type: QuizType }>(
  entries: ReadonlyArray<T>,
  filterType: FilterType | null,
): T[] {
  if (filterType == null) return [...entries];
  return entries.filter((entry) => matchesFilter(entry.type, filterType));
}
