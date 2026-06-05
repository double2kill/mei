export type QuizType =
  | "fixed"
  | "random"
  | "segment"
  | "sentence"
  | "baike"
  | "baike-en";

export type QuizRow = {
  id: string;
  path: string;
  title: string;
  type: QuizType;
  coverRef?: string;
  settings?: boolean;
  answerText?: string;
  text?: string;
  usageRequired?: number;
  wikiTitle?: string;
  wikiDetail?: string;
};

export type QuizDef = QuizRow;

export type EntryDef = {
  to: string;
  title: string;
  coverSrc: string;
  type: QuizType;
};

export type SegmentDailyPlay = {
  title: string;
  answerText: string;
};

export type ScreenRow = {
  quizId: string;
  coverRef: string;
};

export type AppContent = {
  version: number;
  quizzes: QuizRow[];
  homeScreen: { rows: ScreenRow[] };
  evaScreen: { rows: ScreenRow[] };
};
