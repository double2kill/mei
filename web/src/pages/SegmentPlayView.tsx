import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  hanziOrderIndexMatchRate,
  loadSegmentPlayConfig,
  type SegmentPlayConfig,
} from "../test/segment-config";
import { shuffledAnswerChars } from "../test/hanzi-shuffle";
import { surplusSubmitMessage } from "../test/hanzi-play-messages";
import { useHanziDraftEditor } from "../hooks/useHanziDraftEditor";
import { useHanziBalance } from "../hooks/useHanziBalance";
import { HanziInputSection } from "../components/hanzi-play/HanziInputSection";
import {
  HanziPlayLayout,
  HanziPlayHeader,
  HanziReferenceSection,
} from "../components/hanzi-play/HanziPlayLayout";
import { ToastPopup } from "../components/ToastPopup";

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
  const {
    draft,
    taRef,
    insertAtCursor,
    resetDraft,
    captureSel,
    onTextareaChange,
  } = useHanziDraftEditor();
  const [checkHistory, setCheckHistory] = useState<CheckRecord[]>([]);
  const [adOpen, setAdOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const pendingVerifyRef = useRef<{
    draft: string;
    answerText: string;
  } | null>(null);
  const adVerifyConsumedRef = useRef(false);

  const { shortageCards, surplusCards, hanziBalanced } = useHanziBalance(
    cfg.answerText,
    draft,
    answerShuffle,
  );

  useEffect(() => {
    const c = loadSegmentPlayConfig(segmentQuizId);
    setCfg(c);
    setCheckHistory([]);
    setAdOpen(false);
    setAdCountdown(0);
    pendingVerifyRef.current = null;
    adVerifyConsumedRef.current = false;
    resetDraft();
    if (routeKeyRef.current !== location.key) {
      routeKeyRef.current = location.key;
      setShuffleNonce((n) => n + 1);
    }
  }, [location.key, segmentQuizId, resetDraft]);

  const answerRevealed = useMemo(
    () => checkHistory.some((r) => r.percent >= 50),
    [checkHistory],
  );

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

  const startVerify = useCallback(() => {
    adVerifyConsumedRef.current = false;
    pendingVerifyRef.current = { draft, answerText: cfg.answerText };
    setAdCountdown(3);
    setAdOpen(true);
  }, [draft, cfg.answerText]);

  const verifyBlocked = adOpen || surplusCards.length > 0;

  const tryVerify = useCallback(() => {
    if (adOpen) return;
    if (surplusCards.length > 0) {
      setToast(surplusSubmitMessage(surplusCards, "校验"));
      return;
    }
    startVerify();
  }, [adOpen, surplusCards, startVerify]);

  return (
    <HanziPlayLayout
      header={
        <HanziPlayHeader
          title={cfg.title.trim() || "每日排段"}
          trailing={
            settingsTo ? (
              <Link
                to={settingsTo}
                className="touch-manipulation shrink-0 self-start rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
              >
                设置
              </Link>
            ) : null
          }
        />
      }
      overlay={
        adOpen ? (
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
                  {adCountdown > 0
                    ? `${adCountdown} 秒后开始校验`
                    : "正在校验"}
                </p>
              </div>
            </div>
          </div>
        ) : null
      }
      toast={
        <ToastPopup message={toast} onDismiss={() => setToast(null)} />
      }
    >
      <HanziReferenceSection
        title="1. 参考答案（随机打乱）"
        description="文本已打乱，标点不参与计算；匹配度达 50% 会显示正确答案。"
      >
        <p className="whitespace-pre-wrap break-all text-base leading-relaxed font-medium text-zinc-900 dark:text-zinc-100">
          {answerShuffle}
        </p>
        {answerRevealed ? (
          <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              参考答案原文（匹配度已达 50% 及以上）
            </h3>
            <p className="whitespace-pre-wrap break-all text-base leading-relaxed font-medium text-emerald-800 dark:text-emerald-200">
              {cfg.answerText}
            </p>
          </div>
        ) : null}
      </HanziReferenceSection>

      <HanziInputSection
        title="2. 输入重排后的文字"
        actionLabel="校验汉字"
        surplusAction="校验"
        draft={draft}
        taRef={taRef}
        onTextareaChange={onTextareaChange}
        captureSel={captureSel}
        shortageCards={shortageCards}
        surplusCards={surplusCards}
        hanziBalanced={hanziBalanced}
        balancedLabel="已全部填写"
        balancedRequiresDraft={false}
        submitBlocked={verifyBlocked}
        onPrimaryClick={tryVerify}
        onReset={resetDraft}
        insertAtCursor={insertAtCursor}
        setToast={setToast}
        footer={
          checkHistory.length > 0 ? (
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
          )
        }
      />
    </HanziPlayLayout>
  );
}
