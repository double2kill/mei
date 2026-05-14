import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  clampRandomPoisonCount,
  loadQuizConfig,
  loadRandomPoisonCount,
  maxRandomPoisonCount,
  saveRandomPoisonCount,
  thunderRandomRoundConfig,
} from "../test/quiz-config";
import { getQuizDef } from "../data-helpers";
import { QuizPlayView } from "./QuizPlayView";
import { SegmentPlayView } from "./SegmentPlayView";
import { SentencePlayPage } from "./SentencePlayPage";

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
  const def = useMemo(() => getQuizDef(id), [id]);
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
  const [poisonCountInput, setPoisonCountInput] = useState(() =>
    String(loadRandomPoisonCount()),
  );
  const [roundRefreshSignal, setRoundRefreshSignal] = useState(0);
  const maxPoison = maxRandomPoisonCount();

  const onSaveToolbar = () => {
    const next = clampRandomPoisonCount(Number(poisonCountInput));
    setPoisonCount(next);
    setPoisonCountInput(String(next));
    saveRandomPoisonCount(next);
    setRoundRefreshSignal((n) => n + 1);
  };

  const getRoundConfig = useCallback(() => {
    if (!def) return loadQuizConfig("main");
    if (def.type === "random") return thunderRandomRoundConfig(poisonCount, title);
    return loadQuizConfig(def.id);
  }, [def, poisonCount, title]);

  if (!id) return <Navigate to="/test/main" replace />;
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

  const settingsTo = def.settings ? `/test/${def.id}/settings` : undefined;

  if (def.type === "segment") {
    return <SegmentPlayView settingsTo={settingsTo} segmentQuizId={def.id} />;
  }

  if (def.type === "sentence") {
    return <SentencePlayPage />;
  }

  return (
    <QuizPlayView
      getRoundConfig={getRoundConfig}
      settingsTo={settingsTo}
      roundRefreshSignal={def.type === "random" ? roundRefreshSignal : undefined}
      toolbar={
        def.type === "random" ? (
          <div className="flex w-full flex-wrap items-center gap-2 font-medium">
            <label className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 text-zinc-600 dark:text-zinc-400">
                毒药数量
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={maxPoison}
                value={poisonCountInput}
                onChange={(e) => setPoisonCountInput(e.target.value)}
                onBlur={() => {
                  if (!poisonCountInput.trim()) {
                    setPoisonCountInput(String(poisonCount));
                    return;
                  }
                  const next = clampRandomPoisonCount(Number(poisonCountInput));
                  setPoisonCount(next);
                  setPoisonCountInput(String(next));
                }}
                className="min-h-10 w-20 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-center text-base tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
            <button
              type="button"
              onClick={onSaveToolbar}
              className="touch-manipulation min-h-10 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white active:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
            >
              保存
            </button>
            <span className="text-zinc-500 dark:text-zinc-500">
              保存后重新随机毒药位置
            </span>
          </div>
        ) : undefined
      }
    />
  );
}

