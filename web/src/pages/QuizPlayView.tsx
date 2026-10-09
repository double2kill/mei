import { Link } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
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

const iconClass = "h-4 w-4 shrink-0";

function IconWrench({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClock({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHistory({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 12a9 9 0 1 0 3-6.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 4v5h5M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconBolt({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevronUp({ className = iconClass }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m6 14 6-6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  toolbar?: ReactNode;
  roundRefreshSignal?: number;
  compact?: boolean;
};

export function QuizPlayView({
  getRoundConfig,
  settingsTo,
  toolbar,
  roundRefreshSignal,
  compact = false,
}: QuizPlayViewProps) {
  const getRoundRef = useRef(getRoundConfig);
  getRoundRef.current = getRoundConfig;

  const [cfg, setCfg] = useState<QuizConfig>(() => getRoundConfig());
  const [cells, setCells] = useState<Cell[]>([]);
  const [revealedSafe, setRevealedSafe] = useState<Set<string>>(
    () => new Set(),
  );
  const [revealedMineKeys, setRevealedMineKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [mode, setMode] = useState<"quick" | "clear">("quick");
  const modeInitRef = useRef(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [loseKind, setLoseKind] = useState<null | "mine" | "time">(null);
  const [mineTaunt, setMineTaunt] = useState("");
  const [victimName, setVictimName] = useState("");
  const [poisonHistoryOpen, setPoisonHistoryOpen] = useState(false);
  const [poisonHistoryRows, setPoisonHistoryRows] = useState<PoisonRecord[]>(
    [],
  );
  const [previewPoisons, setPreviewPoisons] = useState(false);
  const [hostToolsOpen, setHostToolsOpen] = useState(!compact);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(cfg.timeLimitSec);

  const { safe: safeTotal, mines: minesTotal } = useMemo(
    () => countSafeMines(cfg.options),
    [cfg.options],
  );
  const allowClearMode = minesTotal >= 2;
  const useAllMinesRule = mode === "clear" && allowClearMode;

  const applyRound = useCallback(() => {
    const c = getRoundRef.current();
    setCfg(c);
    setCells(optionsToCells(c.options));
    setRevealedSafe(new Set());
    setRevealedMineKeys(new Set());
    setWon(false);
    setLost(false);
    setLoseKind(null);
    setMineTaunt("");
    setVictimName("");
    setPoisonHistoryOpen(false);
    setPreviewPoisons(false);
    setSaveToast(null);
    setRemaining(c.timeLimitSec);
  }, []);

  useEffect(() => {
    setHostToolsOpen(!compact);
  }, [compact]);

  useEffect(() => {
    applyRound();
  }, [applyRound]);

  useEffect(() => {
    if (roundRefreshSignal === undefined || roundRefreshSignal === 0) return;
    applyRound();
  }, [roundRefreshSignal, applyRound]);

  const tags = useMemo(() => parseTags(cfg.tagInput), [cfg.tagInput]);

  useEffect(() => {
    if (!allowClearMode && mode === "clear") setMode("quick");
  }, [allowClearMode, mode]);

  useEffect(() => {
    if (!modeInitRef.current) {
      modeInitRef.current = true;
      return;
    }
    applyRound();
  }, [mode, applyRound]);

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
      setRevealedMineKeys(
        new Set(cells.filter((c) => !c.safe).map((c) => c.key)),
      );
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
      if (won || lost) return;
      if (revealedSafe.has(cell.key)) return;
      if (revealedMineKeys.has(cell.key)) return;
      if (!cell.safe) {
        setRevealedMineKeys((prev) => {
          const next = new Set(prev).add(cell.key);
          const endFromMines =
            useAllMinesRule && minesTotal >= 2 ? next.size >= minesTotal : true;
          if (endFromMines) {
            setLost(true);
            setLoseKind("mine");
            setMineTaunt(
              pickRandomMineTaunt({
                revealedSafeCount: revealedSafe.size,
                safeTotal,
              }),
            );
          }
          return next;
        });
        return;
      }
      setRevealedSafe((prev) => new Set(prev).add(cell.key));
    },
    [
      won,
      lost,
      revealedSafe,
      revealedMineKeys,
      useAllMinesRule,
      minesTotal,
      safeTotal,
    ],
  );

  const ended = won || lost;
  const poisonReveal = lost && loseKind === "mine";
  const showAllPoisons = poisonReveal || previewPoisons;
  const progress = revealedSafe.size;

  const startPoisonPreview = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (ended) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setPreviewPoisons(true);
    },
    [ended],
  );

  const endPoisonPreview = useCallback(() => {
    setPreviewPoisons(false);
  }, []);
  const mineProgress = revealedMineKeys.size;
  const minesRemaining = Math.max(0, minesTotal - mineProgress);
  const showMineTauntBlock =
    lost && loseKind === "mine" && mineTaunt.length > 0;
  const showMineVictimForm = lost && loseKind === "mine";

  const poisonPreviewButton = !ended ? (
    <button
      type="button"
      aria-pressed={previewPoisons}
      onPointerDown={startPoisonPreview}
      onPointerUp={endPoisonPreview}
      onPointerCancel={endPoisonPreview}
      onLostPointerCapture={endPoisonPreview}
      onContextMenu={(e) => e.preventDefault()}
      className={`inline-flex touch-manipulation select-none items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition active:scale-[0.98] ${
        previewPoisons
          ? "border-red-400 bg-red-500/15 text-red-700 dark:border-red-500 dark:bg-red-500/20 dark:text-red-300"
          : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      <IconEye />
      长按预览毒药
    </button>
  ) : null;

  const hostPanel = (
    <div className="mb-3 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
      {toolbar ? (
        <>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div
              role="tablist"
              aria-label="模式"
              className="inline-flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950 sm:w-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "quick"}
                onClick={() => setMode("quick")}
                className={`inline-flex touch-manipulation flex-1 items-center justify-center gap-1.5 px-5 py-3 text-base font-semibold transition sm:flex-none ${
                  mode === "quick"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
                }`}
              >
                <IconBolt />
                一触即亡
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "clear"}
                disabled={!allowClearMode}
                onClick={() => setMode("clear")}
                className={`inline-flex touch-manipulation flex-1 items-center justify-center gap-1.5 px-5 py-3 text-base font-semibold transition disabled:opacity-45 sm:flex-none ${
                  mode === "clear"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
                }`}
              >
                <IconShield />
                百毒不侵
              </button>
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-500">
              {mode === "clear"
                ? "需点齐全部毒药才结束"
                : "踩中任意毒药立刻结束"}
              {!allowClearMode ? "（当前仅 1 个毒药）" : ""}
            </span>
          </div>
          <div className="h-px w-full bg-zinc-200/70 dark:bg-zinc-700/70" />
          <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
        </>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPoisonHistory}
          className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200 dark:active:bg-zinc-800"
        >
          <IconHistory />
          历史中毒记录
        </button>
        {poisonPreviewButton}
        {settingsTo ? (
          <Link
            to={settingsTo}
            className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-300"
          >
            <IconSettings />
            题目设置
          </Link>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-zinc-100 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-5">
        <header className={`shrink-0 ${compact ? "mb-3 space-y-2" : "mb-4 space-y-3"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1
                className={`font-semibold leading-snug tracking-tight ${
                  compact
                    ? "text-base sm:text-lg"
                    : "text-lg sm:text-xl md:text-2xl"
                }`}
              >
                {cfg.title.trim() || "未命名测验"}
              </h1>
              {cfg.desc.trim() && !compact ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
                  {cfg.desc}
                </p>
              ) : null}
              {cfg.desc.trim() && compact && hostToolsOpen ? (
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {cfg.desc}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <time
                dateTime={`PT${remaining}S`}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium tabular-nums ${
                  remaining <= 60 && !ended
                    ? "bg-red-500/15 text-red-700 dark:text-red-300"
                    : "bg-zinc-200/80 dark:bg-zinc-800"
                }`}
              >
                <IconClock />
                {formatSeconds(remaining)}
              </time>
              {compact ? (
                <button
                  type="button"
                  aria-expanded={hostToolsOpen}
                  onClick={() => setHostToolsOpen((v) => !v)}
                  className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 active:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:active:bg-zinc-800"
                >
                  {hostToolsOpen ? <IconChevronUp /> : <IconWrench />}
                  {hostToolsOpen ? "收起" : "主持人工具"}
                </button>
              ) : null}
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

        {compact ? (hostToolsOpen ? hostPanel : null) : null}
        {!compact ? (
          <>
            {toolbar || settingsTo ? hostPanel : null}
            {!toolbar && !settingsTo ? (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={openPoisonHistory}
                  className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 active:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <IconHistory />
                  查看历史中毒记录
                </button>
                {poisonPreviewButton}
              </div>
            ) : null}
          </>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums text-zinc-600 dark:text-zinc-400">
            <span>
              安全 {progress}/{Math.max(safeTotal, 0)}
            </span>
            {minesTotal >= 2 ? (
              <span>
                毒药 {mineProgress}/{Math.max(minesTotal, 0)}（剩 {minesRemaining}
                ）
              </span>
            ) : null}
          </span>
          <div className="flex items-center gap-2">
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
        </div>

        <div className="w-full pb-2">
          <div
            className={`grid w-full gap-2 sm:gap-2.5 ${
              compact ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-6"
            }`}
          >
            {cells.map((cell, cellIndex) => {
              const isRevealedSafe = revealedSafe.has(cell.key);
              const mineRevealed = !cell.safe && revealedMineKeys.has(cell.key);
              const showGreen = poisonReveal ? cell.safe : isRevealedSafe;
              const showRed = showAllPoisons ? !cell.safe : mineRevealed;
              const dimOthers = ended && !showGreen && !showRed && !cell.safe;
              const greenPicked = showGreen && isRevealedSafe;
              const greenUnpickedSafe =
                showGreen && cell.safe && !isRevealedSafe;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={ended || isRevealedSafe || mineRevealed}
                  onClick={() => onCellClick(cell)}
                  className={`touch-manipulation flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-2 text-center transition select-none active:opacity-90 sm:gap-1 sm:py-2.5 ${
                    compact ? "min-h-20 sm:min-h-20" : "min-h-17 sm:min-h-20"
                  } ${
                    greenPicked
                      ? "border-emerald-700 bg-emerald-600/32 shadow-sm dark:border-emerald-400 dark:bg-emerald-500/35"
                      : greenUnpickedSafe
                        ? "border-2 border-emerald-300 bg-transparent dark:border-emerald-600/45 dark:bg-transparent"
                        : showRed
                          ? `${mineRevealed ? "border-2 border-red-500 bg-red-500/15 dark:border-red-400 dark:bg-red-500/20" : "border-2 border-red-200 bg-transparent dark:border-red-700/45 dark:bg-transparent"}`
                          : dimOthers
                            ? "border-zinc-200/50 opacity-35 dark:border-zinc-800"
                            : "border-zinc-300 bg-zinc-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-900"
                  } ${ended && !poisonReveal && !showGreen && !showRed && cell.safe ? "opacity-50" : ""}`}
                >
                  <span
                    className={`tabular-nums text-xs font-semibold leading-none sm:text-sm ${
                      greenPicked
                        ? "text-emerald-900 dark:text-emerald-200"
                        : greenUnpickedSafe
                          ? "text-emerald-700/90 dark:text-emerald-400"
                          : showRed
                            ? "text-red-400/90 dark:text-red-400/90"
                            : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {cellIndex + 1}
                  </span>
                  <span
                    className={`w-full wrap-break-word text-center text-lg font-semibold leading-snug sm:text-xl md:text-2xl ${
                      greenPicked
                        ? "text-emerald-950 dark:text-emerald-50"
                        : greenUnpickedSafe
                          ? "text-emerald-800 dark:text-emerald-200"
                          : showRed
                            ? "text-red-700 dark:text-red-300"
                            : ""
                    }`}
                  >
                    {cell.name}
                  </span>
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
                    中毒者姓名
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
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-60 max-w-sm -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
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
