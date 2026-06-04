export const BAIKE_MAX_ATTEMPTS = 20;
export const BAIKE_EN_MAX_BATCH = 10;

const WORD_RE = /[A-Za-z]+(?:'[A-Za-z]+)?/g;

export type BaikeEnGuessResult = {
  newWords: string[];
  missWords: string[];
  attemptDelta: number;
  titleDone: boolean;
};

export function wordKey(word: string): string {
  return word.toLowerCase();
}

export function extractEnglishWords(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(WORD_RE)) {
    if (m[0]) out.push(m[0]);
  }
  return out;
}

export function baikeEnArticleWordKeys(title: string, detail: string): Set<string> {
  const keys = new Set<string>();
  for (const w of extractEnglishWords(`${title}\n${detail}`)) {
    keys.add(wordKey(w));
  }
  return keys;
}

export function titleWordsGuessed(title: string, guessed: ReadonlySet<string>): boolean {
  const words = extractEnglishWords(title);
  if (words.length === 0) return true;
  return words.every((w) => guessed.has(wordKey(w)));
}

export function batchWordCount(batch: string): number {
  return extractEnglishWords(batch).length;
}

function orderedUniqueWords(batch: string): { key: string; display: string }[] {
  const seen = new Set<string>();
  const out: { key: string; display: string }[] = [];
  for (const w of extractEnglishWords(batch)) {
    const key = wordKey(w);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ key, display: w });
  }
  return out;
}

export function processBaikeEnBatch(
  title: string,
  articleKeys: Set<string>,
  guessed: Set<string>,
  missed: Set<string>,
  batch: string,
):
  | { ok: true; result: BaikeEnGuessResult }
  | { ok: false; reason: string } {
  const trimmed = batch.trim();
  if (!trimmed) return { ok: false, reason: "Enter words to guess" };
  const count = batchWordCount(trimmed);
  if (count === 0) return { ok: false, reason: "Enter English words" };
  if (count > BAIKE_EN_MAX_BATCH) {
    return { ok: false, reason: `Up to ${BAIKE_EN_MAX_BATCH} words per batch` };
  }
  const newWords: string[] = [];
  const missWords: string[] = [];
  for (const { key, display } of orderedUniqueWords(trimmed)) {
    if (articleKeys.has(key)) {
      if (guessed.has(key)) continue;
      guessed.add(key);
      newWords.push(display);
    } else {
      if (missed.has(key)) continue;
      missed.add(key);
      missWords.push(display);
    }
  }
  const titleDone = titleWordsGuessed(title, guessed);
  return {
    ok: true,
    result: {
      newWords,
      missWords,
      attemptDelta: newWords.length + missWords.length,
      titleDone,
    },
  };
}
