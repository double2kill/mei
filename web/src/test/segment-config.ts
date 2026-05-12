export type SegmentPlayConfig = {
  title: string;
  answerText: string;
};

export const SEGMENT_STORAGE_KEY = "mei:segment-play-config";

const HANZI_RE = /\p{Script=Han}/gu;

export function collectHanziMultiset(s: string): Map<string, number> {
  const m = new Map<string, number>();
  if (!s) return m;
  const matches = s.matchAll(HANZI_RE);
  for (const ma of matches) {
    const ch = ma[0];
    if (!ch) continue;
    m.set(ch, (m.get(ch) ?? 0) + 1);
  }
  return m;
}

export function extractHanziArray(s: string): string[] {
  const out: string[] = [];
  const matches = s.matchAll(HANZI_RE);
  for (const ma of matches) {
    const ch = ma[0];
    if (ch) out.push(ch);
  }
  return out;
}

export function hanziOrderIndexMatchRate(
  answer: string,
  draft: string,
): { percent: number; matched: number; total: number } {
  const a = extractHanziArray(answer);
  const b = extractHanziArray(draft);
  const n = a.length;
  if (n === 0) return { percent: 100, matched: 0, total: 0 };
  let matched = 0;
  for (let i = 0; i < n; i++) {
    if (b[i] === a[i]) matched++;
  }
  const percent = Math.round((matched / n) * 10000) / 100;
  return { percent, matched, total: n };
}

function hanziFirstAppearanceOrder(s: string): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  const matches = s.matchAll(HANZI_RE);
  for (const ma of matches) {
    const ch = ma[0];
    if (!ch || seen.has(ch)) continue;
    seen.add(ch);
    order.push(ch);
  }
  return order;
}

function hanziFirstAppearanceInSource(
  source: string,
  candidates: Set<string>,
): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  const matches = source.matchAll(HANZI_RE);
  for (const ma of matches) {
    const ch = ma[0];
    if (!ch || seen.has(ch) || !candidates.has(ch)) continue;
    seen.add(ch);
    order.push(ch);
  }
  return order;
}

export function hanziShortageVsAnswer(
  answer: string,
  draft: string,
  cardOrderSource: string,
): { char: string; remaining: number }[] {
  const answerM = collectHanziMultiset(answer);
  const draftM = collectHanziMultiset(draft);
  const shortage = new Set<string>();
  for (const [ch, need] of answerM) {
    const rem = Math.max(0, need - (draftM.get(ch) ?? 0));
    if (rem > 0) shortage.add(ch);
  }
  let order = hanziFirstAppearanceInSource(cardOrderSource, shortage);
  if (order.length < shortage.size) {
    const seenInOrder = new Set(order);
    for (const ch of hanziFirstAppearanceOrder(answer)) {
      if (shortage.has(ch) && !seenInOrder.has(ch)) {
        order.push(ch);
        seenInOrder.add(ch);
      }
    }
  }
  return order.map((ch) => ({
    char: ch,
    remaining: Math.max(0, (answerM.get(ch) ?? 0) - (draftM.get(ch) ?? 0)),
  }));
}

export function hanziSurplusVsAnswer(
  answer: string,
  draft: string,
): { char: string; surplus: number }[] {
  const answerM = collectHanziMultiset(answer);
  const draftM = collectHanziMultiset(draft);
  const order = hanziFirstAppearanceOrder(draft);
  const out: { char: string; surplus: number }[] = [];
  for (const ch of order) {
    const sur = (draftM.get(ch) ?? 0) - (answerM.get(ch) ?? 0);
    if (sur > 0) out.push({ char: ch, surplus: sur });
  }
  return out;
}

export function defaultSegmentPlayConfig(): SegmentPlayConfig {
  return {
    title: "排段",
    answerText:
      "狼人杀是一款基于心理学和逻辑推理的经典社交桌游，分为狼人、好人两大阵营。",
  };
}

function parseStoredSegment(v: Partial<SegmentPlayConfig>): SegmentPlayConfig {
  const d = defaultSegmentPlayConfig();
  return {
    title:
      typeof v.title === "string" && v.title.trim() ? v.title.trim() : d.title,
    answerText: typeof v.answerText === "string" ? v.answerText : d.answerText,
  };
}

export function loadSegmentPlayConfig(): SegmentPlayConfig {
  if (typeof window === "undefined") return defaultSegmentPlayConfig();
  try {
    const raw = window.localStorage.getItem(SEGMENT_STORAGE_KEY);
    if (!raw) return defaultSegmentPlayConfig();
    const v = JSON.parse(raw) as Partial<SegmentPlayConfig>;
    return parseStoredSegment(v);
  } catch {
    return defaultSegmentPlayConfig();
  }
}

export function saveSegmentPlayConfig(c: SegmentPlayConfig): void {
  window.localStorage.setItem(SEGMENT_STORAGE_KEY, JSON.stringify(c));
}
