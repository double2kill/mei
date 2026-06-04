const HANZI_RE = /\p{Script=Han}/u;

function isHanzi(ch: string): boolean {
  return HANZI_RE.test(ch);
}

type BaikeArticleGridProps = {
  text: string;
  guessed: ReadonlySet<string>;
  variant: "title" | "body";
  revealAll?: boolean;
  titleHighlight?: boolean;
};

export function BaikeArticleGrid({
  text,
  guessed,
  variant,
  revealAll = false,
  titleHighlight = false,
}: BaikeArticleGridProps) {
  if (!text) return null;
  const lines = text.split("\n");
  const isTitle = variant === "title";

  const cell = isTitle
    ? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-zinc-900 text-xl font-semibold sm:h-11 sm:w-11 sm:text-2xl"
    : "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-zinc-800 text-sm font-medium sm:h-8 sm:w-8 sm:text-base";

  const punct = isTitle
    ? "px-0.5 text-xl font-semibold leading-none text-zinc-800 sm:text-2xl"
    : "px-0.5 text-sm leading-none text-zinc-600 sm:text-base";

  return (
    <div className={isTitle ? "space-y-2" : "space-y-2.5"}>
      {lines.map((line, li) => (
        <div
          key={li}
          className="flex flex-wrap items-end gap-x-px gap-y-1.5 sm:gap-x-0.5 sm:gap-y-2"
        >
          {[...line].map((ch, ci) => {
            if (isHanzi(ch)) {
              const revealed = revealAll || guessed.has(ch);
              const hitStyle =
                isTitle && titleHighlight && revealed
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                  : revealed
                    ? "bg-white text-zinc-900"
                    : "bg-white text-zinc-900";
              return (
                <span
                  key={`${li}-${ci}`}
                  className={`${cell} ${hitStyle}`}
                  aria-label={revealed ? ch : undefined}
                >
                  {revealed ? ch : ""}
                </span>
              );
            }
            if (ch === " ") {
              return <span key={`${li}-${ci}`} className="w-2" />;
            }
            return (
              <span key={`${li}-${ci}`} className={`self-end pb-0.5 ${punct}`}>
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
