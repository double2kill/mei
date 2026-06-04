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
import {
  evaluateSegmentFluency,
  hasZhipuApiKey,
} from "../ai/segment-fluency-client";
import { labelSegmentFluency } from "../ai/segment-fluency";

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
  aiScore: number | null;
  aiReason: string | null;
  aiPassed: boolean | null;
};

type SegmentFluencyRecord = {
  at: number;
  draft: string;
  score: number;
  reason: string;
};

const MAX_CHECK_RECORDS = 100;
const AI_REASONABLE_SCORE = 80;

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
  const [fluencyChecking, setFluencyChecking] = useState(false);
  const [fluencyRecord, setFluencyRecord] = useState<SegmentFluencyRecord | null>(
    null,
  );
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
  const zhipuReady = hasZhipuApiKey();

  useEffect(() => {
    const c = loadSegmentPlayConfig(segmentQuizId);
    setCfg(c);
    setCheckHistory([]);
    setFluencyChecking(false);
    setFluencyRecord(null);
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

  const commitVerify = useCallback(async (draftSnap: string, answerText: string) => {
    const r = hanziOrderIndexMatchRate(answerText, draftSnap);
    let aiScore: number | null = null;
    let aiReason: string | null = null;

    try {
      if (zhipuReady) {
        setFluencyChecking(true);
        const result = await evaluateSegmentFluency(draftSnap);
        aiScore = result.score;
        aiReason = result.reason;
        setFluencyRecord({
          at: Date.now(),
          draft: draftSnap,
          score: result.score,
          reason: result.reason,
        });
      } else {
        setFluencyRecord(null);
      }
    } catch (error) {
      aiReason = error instanceof Error ? error.message : "AI 评价失败";
      setToast(aiReason);
      setFluencyRecord(null);
    } finally {
      setFluencyChecking(false);
      pendingVerifyRef.current = null;
      setAdOpen(false);
    }

    const rec: CheckRecord = {
      id: newCheckId(),
      at: Date.now(),
      draft: draftSnap,
      percent: r.percent,
      matched: r.matched,
      total: r.total,
      aiScore,
      aiReason,
      aiPassed: aiScore !== null ? aiScore >= AI_REASONABLE_SCORE : null,
    };
    setCheckHistory((prev) => [rec, ...prev].slice(0, MAX_CHECK_RECORDS));
  }, [zhipuReady]);

  useEffect(() => {
    if (!adOpen) return;
    if (adCountdown <= 0) {
      const p = pendingVerifyRef.current;
      if (p && !adVerifyConsumedRef.current) {
        adVerifyConsumedRef.current = true;
        void commitVerify(p.draft, p.answerText);
      } else if (!p) {
        setAdOpen(false);
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

  const verifyBlocked =
    adOpen || fluencyChecking || !draft.trim() || surplusCards.length > 0;

  const clearDraft = useCallback(() => {
    resetDraft();
    setFluencyRecord(null);
  }, [resetDraft]);

  const tryVerify = useCallback(() => {
    if (adOpen) return;
    if (!draft.trim()) {
      setToast("请先输入内容");
      return;
    }
    if (surplusCards.length > 0) {
      setToast(surplusSubmitMessage(surplusCards, "校验"));
      return;
    }
    startVerify();
  }, [adOpen, draft, surplusCards, startVerify]);

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
            className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-black/55 p-4"
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
                    : fluencyChecking
                      ? "AI 正在思考..."
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
        onReset={clearDraft}
        insertAtCursor={insertAtCursor}
        setToast={setToast}
        footer={
          checkHistory.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/80">
              <div className="grid grid-cols-2 gap-0 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span>原文</span>
                <span>校验结果</span>
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
                      <p className="max-h-28 overflow-y-auto whitespace-pre-wrap wrap-break-word text-zinc-900 dark:text-zinc-100">
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
                      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {rec.aiScore === null
                          ? "AI 未参与"
                          : `AI ${rec.aiScore} 分`}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          rec.aiPassed === true
                            ? "text-emerald-600 dark:text-emerald-400"
                            : rec.aiPassed === false
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {rec.aiPassed === true
                          ? `合理（>=${AI_REASONABLE_SCORE}）`
                          : rec.aiPassed === false
                            ? `不合理（<${AI_REASONABLE_SCORE}）`
                            : "未做 AI 判定"}
                      </span>
                      {rec.aiReason ? (
                        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                          {rec.aiReason}
                        </p>
                      ) : null}
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

      <HanziReferenceSection
        title="3. AI 通顺度评价"
        description={`点击「校验汉字」时会自动进行 AI 评价；AI 分数达到 ${AI_REASONABLE_SCORE} 分才认为合理。`}
        className="mb-0"
      >
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {zhipuReady ? "已检测到 AI 配置" : "未检测到 AI 配置"}
        </p>

        {fluencyRecord ? (
          <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-800/80 dark:bg-violet-950/40">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-semibold tabular-nums text-violet-700 dark:text-violet-300">
                {fluencyRecord.score} 分
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-200">
                {labelSegmentFluency(fluencyRecord.score)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  fluencyRecord.score >= AI_REASONABLE_SCORE
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200"
                }`}
              >
                {fluencyRecord.score >= AI_REASONABLE_SCORE ? "合理" : "不合理"}
              </span>
              <time
                dateTime={new Date(fluencyRecord.at).toISOString()}
                className="text-xs text-zinc-500 dark:text-zinc-400"
              >
                {new Date(fluencyRecord.at).toLocaleString()}
              </time>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                待评价句子
              </h3>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {fluencyRecord.draft}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                评价理由
              </h3>
              <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {fluencyRecord.reason}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            还没有 AI 校验记录。
          </p>
        )}
      </HanziReferenceSection>
    </HanziPlayLayout>
  );
}
