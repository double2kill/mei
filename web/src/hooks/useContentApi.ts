import { useEffect, useState } from "react";
import {
  fetchEvaEntries,
  fetchHomeEntries,
  fetchQuiz,
} from "../api/content-client";
import { toEntryList } from "../data-helpers";
import type { EntryDef, QuizDef } from "../type";

const quizCache = new Map<string, QuizDef>();

export function useScreenEntries(screen: "home" | "eva") {
  const [entries, setEntries] = useState<EntryDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = screen === "home" ? fetchHomeEntries : fetchEvaEntries;
    load()
      .then((data) => {
        if (cancelled) return;
        setEntries(toEntryList(data.entries));
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [screen]);

  return { entries, loading, error };
}

export function useQuiz(id: string | undefined) {
  const cached = id ? quizCache.get(id) : undefined;
  const [quiz, setQuiz] = useState<QuizDef | null>(cached ?? null);
  const [loading, setLoading] = useState(Boolean(id && !cached));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setQuiz(null);
      setLoading(false);
      setError(null);
      return;
    }
    const hit = quizCache.get(id);
    if (hit) {
      setQuiz(hit);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchQuiz(id)
      .then((data) => {
        if (cancelled) return;
        quizCache.set(id, data);
        setQuiz(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setQuiz(null);
        setError(err instanceof Error ? err.message : "load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { quiz, loading, error };
}
