import { Link, useLocation } from "react-router-dom";

export function SiteHeader() {
  const { pathname } = useLocation();
  const isEva = /\/eva\/?$/i.test(pathname);
  const brand = isEva ? "猜 E 猜" : "猜了湄";
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-zinc-200 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex min-h-12 w-full max-w-3xl items-center justify-between gap-3 px-3 py-2 pt-[max(0.25rem,env(safe-area-inset-top))] sm:min-h-14 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-0.5 active:opacity-80 sm:gap-3"
        >
          {!isEva ? (
            <img
              src="/mei-logo.png"
              alt=""
              className="h-8 max-h-9 w-auto max-w-[min(100%,11rem)] shrink-0 object-contain object-left sm:h-9 sm:max-w-52"
            />
          ) : null}
          <span className="truncate text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl dark:text-zinc-50">
            {brand}
          </span>
        </Link>
        <Link
          to="/admin/login"
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          后台
        </Link>
      </div>
    </header>
  );
}
