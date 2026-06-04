const HANZI_RE = /\p{Script=Han}/gu;

function extractHanziArray(s: string): string[] {
  const out: string[] = [];
  const matches = s.matchAll(HANZI_RE);
  for (const ma of matches) {
    const ch = ma[0];
    if (ch) out.push(ch);
  }
  return out;
}

export const BAIKE_MAX_ATTEMPTS = 20;
export const BAIKE_MAX_BATCH = 10;
export const BAIKE_MASK = "□";

export type BaikeGuessResult = {
  newChars: string[];
  missChars: string[];
  attemptDelta: number;
  titleDone: boolean;
};

export type BaikeGuessRecord = {
  at: number;
  batch: string;
  newChars: string[];
  attemptDelta: number;
  titleDone: boolean;
};

export function baikeArticleHanzi(title: string, detail: string): Set<string> {
  return new Set(extractHanziArray(`${title}\n${detail}`));
}

export function maskBaikeHanzi(text: string, guessed: ReadonlySet<string>): string {
  const re = /\p{Script=Han}/gu;
  return text.replace(re, (ch) => (guessed.has(ch) ? ch : BAIKE_MASK));
}

export function titleHanziGuessed(title: string, guessed: ReadonlySet<string>): boolean {
  const hs = extractHanziArray(title);
  if (hs.length === 0) return true;
  return hs.every((ch) => guessed.has(ch));
}

export function batchHanziCount(batch: string): number {
  return extractHanziArray(batch).length;
}

export function surplusHanziInBatch(batch: string, article: Set<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ch of extractHanziArray(batch)) {
    if (article.has(ch) || seen.has(ch)) continue;
    seen.add(ch);
    out.push(ch);
  }
  return out;
}

function orderedUniqueHanzi(s: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const ch of extractHanziArray(s)) {
    if (seen.has(ch)) continue;
    seen.add(ch);
    out.push(ch);
  }
  return out;
}

export function processBaikeBatch(
  title: string,
  articleHanzi: Set<string>,
  guessed: Set<string>,
  missed: Set<string>,
  batch: string,
):
  | { ok: true; result: BaikeGuessResult }
  | { ok: false; reason: string } {
  const trimmed = batch.trim();
  if (!trimmed) return { ok: false, reason: "请先输入要猜的字" };
  const count = batchHanziCount(trimmed);
  if (count === 0) return { ok: false, reason: "请输入汉字" };
  if (count > BAIKE_MAX_BATCH) {
    return { ok: false, reason: `每次最多猜 ${BAIKE_MAX_BATCH} 个字` };
  }
  const newChars: string[] = [];
  const missChars: string[] = [];
  for (const ch of orderedUniqueHanzi(trimmed)) {
    if (articleHanzi.has(ch)) {
      if (guessed.has(ch)) continue;
      guessed.add(ch);
      newChars.push(ch);
    } else {
      if (missed.has(ch)) continue;
      missed.add(ch);
      missChars.push(ch);
    }
  }
  const titleDone = titleHanziGuessed(title, guessed);
  return {
    ok: true,
    result: {
      newChars,
      missChars,
      attemptDelta: newChars.length + missChars.length,
      titleDone,
    },
  };
}
