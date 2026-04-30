import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-start bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 bg-white px-3 py-10 dark:bg-black sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 text-left">
          <p className="text-xl font-medium leading-8 text-zinc-800 sm:text-2xl dark:text-zinc-200">
            湄开六度
          </p>
        </div>
        <div className="flex w-full flex-col gap-4">
          <Link
            to="/test"
            className="block w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-100">
              女巫的毒药
            </span>
          </Link>
          <Link
            to="/random"
            className="block w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <span className="block text-base font-semibold text-zinc-900 dark:text-zinc-100">
              女巫的毒药（随机版）
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
