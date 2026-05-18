import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getQuizDef } from "../data-helpers";
import {
  collectHanziMultiset,
  extractHanziArray,
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

export function SentencePlayPage() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const sentenceQuiz = useMemo(() => getQuizDef("sentence"), []);
  const sourceText = sentenceQuiz?.text ?? "";
  const textShuffle = useMemo(
    () => shuffledAnswerChars(sourceText),
    [sourceText],
  );
  const hanziTotal = useMemo(
    () => extractHanziArray(sourceText).length,
    [sourceText],
  );
  const {
    draft,
    taRef,
    insertAtCursor,
    resetDraft,
    captureSel,
    onTextareaChange,
  } = useHanziDraftEditor();

  const { shortageCards, surplusCards, hanziBalanced } = useHanziBalance(
    sourceText,
    draft,
    textShuffle,
  );

  const usageStats = useMemo(() => {
    const totalChars = hanziTotal;
    const answerM = collectHanziMultiset(sourceText);
    const draftM = collectHanziMultiset(draft);
    let validHanzi = 0;
    for (const [ch, need] of answerM) {
      validHanzi += Math.min(need, draftM.get(ch) ?? 0);
    }
    const percentage =
      totalChars > 0 ? Math.round((validHanzi / totalChars) * 100) : 0;
    const required = sentenceQuiz?.usageRequired || 0;
    return {
      used: validHanzi,
      total: totalChars,
      percentage,
      required,
      meetsRequirement: percentage >= required,
    };
  }, [draft, hanziTotal, sentenceQuiz?.usageRequired, sourceText]);

  const submitBlocked =
    draft.length === 0 ||
    surplusCards.length > 0 ||
    (usageStats.required > 0 && !usageStats.meetsRequirement);

  const handleSubmit = () => {
    if (surplusCards.length > 0) {
      setToast(surplusSubmitMessage(surplusCards, "造句"));
      return;
    }
    if (draft.length === 0) {
      setToast("请先输入文字");
      return;
    }
    if (usageStats.required > 0 && !usageStats.meetsRequirement) {
      setToast(
        `使用度 ${usageStats.percentage}%，需达到 ${usageStats.required}% 才能造句`,
      );
      return;
    }
    setSentences([...sentences, draft]);
    resetDraft();
  };

  return (
    <HanziPlayLayout
      header={
        <HanziPlayHeader
          title={sentenceQuiz?.title.trim() || "造句"}
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
      <HanziReferenceSection
        title="1. 参考文本（随机打乱）"
        description={
          usageStats.required > 0
            ? `文本已打乱，标点不参与计算；使用度需达到 ${usageStats.required}% 才能造句。`
            : "文本已打乱，标点不参与计算。"
        }
        className="mb-5"
      >
        <p className="whitespace-pre-wrap break-all text-base leading-relaxed font-medium text-zinc-900 dark:text-zinc-100">
          {textShuffle}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          已使用 {usageStats.used} / {usageStats.total} 字
        </p>
      </HanziReferenceSection>

      <HanziInputSection
        title="2. 输入文字"
        description="可直接键盘输入，参照上方打乱文字造句。"
        actionLabel="造句"
        surplusAction="造句"
        draft={draft}
        taRef={taRef}
        onTextareaChange={onTextareaChange}
        captureSel={captureSel}
        shortageCards={shortageCards}
        surplusCards={surplusCards}
        hanziBalanced={hanziBalanced}
        balancedLabel="汉字已全部匹配"
        submitBlocked={submitBlocked}
        onPrimaryClick={handleSubmit}
        onReset={resetDraft}
        insertAtCursor={insertAtCursor}
        setToast={setToast}
        placeholder="输入造句…"
        beforeCards={
          usageStats.required > 0 && !usageStats.meetsRequirement ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-700/50 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                提示：当前使用度 {usageStats.percentage}%，需达到{" "}
                {usageStats.required}% 才能造句
              </p>
            </div>
          ) : null
        }
        footer={
          sentences.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/80">
              <div className="grid grid-cols-1 gap-0 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span>造句列表</span>
              </div>
              <ul className="max-h-72 overflow-y-auto bg-white dark:bg-zinc-950">
                {sentences.map((sentence, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 text-sm last:border-b-0 dark:border-zinc-800/80"
                  >
                    <span className="whitespace-pre-wrap break-words text-zinc-900 dark:text-zinc-100">
                      {sentence.length > 0 ? sentence : "（空）"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSentences(sentences.filter((_, i) => i !== index))
                      }
                      className="touch-manipulation rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              每次点击「造句」会在此追加一条记录。
            </p>
          )
        }
      />
    </HanziPlayLayout>
  );
}
