import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { QuizDef } from "../type";
import {
  BAIKE_MAX_ATTEMPTS,
  BAIKE_MAX_BATCH,
  baikeArticleHanzi,
  batchHanziCount,
  processBaikeBatch,
  titleHanziGuessed,
} from "../test/baike-play";
import { useHanziDraftEditor } from "../hooks/useHanziDraftEditor";
import { HanziPlayLayout, HanziPlayHeader } from "../components/hanzi-play/HanziPlayLayout";
import { BaikeArticleGrid } from "../components/baike/BaikeArticleGrid";
import { ToastPopup } from "../components/ToastPopup";

type BaikePlayPageProps = {
  quiz: QuizDef;
};

export function BaikePlayPage({ quiz }: BaikePlayPageProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [guessed, setGuessed] = useState<Set<string>>(() => new Set());
  const [missOrder, setMissOrder] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const wikiTitle = quiz.wikiTitle?.trim() ?? "";
  const wikiDetail = quiz.wikiDetail?.trim() ?? "";
  const articleHanzi = useMemo(
    () => baikeArticleHanzi(wikiTitle, wikiDetail),
    [wikiTitle, wikiDetail],
  );
  const {
    draft,
    taRef,
    resetDraft,
    captureSel,
    onTextareaChange,
  } = useHanziDraftEditor();

  useEffect(() => {
    setGuessed(new Set());
    setMissOrder([]);
    setAttempts(0);
    setWon(false);
    setGaveUp(false);
    resetDraft();
  }, [quiz.id, resetDraft]);

  const revealed = won || gaveUp;
  const canGuess = !revealed;
  const canGiveUp = !revealed && attempts >= BAIKE_MAX_ATTEMPTS;

  const titleRevealed = useMemo(
    () => titleHanziGuessed(wikiTitle, guessed),
    [wikiTitle, guessed],
  );

  const hanziInDraft = batchHanziCount(draft);

  const handleGiveUp = useCallback(() => {
    if (won || gaveUp || attempts < BAIKE_MAX_ATTEMPTS) return;
    setGaveUp(true);
    resetDraft();
  }, [won, gaveUp, attempts, resetDraft]);

  const handleGuess = useCallback(() => {
    if (!canGuess) return;
    const guessedSnap = new Set(guessed);
    const missedSnap = new Set(missOrder);
    const outcome = processBaikeBatch(
      wikiTitle,
      articleHanzi,
      guessedSnap,
      missedSnap,
      draft,
    );
    if (!outcome.ok) {
      setToast(outcome.reason);
      return;
    }
    const { missChars, attemptDelta, titleDone } = outcome.result;
    if (attemptDelta === 0) {
      setToast("本批没有新字，已猜过的字不计次");
      return;
    }
    setGuessed(guessedSnap);
    setMissOrder((prev) => [...prev, ...missChars]);
    setAttempts((n) => n + attemptDelta);
    if (titleDone) setWon(true);
    resetDraft();
  }, [canGuess, guessed, missOrder, wikiTitle, articleHanzi, draft, resetDraft]);

  const onDraftChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onTextareaChange(e);
      const count = batchHanziCount(e.target.value);
      if (count > BAIKE_MAX_BATCH) {
        setToast(`每次最多猜 ${BAIKE_MAX_BATCH} 个字`);
      }
    },
    [onTextareaChange],
  );

  const onDraftKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (!canGuess) return;
      handleGuess();
    },
    [canGuess, handleGuess],
  );

  return (
    <HanziPlayLayout
      header={
        <HanziPlayHeader
          title={quiz?.title.trim() || "百科"}
          trailing={
            <Link
              to="/"
              className="touch-manipulation shrink-0 self-start rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
            >
              返回首页
            </Link>
          }
        />
      }
      toast={
        <ToastPopup message={toast} onDismiss={() => setToast(null)} />
      }
    >
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200/90 dark:bg-zinc-900 dark:ring-zinc-700">
          <textarea
            ref={taRef}
            value={draft}
            onChange={onDraftChange}
            onKeyDown={onDraftKeyDown}
            onSelect={captureSel}
            onClick={captureSel}
            rows={1}
            disabled={!canGuess}
            placeholder={
              won ? "已猜出标题" : gaveUp ? "已放弃" : `最多 ${BAIKE_MAX_BATCH} 字，回车提交`
            }
            className="min-h-10 w-full resize-none border-0 bg-transparent py-2 text-center text-xl font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          {!revealed ? (
            <div
              className={`gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-800 ${
                canGiveUp ? "flex items-center justify-between" : "text-center"
              }`}
            >
              <p className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                {hanziInDraft}/{BAIKE_MAX_BATCH} · 已猜 {attempts} 次
                {attempts < BAIKE_MAX_ATTEMPTS
                  ? `（满 ${BAIKE_MAX_ATTEMPTS} 次可放弃）`
                  : ""}
              </p>
              {canGiveUp ? (
                <button
                  type="button"
                  onClick={handleGiveUp}
                  className="touch-manipulation shrink-0 rounded-lg px-3 py-1 text-xs font-medium text-rose-600 active:bg-rose-50 dark:text-rose-400 dark:active:bg-rose-950/50"
                >
                  放弃
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {won ? (
          <p className="text-center text-base font-semibold text-emerald-700 dark:text-emerald-400">
            已猜出标题 · 共 {attempts} 次
          </p>
        ) : gaveUp ? (
          <p className="text-center text-base font-semibold text-amber-700 dark:text-amber-400">
            已放弃 · 答案已显示
          </p>
        ) : null}

        <div className="rounded-2xl bg-white px-4 py-5 shadow-sm ring-1 ring-zinc-200/90 sm:px-6 sm:py-6 dark:bg-zinc-900 dark:ring-zinc-700">
          <BaikeArticleGrid
            text={wikiTitle}
            guessed={guessed}
            variant="title"
            revealAll={revealed}
            titleHighlight={titleRevealed || won}
          />
          {wikiDetail ? (
            <div className="mt-6 border-t border-dashed border-zinc-200 pt-6 dark:border-zinc-700">
              <BaikeArticleGrid
                text={wikiDetail}
                guessed={guessed}
                variant="body"
                revealAll={revealed}
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl bg-zinc-50/80 px-4 py-4 ring-1 ring-zinc-200/60 dark:bg-zinc-900/60 dark:ring-zinc-800">
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            不在正文
          </p>
          {missOrder.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missOrder.map((ch, i) => (
                <span
                  key={`miss-${ch}-${i}`}
                  className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-red-500 px-2 text-base font-semibold text-white shadow-sm dark:bg-red-600"
                >
                  {ch}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">—</p>
          )}
        </div>
      </div>
    </HanziPlayLayout>
  );
}
