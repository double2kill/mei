import useUrlState from "@ahooksjs/use-url-state";
import { Link } from "react-router-dom";
import {
  availableFilters,
  filterEntriesByType,
  filterLabels,
  parseFilterType,
  type FilterType,
} from "../entry-list-filters";
import { quizTypeLabels, quizTypeStyles } from "../quiz-type-meta";
import type { EntryDef } from "../type";

const cardClass =
  "flex h-full w-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700";

function EntryCard({ to, title, coverSrc, type }: EntryDef) {
  return (
    <Link to={to} className={cardClass}>
      <div className="h-36 w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={coverSrc}
          alt=""
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="px-3 py-3">
        <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        <span
          className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${quizTypeStyles[type]}`}
        >
          {quizTypeLabels[type]}
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
  const available = availableFilters(entries);
  const defaultType = available[0];
  const [urlState, setUrlState] = useUrlState<{ type?: FilterType }>(
    { type: defaultType },
    { navigateMode: "replace" },
  );
  const filterType =
    parseFilterType(urlState.type, available) ?? defaultType ?? null;
  const setFilterType = (type: FilterType) => setUrlState({ type });
  const filteredEntries = filterEntriesByType(entries, filterType);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-start bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 bg-white px-3 py-10 dark:bg-black sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xl font-medium leading-8 text-zinc-800 sm:text-2xl dark:text-zinc-200">
            {heading}
          </p>
          {available.length > 1 ? (
            <div className="flex flex-wrap gap-3">
              {available.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-xl px-6 py-3 text-base font-semibold transition ${
                    filterType === type
                      ? "bg-zinc-900 text-white dark:bg-zinc-700"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {filterLabels[type]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredEntries.map((e) => (
            <EntryCard key={e.to} {...e} />
          ))}
        </div>
      </main>
    </div>
  );
}
