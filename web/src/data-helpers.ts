import {
  defaultCardCover,
  evaCardCover,
  meiWarriorCardCover,
} from "./data";
import type { EntryDef, QuizEntry } from "./type";

const coverByRef: Record<string, string> = {
  witch: defaultCardCover,
  eva: evaCardCover,
  "mei-warrior": meiWarriorCardCover,
};

export function coverSrcForRef(ref: string) {
  return coverByRef[ref] ?? defaultCardCover;
}

export function toEntryDef(entry: QuizEntry): EntryDef {
  const coverSrc = coverSrcForRef(entry.coverRef);
  return {
    to: entry.path,
    title: entry.title,
    coverSrc,
    type: entry.type,
  };
}

export function toEntryList(entries: QuizEntry[]): EntryDef[] {
  return entries.map(toEntryDef);
}
