import { getAdminToken } from "./auth";
import type { QuizDef, QuizType, ScreenRow } from "../type";

function apiBase(): string {
  const base = import.meta.env.PUBLIC_API_BASE?.trim();
  return base ? base.replace(/\/$/, "") : "/api";
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${apiBase()}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error("login failed");
  }
  return res.json() as Promise<{ token: string }>;
}

export async function fetchAdminQuizzes() {
  return adminFetch<{ version: number; quizzes: QuizDef[] }>("/admin/quizzes");
}

export async function fetchAdminQuiz(id: string) {
  return adminFetch<QuizDef>(`/admin/quizzes/${encodeURIComponent(id)}`);
}

export async function createAdminQuiz(body: Partial<QuizDef> & { id: string }) {
  return adminFetch<QuizDef>("/admin/quizzes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAdminQuiz(
  id: string,
  body: Partial<QuizDef>,
) {
  return adminFetch<QuizDef>(`/admin/quizzes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteAdminQuiz(id: string) {
  return adminFetch<{ ok: boolean }>(
    `/admin/quizzes/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function fetchAdminScreen(screen: "home" | "eva") {
  return adminFetch<{
    version: number;
    screen: string;
    rows: ScreenRow[];
  }>(`/admin/screens/${screen}`);
}

export async function saveAdminScreen(
  screen: "home" | "eva",
  rows: ScreenRow[],
) {
  return adminFetch<{
    version: number;
    screen: string;
    rows: ScreenRow[];
  }>(`/admin/screens/${screen}`, {
    method: "PUT",
    body: JSON.stringify({ rows }),
  });
}

export const QUIZ_TYPES: QuizType[] = [
  "fixed",
  "random",
  "segment",
  "sentence",
  "baike",
  "baike-en",
];

export const COVER_REFS = [
  "witch",
  "eva",
  "mei-warrior",
  "mei-segment",
  "mei-wiki",
] as const;
