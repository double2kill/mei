import type { QuizDef, ScreenEntries } from "../type";

function apiBase(): string {
  const base = import.meta.env.PUBLIC_API_BASE?.trim();
  return base ? base.replace(/\/$/, "") : "/api";
}

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchHomeEntries(): Promise<ScreenEntries> {
  const res = await fetch(`${apiBase()}/content/home`);
  return readJson<ScreenEntries>(res);
}

export async function fetchEvaEntries(): Promise<ScreenEntries> {
  const res = await fetch(`${apiBase()}/content/eva`);
  return readJson<ScreenEntries>(res);
}

export async function fetchQuiz(id: string): Promise<QuizDef> {
  const res = await fetch(`${apiBase()}/content/quizzes/${encodeURIComponent(id)}`);
  return readJson<QuizDef>(res);
}
