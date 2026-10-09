import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  clampRandomPoisonCount,
  loadQuizConfig,
  loadRandomPoisonCount,
  maxRandomPoisonCount,
  saveRandomPoisonCount,
  thunderRandomRoundConfig,
} from "../test/quiz-config";
import { PageStatus } from "../components/PageStatus";
import { useQuiz } from "../hooks/useContentApi";
import { QuizPlayView } from "./QuizPlayView";
import { SegmentPlayView } from "./SegmentPlayView";
import { SentencePlayPage } from "./SentencePlayPage";
import { BaikePlayPage } from "./BaikePlayPage";

const BaikeEnPlayPage = lazy(() =>
  import("./BaikeEnPlayPage").then((m) => ({ default: m.BaikeEnPlayPage })),
);

function resolvedTitle(raw: string | null, fallback: string) {
  if (!raw?.trim()) return fallback;
  const t = raw.trim();
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

export function TestPlayPage() {
  const { id } = useParams();
  const { quiz: def, loading, error } = useQuiz(id);
  const [params] = useSearchParams();

  const title = useMemo(
    () => resolvedTitle(params.get("title"), def?.title ?? ""),
    [params, def?.title],
  );

  useEffect(() => {
    if (!title) return;
    document.title = title;
  }, [title]);

  const [poisonCount, setPoisonCount] = useState(loadRandomPoisonCount);
  const [roundRefreshSignal, setRoundRefreshSignal] = useState(0);
  const maxPoison = maxRandomPoisonCount();

  const onCommitPoisonCount = useCallback((n: number) => {
    const next = clampRandomPoisonCount(n);
    setPoisonCount(next);
    saveRandomPoisonCount(next);
    setRoundRefreshSignal((v) => v + 1);
  }, []);

  const getRoundConfig = useCallback(() => {
    if (!def) return loadQuizConfig("main");
    if (def.type === "random") return thunderRandomRoundConfig(poisonCount, title);
    return loadQuizConfig(def.id);
  }, [def, poisonCount, title]);

  if (!id) return <Navigate to="/test/main" replace />;
  if (loading || error) return <PageStatus loading={loading} error={error} />;
  if (!def) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 dark:bg-black">
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-3 py-10 sm:px-6 sm:py-12">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            未知题目
          </p>
          <Link
            to="/"
            className="touch-manipulation inline-flex w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white active:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
          >
            返回首页
          </Link>
        </main>
      </div>
    );
  }

  const settingsTo =
    def.type === "fixed" && def.settings
      ? `/test/${def.id}/settings`
      : undefined;

  if (def.type === "segment") {
    return <SegmentPlayView quiz={def} />;
  }

  if (def.type === "sentence") {
    return <SentencePlayPage quiz={def} />;
  }

  if (def.type === "baike") {
    return <BaikePlayPage quiz={def} />;
  }

  if (def.type === "baike-en") {
    return (
      <Suspense fallback={<PageStatus loading />}>
        <BaikeEnPlayPage quiz={def} />
      </Suspense>
    );
  }

  return (
    <QuizPlayView
      getRoundConfig={getRoundConfig}
      settingsTo={settingsTo}
      compact={def.id === "eva"}
      roundRefreshSignal={def.type === "random" ? roundRefreshSignal : undefined}
      poisonCountHost={
        def.type === "random"
          ? {
              value: poisonCount,
              max: maxPoison,
              onCommit: onCommitPoisonCount,
            }
          : undefined
      }
    />
  );
}
