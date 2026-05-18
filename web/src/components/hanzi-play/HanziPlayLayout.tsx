import type { ReactNode } from "react";

export function HanziPlayLayout({
  header,
  children,
  overlay,
  toast,
}: {
  header: ReactNode;
  children: ReactNode;
  overlay?: ReactNode;
  toast?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-zinc-100 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-5">
        {header}
        {children}
      </div>
      {overlay}
      {toast}
    </div>
  );
}

export function HanziPlayHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="mb-4 shrink-0 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl md:text-2xl">
            {title}
          </h1>
        </div>
        {trailing}
      </div>
    </header>
  );
}

export function HanziReferenceSection({
  title,
  description,
  children,
  className = "mb-5",
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`${className} space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-5`}
    >
      <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}
