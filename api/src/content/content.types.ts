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

export type ScreenRow = {
  quizId: string;
  coverRef: string;
};

export type QuizEntry = {
  id: string;
  path: string;
  title: string;
  type: QuizType;
  coverRef: string;
};

export type ScreenEntries = {
  version: number;
  entries: QuizEntry[];
};

export type AppContent = {
  version: number;
  quizzes: QuizRow[];
  homeScreen: { rows: ScreenRow[] };
  evaScreen: { rows: ScreenRow[] };
};

export type AppContentDoc = AppContent & { _id: string };
