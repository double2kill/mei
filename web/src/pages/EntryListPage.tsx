import { useState } from "react";
import { Link } from "react-router-dom";
import type { EntryDef, QuizType } from "../type";

const cardClass =
  "flex h-full w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700";

const typeLabels: Record<QuizType, string> = {
  fixed: "固定题",
  random: "随机题",
  segment: "排段",
  sentence: "造句",
};

const typeStyles: Record<QuizType, string> = {
  fixed: "bg-blue-100 text-blue-700",
  random: "bg-green-100 text-green-700",
  segment: "bg-purple-100 text-purple-700",
  sentence: "bg-orange-100 text-orange-700",
};

function EntryCard({ to, title, coverSrc, type }: EntryDef) {
  return (
    <Link to={to} className={cardClass}>
      <div className="aspect-16/10 w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={coverSrc}
          alt=""
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="px-5 py-4">
        <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeStyles[type]}`}
        >
          {typeLabels[type]}
        </span>
      </div>
    </Link>
  );
}

export type EntryListPageProps = {
  heading: string;
  entries: EntryDef[];
};

export function EntryListPage({ heading, entries }: EntryListPageProps) {
  const [filterType, setFilterType] = useState<QuizType | "all">("all");

  const filteredEntries =
    filterType === "all"
      ? entries
      : entries.filter((entry) => entry.type === filterType);

  const allTypes: (QuizType | "all")[] = ["all", "fixed", "random", "segment", "sentence"];
  const filterLabels: Record<QuizType | "all", string> = {
    all: "全部",
    fixed: "固定题",
    random: "随机题",
    segment: "排段",
    sentence: "造句",
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-start bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 bg-white px-3 py-10 dark:bg-black sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xl font-medium leading-8 text-zinc-800 sm:text-2xl dark:text-zinc-200">
            {heading}
          </p>
          <div className="flex gap-2">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  filterType === type
                    ? "bg-zinc-900 text-white dark:bg-zinc-700"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {filterLabels[type]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((e) => (
            <EntryCard key={e.to} {...e} />
          ))}
        </div>
      </main>
    </div>
  );
}
