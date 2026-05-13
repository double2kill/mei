import { Link, useLocation } from "react-router-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  hanziOrderIndexMatchRate,
  hanziShortageVsAnswer,
  hanziSurplusVsAnswer,
  loadSegmentPlayConfig,
  type SegmentPlayConfig,
} from "../test/segment-config";
import { shuffle } from "../test/quiz-config";

function shuffledAnswerChars(answer: string): string {
  const g = Array.from(answer);
  if (g.length === 0) return "";
  return shuffle(g).join("");
}

type SegmentPlayViewProps = {
  settingsTo?: string;
  segmentQuizId?: string;
};

type CheckRecord = {
  id: string;
  at: number;
  draft: string;
  percent: number;
  matched: number;
  total: number;
};

const MAX_CHECK_RECORDS = 100;

const publicBase =
  typeof import.meta.env.BASE_URL === "string" ? import.meta.env.BASE_URL : "/";
const meiGouAdSrc =
  (publicBase.endsWith("/") ? publicBase : `${publicBase}/`) + "mei-gou.png";

function newCheckId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `chk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function SegmentPlayView({
  settingsTo,
  segmentQuizId = "segment",
}: SegmentPlayViewProps) {
  const location = useLocation();
  const routeKeyRef = useRef(location.key);
  const [cfg, setCfg] = useState<SegmentPlayConfig>(() =>
    loadSegmentPlayConfig(segmentQuizId),
  );
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const answerShuffle = useMemo(
    () => shuffledAnswerChars(cfg.answerText),
    [cfg.answerText, shuffleNonce],
  );
  const [draft, setDraft] = useState("");
  const [checkHistory, setCheckHistory] = useState<CheckRecord[]>([]);
  const [adOpen, setAdOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const pendingVerifyRef = useRef<{
    draft: string;
    answerText: string;
  } | null>(null);
  const adVerifyConsumedRef = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastSel = useRef({ start: 0, end: 0 });
  const pendingCaret = useRef<number | null>(null);

  const captureSel = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    lastSel.current = {
      start: el.selectionStart,
      end: el.selectionEnd,
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingCaret.current == null) return;
    const pos = pendingCaret.current;
    pendingCaret.current = null;
    const el = taRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(pos, el.value.length));
    el.focus();
    el.setSelectionRange(clamped, clamped);
    lastSel.current = { start: clamped, end: clamped };
  }, [draft]);

  useEffect(() => {
    const c = loadSegmentPlayConfig(segmentQuizId);
    setCfg(c);
    setDraft("");
    setCheckHistory([]);
    setAdOpen(false);
    setAdCountdown(0);
    pendingVerifyRef.current = null;
    adVerifyConsumedRef.current = false;
    lastSel.current = { start: 0, end: 0 };
    pendingCaret.current = null;
    if (routeKeyRef.current !== location.key) {
      routeKeyRef.current = location.key;
      setShuffleNonce((n) => n + 1);
    }
  }, [location.key, segmentQuizId]);

  const shortageCards = useMemo(
    () => hanziShortageVsAnswer(cfg.answerText, draft, answerShuffle),
    [cfg.answerText, draft, answerShuffle],
  );

  const surplusCards = useMemo(
    () => hanziSurplusVsAnswer(cfg.answerText, draft),
    [cfg.answerText, draft],
  );

  const hanziBalanced = shortageCards.length === 0 && surplusCards.length === 0;

  const commitVerify = useCallback((draftSnap: string, answerText: string) => {
    const r = hanziOrderIndexMatchRate(answerText, draftSnap);
    const rec: CheckRecord = {
      id: newCheckId(),
      at: Date.now(),
      draft: draftSnap,
      percent: r.percent,
      matched: r.matched,
      total: r.total,
    };
    setCheckHistory((prev) => [rec, ...prev].slice(0, MAX_CHECK_RECORDS));
  }, []);

  useEffect(() => {
    if (!adOpen) return;
    if (adCountdown <= 0) {
      const p = pendingVerifyRef.current;
      pendingVerifyRef.current = null;
      setAdOpen(false);
      if (p && !adVerifyConsumedRef.current) {
        adVerifyConsumedRef.current = true;
        commitVerify(p.draft, p.answerText);
      }
      return;
    }
    const id = window.setTimeout(() => {
      setAdCountdown((c) => c - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [adOpen, adCountdown, commitVerify]);

  const onSubmit = useCallback(() => {
    adVerifyConsumedRef.current = false;
    pendingVerifyRef.current = { draft, answerText: cfg.answerText };
    setAdCountdown(3);
    setAdOpen(true);
  }, [draft, cfg.answerText]);

  const onReset = useCallback(() => {
    setDraft("");
    lastSel.current = { start: 0, end: 0 };
    pendingCaret.current = null;
  }, []);

  const insertAtCursor = useCallback((ch: string) => {
    if (!ch) return;
    setDraft((d) => {
      const el = taRef.current;
      const active = el != null && document.activeElement === el;
      let a = active ? el.selectionStart : lastSel.current.start;
      let b = active ? el.selectionEnd : lastSel.current.end;
      a = Math.max(0, Math.min(a, d.length));
      b = Math.max(a, Math.min(b, d.length));
      const next = d.slice(0, a) + ch + d.slice(b);
      const pos = a + ch.length;
      pendingCaret.current = pos;
      lastSel.current = { start: pos, end: pos };
      return next;
    });
  }, []);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-zinc-100 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-5">
        <header className="mb-4 shrink-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl md:text-2xl">
                {cfg.title.trim() || "每日排段"}
              </h1>
            </div>
            {settingsTo ? (
              <Link
                to={settingsTo}
                className="touch-manipulation shrink-0 self-start rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
              >
                设置
              </Link>
            ) : null}
          </div>
        </header>

        <section className="mb-5 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            1. 参考答案（随机打乱）
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            提示：上方为全文字符随机打乱。「校验汉字」按汉字顺序与参考答案原文逐位比对得到匹配度；每次校验会在下方追加一条记录（原文为当时输入、列为匹配度）。标点不参与。字卡仍提示汉字个数是否与原文一致。
          </p>
          <p className="whitespace-pre-wrap break-all text-base leading-relaxed font-medium text-zinc-900 dark:text-zinc-100">
            {answerShuffle}
          </p>
        </section>

        <section className="mb-4 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            2. 输入重排后的文字
          </h2>
          <div className="space-y-4">
            {shortageCards.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                  还差的汉字
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {shortageCards.map((item) => (
                    <li key={`short-${item.char}`} className="list-none">
                      <button
                        type="button"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => insertAtCursor(item.char)}
                        aria-label={
                          item.remaining > 1
                            ? `插入${item.char}，还差${item.remaining}个`
                            : `插入${item.char}`
                        }
                        className="touch-manipulation relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border-2 border-amber-200 bg-amber-50/90 px-2 py-1.5 shadow-sm select-none active:opacity-90 dark:border-amber-700/60 dark:bg-amber-950/40"
                      >
                        <span className="text-xl font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                          {item.char}
                        </span>
                        {item.remaining > 1 ? (
                          <span className="pointer-events-none absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow dark:bg-amber-500">
                            {item.remaining}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {surplusCards.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                  多写的汉字
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {surplusCards.map((item) => (
                    <li key={`sur-${item.char}`} className="list-none">
                      <button
                        type="button"
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => insertAtCursor(item.char)}
                        aria-label={
                          item.surplus > 1
                            ? `插入${item.char}，多${item.surplus}个`
                            : `插入${item.char}`
                        }
                        className="touch-manipulation relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border-2 border-red-200 bg-red-50/90 px-2 py-1.5 shadow-sm select-none active:opacity-90 dark:border-red-800/55 dark:bg-red-950/35"
                      >
                        <span className="text-xl font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                          {item.char}
                        </span>
                        {item.surplus > 1 ? (
                          <span className="pointer-events-none absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow dark:bg-red-500">
                            {item.surplus}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {hanziBalanced ? (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                已全部填写
              </p>
            ) : null}
          </div>
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              lastSel.current = {
                start: e.target.selectionStart,
                end: e.target.selectionEnd,
              };
            }}
            onSelect={captureSel}
            onClick={captureSel}
            onKeyUp={captureSel}
            rows={4}
            className="min-h-28 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={adOpen}
              onClick={onSubmit}
              className="touch-manipulation min-h-11 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white active:opacity-90 disabled:opacity-45 dark:bg-zinc-100 dark:text-zinc-900"
            >
              校验汉字
            </button>
            <button
              type="button"
              onClick={onReset}
              className="touch-manipulation min-h-11 rounded-lg border border-zinc-300 px-5 text-sm font-medium active:bg-zinc-100 dark:border-zinc-600 dark:active:bg-zinc-800"
            >
              清空
            </button>
          </div>
          {checkHistory.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/80">
              <div className="grid grid-cols-2 gap-0 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span>原文</span>
                <span>匹配度</span>
              </div>
              <ul className="max-h-72 overflow-y-auto bg-white dark:bg-zinc-950">
                {checkHistory.map((rec) => (
                  <li
                    key={rec.id}
                    className="grid grid-cols-2 gap-0 border-b border-zinc-100 px-3 py-2.5 text-sm last:border-b-0 dark:border-zinc-800/80"
                  >
                    <div className="min-w-0 pr-2">
                      <time
                        dateTime={new Date(rec.at).toISOString()}
                        className="mb-1 block text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500"
                      >
                        {new Date(rec.at).toLocaleString()}
                      </time>
                      <p className="max-h-28 overflow-y-auto whitespace-pre-wrap break-words text-zinc-900 dark:text-zinc-100">
                        {rec.draft.length > 0 ? rec.draft : "（空）"}
                      </p>
                    </div>
                    <div className="flex min-w-0 flex-col justify-center tabular-nums">
                      <span
                        className={`text-base font-semibold ${
                          rec.percent >= 100
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {rec.percent}%
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {rec.matched}/{rec.total} 位
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              每次点击「校验汉字」会在此追加一条记录（原文为当时输入内容）。
            </p>
          )}
        </section>
      </div>
      {adOpen ? (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="segment-ad-title"
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
            <img
              src={meiGouAdSrc}
              alt=""
              className="max-h-[55vh] w-full object-contain"
            />
            <div className="border-t border-zinc-200 px-4 py-4 text-center dark:border-zinc-700">
              <p
                id="segment-ad-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
              >
                {adCountdown > 0 ? `${adCountdown} 秒后开始校验` : "正在校验"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
