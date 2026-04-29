import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between bg-white px-16 py-32 dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            mei
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Rsbuild + React + Tailwind
          </p>
        </div>
        <Link
          className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-base font-medium text-white transition-colors hover:bg-zinc-800 md:w-[158px] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          to="/test"
        >
          打开测验
        </Link>
      </main>
    </div>
  );
}
