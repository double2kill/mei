const base =
  typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";

export const defaultCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-witch.png";

export const evaCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "eva-witch.png";

export type QuizType = "fixed" | "random" | "segment";

export type QuizDef = {
  id: string;
  title: string;
  type: QuizType;
  settings?: boolean;
};

export type EntryDef = {
  to: string;
  title: string;
  coverSrc: string;
};

export const quizDefs: Record<string, QuizDef> = {
  main: {
    id: "main",
    title: "女巫的毒药",
    type: "fixed",
    settings: true,
  },
  random: {
    id: "random",
    title: "女巫的毒药（随机版）",
    type: "random",
  },
  eva: {
    id: "eva",
    title: "Eva(云上小师赛)",
    type: "random",
  },
  segment: {
    id: "segment",
    title: "排段",
    type: "segment",
    settings: true,
  },
};

export const homeEntries: EntryDef[] = [
  { to: "/test/main", title: quizDefs.main.title, coverSrc: defaultCardCover },
  {
    to: "/test/random",
    title: quizDefs.random.title,
    coverSrc: defaultCardCover,
  },
  {
    to: "/test/segment",
    title: quizDefs.segment.title,
    coverSrc: defaultCardCover,
  },
];

export const evaEntries: EntryDef[] = [
  { to: "/test/eva", title: quizDefs.eva.title, coverSrc: evaCardCover },
];

export function getQuizDef(id: string | undefined): QuizDef | null {
  if (!id) return null;
  return quizDefs[id] ?? null;
}

