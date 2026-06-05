import { baikeEnWordRevealed } from "../../test/baike-en-play";

const WORD_RE = /[A-Za-z]+(?:'[A-Za-z]+)?/g;

type BaikeEnArticleGridProps = {
  text: string;
  guessed: ReadonlySet<string>;
  variant: "title" | "body";
  revealAll?: boolean;
  titleHighlight?: boolean;
};

export function BaikeEnArticleGrid({
  text,
  guessed,
  variant,
  revealAll = false,
  titleHighlight = false,
}: BaikeEnArticleGridProps) {
  if (!text) return null;
  const lines = text.split("\n");
  const isTitle = variant === "title";

  const cellBase = isTitle
    ? "inline-flex shrink-0 items-center justify-center rounded-sm border-2 border-zinc-900 px-2 font-semibold sm:px-2.5"
    : "inline-flex shrink-0 items-center justify-center rounded-sm border border-zinc-800 px-1.5 font-medium sm:px-2";

  const cellSize = isTitle ? "h-10 text-lg sm:h-11 sm:text-xl" : "h-8 text-sm sm:h-9 sm:text-base";

  const punct = isTitle
    ? "px-0.5 text-lg font-semibold leading-none text-zinc-800 sm:text-xl"
    : "px-0.5 text-sm leading-none text-zinc-600 sm:text-base";

  return (
    <div className={isTitle ? "space-y-2" : "space-y-2.5"}>
      {lines.map((line, li) => (
        <div
          key={li}
          className="flex flex-wrap items-end gap-x-1 gap-y-2 sm:gap-x-1.5"
        >
          {tokenizeLine(line).map((tok, ci) => {
            if (tok.kind === "space") {
              return <span key={`${li}-${ci}`} className="w-1.5" />;
            }
            if (tok.kind === "text") {
              return (
                <span key={`${li}-${ci}`} className={`self-end pb-0.5 ${punct}`}>
                  {tok.text}
                </span>
              );
            }
            const revealed = revealAll || baikeEnWordRevealed(tok.text, guessed);
            const hitStyle =
              isTitle && titleHighlight && revealed
                ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                : revealed
                  ? "bg-white text-zinc-900"
                  : "bg-white text-zinc-900";
            return (
              <span
                key={`${li}-${ci}`}
                className={`${cellBase} ${cellSize} ${hitStyle}`}
                style={{ minWidth: revealed ? undefined : `${Math.max(2.5, tok.text.length * 0.55 + 1.5)}em` }}
                aria-label={revealed ? tok.text : undefined}
              >
                {revealed ? tok.text : ""}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

type LineToken =
  | { kind: "word"; text: string }
  | { kind: "text"; text: string }
  | { kind: "space" };

function tokenizeLine(line: string): LineToken[] {
  const tokens: LineToken[] = [];
  let last = 0;
  for (const m of line.matchAll(WORD_RE)) {
    const start = m.index ?? 0;
    pushGap(line.slice(last, start), tokens);
    tokens.push({ kind: "word", text: m[0] });
    last = start + m[0].length;
  }
  pushGap(line.slice(last), tokens);
  return tokens;
}

function pushGap(raw: string, tokens: LineToken[]) {
  if (!raw) return;
  for (const ch of raw) {
    if (ch === " ") tokens.push({ kind: "space" });
    else tokens.push({ kind: "text", text: ch });
  }
}
