import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LIMIT,
  countSafeMines,
  defaultQuizConfig,
  loadQuizConfig,
  parseTags,
  type QuizConfig,
  type QuizOption,
} from "../test/quiz-config";

type Cell = {
  key: string;
  name: string;
  safe: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function optionsToCells(options: QuizOption[]): Cell[] {
  const shuffled = shuffle(options);
  return shuffled.map((o, i) => ({
    key: `${o.id}:${i}`,
    name: o.name,
    safe: !o.isMine,
  }));
}

export function TestPage() {
  const [cfg, setCfg] = useState<QuizConfig>(() => defaultQuizConfig());
  const [cells, setCells] = useState<Cell[]>([]);
  const [revealedSafe, setRevealedSafe] = useState<Set<string>>(
    () => new Set(),
  );
  const [hitMineKey, setHitMineKey] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [loseKind, setLoseKind] = useState<null | "mine" | "time">(null);
  const [remaining, setRemaining] = useState(DEFAULT_LIMIT);

  const { safe: safeTotal } = useMemo(
    () => countSafeMines(cfg.options),
    [cfg.options],
  );

  useEffect(() => {
    const c = loadQuizConfig();
    setCfg(c);
    setCells(optionsToCells(c.options));
    setRevealedSafe(new Set());
    setHitMineKey(null);
    setWon(false);
    setLost(false);
    setLoseKind(null);
    setRemaining(c.timeLimitSec);
  }, []);

  const tags = useMemo(() => parseTags(cfg.tagInput), [cfg.tagInput]);

  const resetRound = useCallback(() => {
    const c = loadQuizConfig();
    setCfg(c);
    setCells(optionsToCells(c.options));
    setRevealedSafe(new Set());
    setHitMineKey(null);
    setWon(false);
    setLost(false);
    setLoseKind(null);
    setRemaining(c.timeLimitSec);
  }, []);

  useEffect(() => {
    if (won || lost) return;
    if (remaining <= 0) {
      const mine = cells.find((c) => !c.safe);
      if (mine) setHitMineKey(mine.key);
      setLoseKind("time");
      setLost(true);
      return;
    }
    const id = window.setTimeout(() => {
      setRemaining((r) => r - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [remaining, won, lost, cells]);

  useEffect(() => {
    if (lost) return;
    if (safeTotal > 0 && revealedSafe.size >= safeTotal) {
      setWon(true);
    }
  }, [revealedSafe.size, lost, safeTotal]);

  const onCellClick = useCallback(
    (cell: Cell) => {
      if (won || lost || hitMineKey) return;
      if (revealedSafe.has(cell.key)) return;
      if (!cell.safe) {
        setHitMineKey(cell.key);
        setLoseKind("mine");
        setLost(true);
        return;
      }
      setRevealedSafe((prev) => new Set(prev).add(cell.key));
    },
    [won, lost, hitMineKey, revealedSafe],
  );

  const ended = won || lost;
  const progress = revealedSafe.size;

  return (
    <div className="flex min-h-dvh w-full flex-col bg-zinc-100 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-5">
        <header className="mb-4 shrink-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl md:text-2xl">
                {cfg.title.trim() || "未命名测验"}
              </h1>
              {cfg.desc.trim() ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
                  {cfg.desc}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
              <time
                dateTime={`PT${remaining}S`}
                className={`rounded-full px-4 py-2 text-base font-medium tabular-nums sm:px-3 sm:py-1 sm:text-sm ${
                  remaining <= 60 && !ended
                    ? "bg-red-500/15 text-red-700 dark:text-red-300"
                    : "bg-zinc-200/80 dark:bg-zinc-800"
                }`}
              >
                {formatSeconds(remaining)}
              </time>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={resetRound}
                  className="touch-manipulation rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
                >
                  重开
                </button>
                <Link
                  to="/test/settings"
                  className="touch-manipulation rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
                >
                  设置
                </Link>
              </div>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="mb-3 flex items-center justify-between text-sm sm:text-base">
          <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
            已点 {progress}/{Math.max(safeTotal, 0)}
          </span>
          {won && (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              完成
            </span>
          )}
          {lost && loseKind === "mine" && (
            <span className="font-medium text-red-600 dark:text-red-400">
              踩雷
            </span>
          )}
          {lost && loseKind === "time" && (
            <span className="font-medium text-amber-600 dark:text-amber-400">
              超时
            </span>
          )}
        </div>

        <div className="w-full pb-2">
          <div
            className="grid w-full gap-2 sm:gap-2.5"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(clamp(4rem, 22vw, 6.5rem), 1fr))",
            }}
          >
            {cells.map((cell) => {
              const isRevealedSafe = revealedSafe.has(cell.key);
              const isHitMine = hitMineKey === cell.key;
              const showGreen = isRevealedSafe;
              const showRed = isHitMine;
              const dimOthers =
                ended && !cell.safe && !isHitMine && !isRevealedSafe;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={ended || isRevealedSafe}
                  onClick={() => onCellClick(cell)}
                  className={`touch-manipulation flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center rounded-lg border px-1 py-2 text-center transition select-none active:opacity-90 sm:min-h-14 ${
                    showGreen
                      ? "border-emerald-500/70 bg-emerald-500/10 dark:border-emerald-500/45"
                      : showRed
                        ? "border-red-500/70 bg-red-500/10 dark:border-red-500/45"
                        : dimOthers
                          ? "border-zinc-200/50 opacity-35 dark:border-zinc-800"
                          : "border-zinc-200 bg-white active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900"
                  } ${ended && !showGreen && !showRed && cell.safe ? "opacity-50" : ""}`}
                >
                  <span className="w-full break-words text-center text-xs font-semibold leading-tight sm:text-sm">
                    {cell.name}
                  </span>
                  {(showGreen || showRed) && (
                    <span
                      className={`mt-0.5 text-[10px] font-medium sm:mt-1 sm:text-xs ${
                        showGreen
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {showGreen ? "安全" : "雷"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
