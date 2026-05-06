import { Link } from "react-router-dom";

const base =
  typeof import.meta.env.BASE_URL === "string"
    ? import.meta.env.BASE_URL
    : "/";
const defaultHomeCardCover =
  (base.endsWith("/") ? base : `${base}/`) + "mei-witch.png";

const cardClass =
  "flex h-full w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700";

function HomeEntryLink({
  to,
  title,
  src,
}: {
  to: string;
  title: string;
  src: string;
}) {
  return (
    <Link to={to} className={cardClass}>
      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={src}
          alt=""
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="px-5 py-4">
        <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
      </div>
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-start bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 bg-white px-3 py-10 dark:bg-black sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xl font-medium leading-8 text-zinc-800 sm:text-2xl dark:text-zinc-200">
            湄开六度
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HomeEntryLink
            to="/test"
            title="女巫的毒药"
            src={defaultHomeCardCover}
          />
          <HomeEntryLink
            to="/random"
            title="女巫的毒药（随机版）"
            src={defaultHomeCardCover}
          />
        </div>
      </main>
    </div>
  );
}
