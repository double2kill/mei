export const COVER_REFS = [
  "witch",
  "eva",
  "mei-warrior",
  "mei-segment",
  "mei-wiki",
] as const;

export type CoverRef = (typeof COVER_REFS)[number];

export const COVER_REF_SET = new Set<string>(COVER_REFS);

export function coverRefForQuizType(type: string): CoverRef | undefined {
  if (type === "segment") return "mei-segment";
  if (type === "baike" || type === "baike-en") return "mei-wiki";
  return undefined;
}
