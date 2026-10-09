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
  getKnownVictimNames,
  getPoisonHistory,
  removePoisonRecord,
  type PoisonClickStep,
  type PoisonRecord,
} from "../test/poison-history";
import {
  addPlayerName,
  getPlayerNames,
  removePlayerName,
} from "../test/player-names";

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

const DRAWER_MS = 200;

function useSideDrawer(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setShown(true));
      });
      return () => window.cancelAnimationFrame(id);
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), DRAWER_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  return { mounted, shown };
}

const iconClass = "h-4 w-4 shrink-0";

function IconWrench({ className = iconClass }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
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

function IconClose({ className = iconClass }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconRefresh({ className = iconClass }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M21 12a9 9 0 1 1-2.6-6.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21 3v6h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPen({ className = iconClass }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
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

export type PoisonCountHostProps = {
  value: number;
  max: number;
  onCommit: (n: number) => void;
};

export type QuizPlayViewProps = {
  getRoundConfig: () => QuizConfig;
  settingsTo?: string;
  toolbar?: ReactNode;
  poisonCountHost?: PoisonCountHostProps;
  roundRefreshSignal?: number;
  compact?: boolean;
};

export function QuizPlayView({
  getRoundConfig,
  settingsTo,
  toolbar,
  poisonCountHost,
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
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [playerNameDraft, setPlayerNameDraft] = useState("");
  const [poisonCountDraft, setPoisonCountDraft] = useState(() =>
    String(poisonCountHost?.value ?? 1),
  );
  const [poisonHistoryOpen, setPoisonHistoryOpen] = useState(false);
  const [poisonHistoryRows, setPoisonHistoryRows] = useState<PoisonRecord[]>(
    [],
  );
  const [pathReplay, setPathReplay] = useState<PoisonRecord | null>(null);
  const [clickPath, setClickPath] = useState<PoisonClickStep[]>([]);
  const [previewPoisons, setPreviewPoisons] = useState(false);
  const [hostToolsOpen, setHostToolsOpen] = useState(false);
  const [hitModalOpen, setHitModalOpen] = useState(false);
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
    setPathReplay(null);
    setClickPath([]);
    setPreviewPoisons(false);
    setHitModalOpen(false);
    setSaveToast(null);
    setRemaining(c.timeLimitSec);
  }, []);

  useEffect(() => {
    if (poisonCountHost) setPoisonCountDraft(String(poisonCountHost.value));
  }, [poisonCountHost?.value]);

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

  const openPathReplay = useCallback((row: PoisonRecord) => {
    if (row.clicks.length === 0) {
      setSaveToast("该记录无点击路径");
      return;
    }
    setPathReplay(row);
    setPoisonHistoryOpen(false);
  }, []);

  const onDeletePoisonRecord = useCallback(
    (row: PoisonRecord) => {
      if (!removePoisonRecord(row.id)) return;
      setPoisonHistoryRows(getPoisonHistory());
      setPathReplay((prev) => (prev?.id === row.id ? null : prev));
    },
    [],
  );

  const refreshPlayerNames = useCallback(() => {
    let names = getPlayerNames();
    if (names.length === 0) {
      for (const name of getKnownVictimNames().slice().reverse()) {
        addPlayerName(name);
      }
      names = getPlayerNames();
    }
    setPlayerNames(names);
  }, []);

  const onSaveVictim = useCallback(() => {
    const hitNames = clickPath.filter((s) => s.isMine).map((s) => s.name);
    if (
      !appendPoisonRecord(victimName, {
        clicks: clickPath,
        hitNames,
        taunt: mineTaunt,
      })
    ) {
      return;
    }
    addPlayerName(victimName);
    setVictimName("");
    setSaveToast("保存成功");
    setHitModalOpen(false);
    refreshPlayerNames();
    if (poisonHistoryOpen) setPoisonHistoryRows(getPoisonHistory());
  }, [
    victimName,
    clickPath,
    mineTaunt,
    poisonHistoryOpen,
    refreshPlayerNames,
  ]);

  const onAddPlayerName = useCallback(() => {
    if (!addPlayerName(playerNameDraft)) return;
    setPlayerNameDraft("");
    refreshPlayerNames();
  }, [playerNameDraft, refreshPlayerNames]);

  const onRemovePlayerName = useCallback(
    (name: string) => {
      removePlayerName(name);
      refreshPlayerNames();
    },
    [refreshPlayerNames],
  );

  const onCommitPoisonCount = useCallback(() => {
    if (!poisonCountHost) return;
    if (!poisonCountDraft.trim()) {
      setPoisonCountDraft(String(poisonCountHost.value));
      return;
    }
    const next = Math.min(
      poisonCountHost.max,
      Math.max(1, Math.floor(Number(poisonCountDraft)) || 1),
    );
    setPoisonCountDraft(String(next));
    if (next !== poisonCountHost.value) poisonCountHost.onCommit(next);
  }, [poisonCountHost, poisonCountDraft]);

  useEffect(() => {
    if (!(lost && loseKind === "mine")) return;
    refreshPlayerNames();
  }, [lost, loseKind, refreshPlayerNames]);

  useEffect(() => {
    if (!hostToolsOpen) return;
    refreshPlayerNames();
    if (poisonCountHost) setPoisonCountDraft(String(poisonCountHost.value));
  }, [hostToolsOpen, refreshPlayerNames, poisonCountHost]);

  useEffect(() => {
    if (!saveToast) return;
    const id = window.setTimeout(() => setSaveToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [saveToast]);

  useEffect(() => {
    if (!poisonHistoryOpen && !hostToolsOpen && !hitModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (poisonHistoryOpen) setPoisonHistoryOpen(false);
      else if (hitModalOpen) setHitModalOpen(false);
      else setHostToolsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [poisonHistoryOpen, hostToolsOpen, hitModalOpen]);

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
      setClickPath((prev) => [
        ...prev,
        { name: cell.name, isMine: !cell.safe },
      ]);
      if (!cell.safe) {
        setRevealedMineKeys((prev) => {
          const next = new Set(prev).add(cell.key);
          const endFromMines =
            useAllMinesRule && minesTotal >= 2 ? next.size >= minesTotal : true;
          if (endFromMines) {
            setLost(true);
            setLoseKind("mine");
            setHitModalOpen(true);
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
  const hostToolsDrawer = useSideDrawer(compact && hostToolsOpen);
  const poisonHistoryDrawer = useSideDrawer(poisonHistoryOpen);
  const replayOrderByName = useMemo(() => {
    const map = new Map<string, number>();
    if (!pathReplay) return map;
    pathReplay.clicks.forEach((step, i) => {
      if (!map.has(step.name)) map.set(step.name, i + 1);
    });
    return map;
  }, [pathReplay]);
  const replayHitNames = useMemo(() => {
    if (!pathReplay) return new Set<string>();
    return new Set(pathReplay.hitNames);
  }, [pathReplay]);

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

  const poisonHistoryButton = (
    <button
      type="button"
      onClick={openPoisonHistory}
      className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 active:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
    >
      <IconHistory />
      中毒历史
    </button>
  );

  const modeSection = (
    <div className="flex flex-col gap-2">
      <div
        role="tablist"
        aria-label="模式"
        className="inline-flex w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "quick"}
          onClick={() => setMode("quick")}
          className={`inline-flex touch-manipulation flex-1 items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold transition ${
            mode === "quick"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-800"
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
          className={`inline-flex touch-manipulation flex-1 items-center justify-center gap-1.5 px-3 py-3 text-sm font-semibold transition disabled:opacity-45 ${
            mode === "clear"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-800"
          }`}
        >
          <IconShield />
          百毒不侵
        </button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        {mode === "clear" ? "需点齐全部毒药才结束" : "踩中任意毒药立刻结束"}
        {!allowClearMode ? "（当前仅 1 个毒药）" : ""}
      </p>
    </div>
  );

  const poisonCountSection = poisonCountHost ? (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2">
        <span className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
          数量
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={poisonCountHost.max}
          value={poisonCountDraft}
          onChange={(e) => setPoisonCountDraft(e.target.value)}
          onBlur={onCommitPoisonCount}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="h-8 w-12 rounded-md border border-zinc-200 bg-white px-1 text-center text-sm tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        />
        <span className="text-sm text-zinc-500">/ {poisonCountHost.max}</span>
      </label>
    </div>
  ) : toolbar ? (
    <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
  ) : null;

  const playerNamesSection = (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-600 dark:bg-zinc-900">
      {playerNames.map((name) => (
        <span
          key={name}
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-zinc-100 py-1 pl-2.5 pr-1 text-sm font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <span className="min-w-0 truncate">{name}</span>
          <button
            type="button"
            aria-label={`删除 ${name}`}
            onClick={() => onRemovePlayerName(name)}
            className="touch-manipulation inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-500 active:bg-zinc-200 active:text-zinc-800 dark:text-zinc-400 dark:active:bg-zinc-700 dark:active:text-zinc-100"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        value={playerNameDraft}
        onChange={(e) => setPlayerNameDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAddPlayerName();
            return;
          }
          if (e.key === "Backspace" && !playerNameDraft && playerNames.length > 0) {
            onRemovePlayerName(playerNames[playerNames.length - 1]!);
          }
        }}
        onBlur={() => {
          if (playerNameDraft.trim()) onAddPlayerName();
        }}
        placeholder={playerNames.length === 0 ? "输入姓名后回车" : "继续添加"}
        className="min-h-8 w-28 max-w-36 shrink-0 rounded-md border border-dashed border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-400 dark:border-zinc-600 dark:bg-white dark:text-zinc-900 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
      />
    </div>
  );

  const hostPanel = (
    <div className="mb-3 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
      {modeSection}
      {poisonCountSection ? (
        <>
          <div className="h-px w-full bg-zinc-200/70 dark:bg-zinc-700/70" />
          {poisonCountSection}
        </>
      ) : null}
      {settingsTo ? (
        <>
          <div className="h-px w-full bg-zinc-200/70 dark:bg-zinc-700/70" />
          <Link
            to={settingsTo}
            className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-300"
          >
            <IconSettings />
            题目设置
          </Link>
        </>
      ) : null}
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
                  onClick={() => setHostToolsOpen(true)}
                  className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 active:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:active:bg-zinc-800"
                >
                  <IconWrench />
                  主持人工具
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

        {!compact && (toolbar || poisonCountHost || settingsTo) ? hostPanel : null}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums text-zinc-600 dark:text-zinc-400">
            {pathReplay ? (
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                查看 {pathReplay.name} 的中毒路径
              </span>
            ) : (
              <>
                <span>
                  已点 {progress}
                  {safeTotal > 0
                    ? ` · 还剩 ${Math.max(0, safeTotal - progress)}`
                    : ""}
                </span>
                {minesTotal >= 2 ? (
                  <span>毒药剩 {minesRemaining}</span>
                ) : null}
              </>
            )}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {pathReplay ? (
              <button
                type="button"
                onClick={() => setPathReplay(null)}
                className="touch-manipulation inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 active:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <IconClose />
                退出查看
              </button>
            ) : null}
            {poisonHistoryButton}
            {poisonPreviewButton}
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
              const replayOrder = replayOrderByName.get(cell.name);
              const replayHit = replayHitNames.has(cell.name);
              const inReplayPath = replayOrder != null;

              return (
                <button
                  key={cell.key}
                  type="button"
                  disabled={ended || isRevealedSafe || mineRevealed}
                  onClick={() => onCellClick(cell)}
                  className={`relative touch-manipulation flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-0.5 py-2 text-center transition select-none active:opacity-90 sm:gap-1 sm:py-2.5 ${
                    compact ? "min-h-20 sm:min-h-20" : "min-h-17 sm:min-h-20"
                  } ${
                    pathReplay && replayHit
                      ? "border-2 border-red-500 bg-red-500/15 dark:border-red-400 dark:bg-red-500/20"
                      : pathReplay && inReplayPath
                        ? "border-2 border-sky-500 bg-sky-500/15 dark:border-sky-400 dark:bg-sky-500/20"
                        : greenPicked
                          ? "border-emerald-700 bg-emerald-600/32 shadow-sm dark:border-emerald-400 dark:bg-emerald-500/35"
                          : greenUnpickedSafe
                            ? "border-2 border-emerald-300 bg-transparent dark:border-emerald-600/45 dark:bg-transparent"
                            : showRed
                              ? `${mineRevealed ? "border-2 border-red-500 bg-red-500/15 dark:border-red-400 dark:bg-red-500/20" : "border-2 border-red-200 bg-transparent dark:border-red-700/45 dark:bg-transparent"}`
                              : dimOthers
                                ? "border-zinc-200/50 opacity-35 dark:border-zinc-800"
                                : "border-zinc-300 bg-zinc-50 active:scale-[0.98] dark:border-zinc-600 dark:bg-zinc-900"
                  } ${ended && !poisonReveal && !showGreen && !showRed && cell.safe && !pathReplay ? "opacity-50" : ""} ${
                    pathReplay && !inReplayPath ? "opacity-45" : ""
                  }`}
                >
                  {replayOrder != null ? (
                    <span
                      className={`absolute top-1 right-1 z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold tabular-nums text-white ${
                        replayHit ? "bg-red-600" : "bg-sky-600"
                      }`}
                    >
                      {replayOrder}
                    </span>
                  ) : null}
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
          <div className="mx-auto mt-3 flex w-full max-w-md shrink-0 flex-wrap items-center justify-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {won ? (
              <p className="w-full text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                全部安全，本轮完成
              </p>
            ) : null}
            {lost && loseKind === "time" ? (
              <p className="w-full text-center text-sm font-medium text-amber-600 dark:text-amber-400">
                时间到
              </p>
            ) : null}
            {lost && loseKind === "mine" && !hitModalOpen ? (
              <button
                type="button"
                onClick={() => setHitModalOpen(true)}
                className="touch-manipulation inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-base font-medium text-zinc-800 active:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:active:bg-zinc-800"
              >
                <IconPen />
                记录中毒者
              </button>
            ) : null}
            <button
              type="button"
              onClick={resetRound}
              className="touch-manipulation inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-base font-medium text-white active:opacity-90 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <IconRefresh />
              重开
            </button>
          </div>
        ) : null}
      </div>

      {saveToast ? (
        <div
          role="status"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-70 max-w-sm -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-3 text-center text-sm font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saveToast}
        </div>
      ) : null}

      {hitModalOpen && showMineVictimForm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setHitModalOpen(false)}
        >
          <div
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-result-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2
                id="round-result-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
              >
                记录中毒者
              </h2>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setHitModalOpen(false)}
                className="touch-manipulation inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-5 px-5 py-5">
              {showMineTauntBlock ? (
                <p className="text-xl leading-relaxed font-medium text-red-600 sm:text-2xl dark:text-red-400">
                  {mineTaunt}
                </p>
              ) : null}
              <label className="block">
                <span className="mb-2 block text-base font-medium text-zinc-600 dark:text-zinc-400">
                  姓名
                </span>
                <input
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  autoComplete="name"
                  placeholder="输入或点选下方姓名"
                  className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
                />
              </label>
              {playerNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {playerNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setVictimName(name)}
                      className={`touch-manipulation rounded-lg px-3 py-1.5 text-base transition active:scale-[0.98] ${
                        victimName.trim() === name
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-700 active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:active:bg-zinc-700"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                disabled={!victimName.trim()}
                onClick={onSaveVictim}
                className="touch-manipulation h-12 w-full rounded-lg bg-zinc-900 text-base font-medium text-white active:opacity-90 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {hostToolsDrawer.mounted ? (
        <div
          className={`fixed inset-0 z-50 flex justify-end transition-colors duration-200 ${
            hostToolsDrawer.shown ? "bg-black/40" : "bg-black/0"
          }`}
          onClick={() => setHostToolsOpen(false)}
          role="presentation"
        >
          <aside
            className={`flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl transition-transform duration-200 ease-out sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-900 ${
              hostToolsDrawer.shown ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="host-tools-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <h2
                id="host-tools-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
              >
                主持人工具
              </h2>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setHostToolsOpen(false)}
                className="touch-manipulation inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-6 overflow-auto px-4 py-4">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  1. 选择模式
                </h3>
                {modeSection}
              </section>
              {poisonCountSection ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    2. 设置毒药数量
                  </h3>
                  {poisonCountSection}
                </section>
              ) : null}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {poisonCountSection ? "3" : "2"}. 管理玩家姓名
                </h3>
                {playerNamesSection}
              </section>
              {settingsTo ? (
                <section>
                  <Link
                    to={settingsTo}
                    className="inline-flex touch-manipulation items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-300"
                  >
                    <IconSettings />
                    题目设置
                  </Link>
                </section>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}

      {poisonHistoryDrawer.mounted ? (
        <div
          className={`fixed inset-0 z-50 flex justify-end transition-colors duration-200 ${
            poisonHistoryDrawer.shown ? "bg-black/40" : "bg-black/0"
          }`}
          onClick={() => setPoisonHistoryOpen(false)}
          role="presentation"
        >
          <aside
            className={`flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-xl transition-transform duration-200 ease-out sm:max-w-lg dark:border-zinc-800 dark:bg-zinc-900 ${
              poisonHistoryDrawer.shown ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="poison-history-title"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2
                id="poison-history-title"
                className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
              >
                历史中毒记录
              </h2>
              <button
                type="button"
                aria-label="关闭"
                onClick={() => setPoisonHistoryOpen(false)}
                className="touch-manipulation inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
              {poisonHistoryRows.length === 0 ? (
                <p className="py-10 text-center text-base text-zinc-500 dark:text-zinc-400">
                  暂无记录
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {poisonHistoryRows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-stretch gap-2 rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <button
                        type="button"
                        onClick={() => openPathReplay(row)}
                        className="touch-manipulation min-w-0 flex-1 rounded-lg px-2 py-2 text-left transition active:bg-zinc-50 dark:active:bg-zinc-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            {row.name}
                          </span>
                          <span className="shrink-0 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                            {formatPoisonTime(row.at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {row.clicks.length > 0
                            ? `共 ${row.clicks.length} 步 · 点击回主界面查看`
                            : "旧记录无点击路径"}
                        </p>
                      </button>
                      <button
                        type="button"
                        aria-label={`删除 ${row.name}`}
                        onClick={() => onDeletePoisonRecord(row)}
                        className="touch-manipulation shrink-0 self-center rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 active:bg-zinc-100 active:text-zinc-800 dark:text-zinc-400 dark:active:bg-zinc-800 dark:active:text-zinc-100"
                      >
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
