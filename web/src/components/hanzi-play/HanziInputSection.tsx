import type { ReactNode, RefObject } from "react";
import { SurplusHanziBanner } from "../SurplusHanziBanner";
import { surplusCharMessage } from "../../test/hanzi-play-messages";
import { HanziShortageCards, HanziSurplusCards } from "./HanziCharCardList";

type ShortageCard = { char: string; remaining: number };
type SurplusCard = { char: string; surplus: number };

type HanziInputSectionProps = {
  title: string;
  description?: ReactNode;
  actionLabel: string;
  surplusAction: string;
  draft: string;
  taRef: RefObject<HTMLTextAreaElement | null>;
  onTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  captureSel: () => void;
  shortageCards: ShortageCard[];
  surplusCards: SurplusCard[];
  hanziBalanced: boolean;
  balancedLabel: string;
  balancedRequiresDraft?: boolean;
  submitBlocked: boolean;
  onPrimaryClick: () => void;
  onReset: () => void;
  insertAtCursor: (char: string) => void;
  setToast: (message: string) => void;
  placeholder?: string;
  beforeCards?: ReactNode;
  footer?: ReactNode;
};

export function HanziInputSection({
  title,
  description,
  actionLabel,
  surplusAction,
  draft,
  taRef,
  onTextareaChange,
  captureSel,
  shortageCards,
  surplusCards,
  hanziBalanced,
  balancedLabel,
  balancedRequiresDraft = true,
  submitBlocked,
  onPrimaryClick,
  onReset,
  insertAtCursor,
  setToast,
  placeholder,
  beforeCards,
  footer,
}: HanziInputSectionProps) {
  return (
    <section className="mb-4 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h2>
      {description}
      {beforeCards}
      <SurplusHanziBanner cards={surplusCards} action={surplusAction} />
      <div className="space-y-4">
        <HanziShortageCards cards={shortageCards} onInsert={insertAtCursor} />
        <HanziSurplusCards
          cards={surplusCards}
          onCharClick={(char, surplus) =>
            setToast(surplusCharMessage(char, surplus))
          }
        />
        {hanziBalanced &&
        (!balancedRequiresDraft || draft.length > 0) ? (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {balancedLabel}
          </p>
        ) : null}
      </div>
      <textarea
        ref={taRef}
        value={draft}
        onChange={onTextareaChange}
        onSelect={captureSel}
        onClick={captureSel}
        onKeyUp={captureSel}
        rows={4}
        placeholder={placeholder}
        className="min-h-28 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrimaryClick}
          className={`touch-manipulation min-h-11 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white active:opacity-90 dark:bg-zinc-100 dark:text-zinc-900 ${
            submitBlocked ? "opacity-45" : ""
          }`}
        >
          {actionLabel}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="touch-manipulation min-h-11 rounded-lg border border-zinc-300 px-5 text-sm font-medium active:bg-zinc-100 dark:border-zinc-600 dark:active:bg-zinc-800"
        >
          清空
        </button>
      </div>
      {footer}
    </section>
  );
}
