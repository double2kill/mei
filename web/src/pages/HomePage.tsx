import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Mei
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            湄开六度
          </p>
        </div>
        <div className="flex w-full max-w-md flex-col gap-4 sm:items-stretch">
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
