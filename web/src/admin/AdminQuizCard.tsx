import type { ReactNode } from "react";
import { quizTypeLabels, quizTypeStyles } from "../quiz-type-meta";
import type { QuizType } from "../type";

const cardClass =
  "relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

type AdminQuizCardProps = {
  title: string;
  coverSrc: string;
  type: QuizType;
  subtitle?: string;
  dragging?: boolean;
  dragHandle?: ReactNode;
  actions?: ReactNode;
};

export function AdminQuizCard({
  title,
  coverSrc,
  type,
  subtitle,
  dragging,
  dragHandle,
  actions,
}: AdminQuizCardProps) {
  return (
    <div
      className={`${cardClass} ${dragging ? "z-10 border-zinc-400 opacity-90 shadow-lg ring-2 ring-zinc-300 dark:border-zinc-600 dark:ring-zinc-600" : ""}`}
    >
      {dragHandle ? (
        <div className="absolute top-2 left-2 z-10">{dragHandle}</div>
      ) : null}
      <div className="h-36 w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={coverSrc}
          alt=""
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex flex-1 flex-col px-3 py-3">
        <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-1 truncate text-xs text-zinc-500">{subtitle}</span>
        ) : null}
        <span
          className={`mt-1.5 inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${quizTypeStyles[type]}`}
        >
          {quizTypeLabels[type]}
        </span>
        {actions ? <div className="mt-3 flex gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
