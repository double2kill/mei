import { appContent, defaultCardCover, evaCardCover } from "./data";
import type {
  EntryDef,
  QuizDef,
  SegmentDailyPlay,
} from "./type";

export type { SegmentDailyPlay };

export function segmentDefaultPlayForQuizId(quizId: string): SegmentDailyPlay {
  const q = appContent.quizzes.find((x) => x.id === quizId);
  if (q?.type === "segment" && typeof q.answerText === "string") {
    return { title: q.title, answerText: q.answerText };
  }
  return { title: "排段", answerText: "" };
}

export function getQuizDef(id: string | undefined): QuizDef | null {
  if (!id) return null;
  return appContent.quizzes.find((q) => q.id === id) ?? null;
}

const coverByRef: Record<string, string> = {
  witch: defaultCardCover,
  eva: evaCardCover,
};

function screenRowToEntry(row: { quizId: string; coverRef: string }): EntryDef {
  const q = appContent.quizzes.find((x) => x.id === row.quizId);
  if (!q) {
    throw new Error(`appContent: unknown quizId "${row.quizId}"`);
  }
  const coverSrc = coverByRef[row.coverRef] ?? defaultCardCover;
  return { to: q.path, title: q.title, coverSrc };
}

export const homeEntries: EntryDef[] =
  appContent.homeScreen.rows.map(screenRowToEntry);

export const evaEntries: EntryDef[] =
  appContent.evaScreen.rows.map(screenRowToEntry);
