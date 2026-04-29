import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  countSafeMines,
  parseTags,
  pickRandomMineTaunt,
  shuffle,
  type QuizConfig,
  type QuizOption,
} from "../test/quiz-config";
import {
  appendPoisonRecord,
  formatPoisonTime,
  getPoisonHistory,
  type PoisonRecord,
} from "../test/poison-history";

type Cell = {
  key: string;
  name: string;
  safe: boolean;
};

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

export type QuizPlayViewProps = {
  getRoundConfig: () => QuizConfig;
  settingsTo?: string;
};

export function QuizPlayView({
  getRoundConfig,
  settingsTo,
}: QuizPlayViewProps) {
  const getRoundRef = useRef(getRoundConfig);
  getRoundRef.current = getRoundConfig;

  const [cfg, setCfg] = useState<QuizConfig>(() => getRoundConfig());
  const [cells, setCells] = useState<Cell[]>([]);
  const [revealedSafe, setRevealedSafe] = useState<Set<string>>(
    () => new Set(),
  );
  const [hitMineKey, setHitMineKey] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [loseKind, setLoseKind] = useState<null | "mine" | "time">(null);
  const [mineTaunt, setMineTaunt] = useState("");
  const [victimName, setVictimName] = useState("");
  const [poisonHistoryOpen, setPoisonHistoryOpen] = useState(false);
  const [poisonHistoryRows, setPoisonHistoryRows] = useState<PoisonRecord[]>(
    [],
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(cfg.timeLimitSec);

  const { safe: safeTotal } = useMemo(
    () => countSafeMines(cfg.options),
    [cfg.options],
  );

  const applyRound = useCallback(() => {
    const c = getRoundRef.current();
    setCfg(c);
    setCells(optionsToCells(c.options));
    setRevealedSafe(new Set());
    setHitMineKey(null);
    setWon(false);
    setLost(false);
    setLoseKind(null);
    setMineTaunt("");
    setVictimName("");
    setPoisonHistoryOpen(false);
    setSaveToast(null);
    setRemaining(c.timeLimitSec);
  }, []);

  useEffect(() => {
    applyRound();
  }, [applyRound]);

  const tags = useMemo(() => parseTags(cfg.tagInput), [cfg.tagInput]);

  const resetRound = useCallback(() => {
    applyRound();
  }, [applyRound]);

  const openPoisonHistory = useCallback(() => {
    setPoisonHistoryRows(getPoisonHistory());
    setPoisonHistoryOpen(true);
  }, []);

  const onSaveVictim = useCallback(() => {
    if (!appendPoisonRecord(victimName)) return;
    setVictimName("");
    setSaveToast("保存成功");
    if (poisonHistoryOpen) setPoisonHistoryRows(getPoisonHistory());
  }, [victimName, poisonHistoryOpen]);

  useEffect(() => {
    if (!saveToast) return;
    const id = window.setTimeout(() => setSaveToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [saveToast]);

  useEffect(() => {
    if (!poisonHistoryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPoisonHistoryOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [poisonHistoryOpen]);

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
        setMineTaunt(pickRandomMineTaunt());
        return;
      }
      setRevealedSafe((prev) => new Set(prev).add(cell.key));
    },
    [won, lost, hitMineKey, revealedSafe],
  );

  const ended = won || lost;
  const progress = revealedSafe.size;
  const showMineTauntBlock =
    lost && loseKind === "mine" && Boolean(hitMineKey) && mineTaunt.length > 0;
  const showMineVictimForm = lost && loseKind === "mine";

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
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
              <button
                type="button"
                onClick={openPoisonHistory}
                className="touch-manipulation w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-center text-sm font-medium text-zinc-800 active:bg-zinc-50 sm:w-auto sm:max-w-xs sm:px-3 sm:text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:active:bg-zinc-800"
              >
                查看历史中毒记录
              </button>
              <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
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
                {settingsTo ? (
                  <Link
                    to={settingsTo}
                    className="touch-manipulation rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
                  >
                    设置
                  </Link>
                ) : null}
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
          {lost && loseKind === "time" && (
            <span className="font-medium text-amber-600 dark:text-amber-400">
              超时
            </span>
          )}
        </div>

        <div className="w-full pb-2">
          <div className="grid w-full grid-cols-6 gap-2 sm:gap-2.5">
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
                  className={`touch-manipulation flex min-h-14 min-w-0 flex-col items-center justify-center rounded-lg border px-0.5 py-2 text-center transition select-none active:opacity-90 sm:min-h-16 ${
                    showGreen
                      ? "border-emerald-500/70 bg-emerald-500/10 dark:border-emerald-500/45"
                      : showRed
                        ? "border-red-500/70 bg-red-500/10 dark:border-red-500/45"
                        : dimOthers
                          ? "border-zinc-200/50 opacity-35 dark:border-zinc-800"
                          : "border-zinc-200 bg-white active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900"
                  } ${ended && !showGreen && !showRed && cell.safe ? "opacity-50" : ""}`}
                >
                  <span className="w-full break-words text-center text-base font-semibold leading-tight sm:text-lg">
                    {cell.name}
                  </span>
                  {(showGreen || showRed) && (
                    <span
                      className={`mt-0.5 text-sm font-medium sm:mt-1 sm:text-base ${
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

        {ended ? (
          <div className="mx-auto mt-6 flex w-full max-w-md shrink-0 flex-col gap-5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {showMineTauntBlock ? (
              <p className="text-center text-lg leading-relaxed font-medium text-red-600 sm:text-xl md:text-2xl dark:text-red-400">
                {mineTaunt}
              </p>
            ) : null}
            {showMineVictimForm ? (
              <div className="flex w-full flex-col gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    中奖者姓名
                  </span>
                  <input
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    autoComplete="name"
                    className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  />
                </label>
                <button
                  type="button"
                  disabled={!victimName.trim()}
                  onClick={onSaveVictim}
                  className="touch-manipulation min-h-12 w-full rounded-xl bg-zinc-900 px-4 text-base font-medium text-white transition active:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  保存
                </button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={resetRound}
              className="touch-manipulation w-full rounded-2xl bg-zinc-900 px-6 py-4 text-lg font-semibold text-white shadow-lg transition active:scale-[0.98] active:opacity-95 sm:py-5 sm:text-xl dark:bg-zinc-100 dark:text-zinc-900"
            >
              重开
            </button>
          </div>
        ) : null}
      </div>

      {saveToast ? (
        <div
          role="status"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[60] max-w-sm -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saveToast}
        </div>
      ) : null}

      {poisonHistoryOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPoisonHistoryOpen(false)}
          role="presentation"
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="poison-history-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2
                id="poison-history-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
              >
                历史中毒记录
              </h2>
              <button
                type="button"
                onClick={() => setPoisonHistoryOpen(false)}
                className="touch-manipulation rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
              >
                关闭
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
              {poisonHistoryRows.length === 0 ? (
                <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  暂无记录
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                      <th className="py-2 pr-3 font-medium">姓名</th>
                      <th className="py-2 font-medium">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poisonHistoryRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80"
                      >
                        <td className="py-2.5 pr-3 align-top font-medium text-zinc-900 dark:text-zinc-100">
                          {row.name}
                        </td>
                        <td className="py-2.5 align-top tabular-nums text-zinc-600 dark:text-zinc-400">
                          {formatPoisonTime(row.at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
