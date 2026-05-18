type ShortageCard = { char: string; remaining: number };
type SurplusCard = { char: string; surplus: number };

const cardBtnBase =
  "touch-manipulation relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border-2 px-2 py-1.5 shadow-sm select-none active:opacity-90";

const badgeBase =
  "pointer-events-none absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow";

export function HanziShortageCards({
  cards,
  onInsert,
}: {
  cards: ShortageCard[];
  onInsert: (char: string) => void;
}) {
  if (cards.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        还差的汉字
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {cards.map((item) => (
          <li key={`short-${item.char}`} className="list-none">
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onInsert(item.char)}
              aria-label={
                item.remaining > 1
                  ? `插入${item.char}，还差${item.remaining}个`
                  : `插入${item.char}`
              }
              className={`${cardBtnBase} border-amber-200 bg-amber-50/90 dark:border-amber-700/60 dark:bg-amber-950/40`}
            >
              <span className="text-xl font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                {item.char}
              </span>
              {item.remaining > 1 ? (
                <span
                  className={`${badgeBase} bg-amber-600 dark:bg-amber-500`}
                >
                  {item.remaining}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HanziSurplusCards({
  cards,
  onCharClick,
}: {
  cards: SurplusCard[];
  onCharClick: (char: string, surplus: number) => void;
}) {
  if (cards.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        多写的汉字
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {cards.map((item) => (
          <li key={`sur-${item.char}`} className="list-none">
            <button
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => onCharClick(item.char, item.surplus)}
              aria-label={
                item.surplus > 1
                  ? `${item.char} 已多写 ${item.surplus} 个`
                  : `${item.char} 已多写`
              }
              className={`${cardBtnBase} border-red-200 bg-red-50/90 dark:border-red-800/55 dark:bg-red-950/35`}
            >
              <span className="text-xl font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                {item.char}
              </span>
              {item.surplus > 1 ? (
                <span className={`${badgeBase} bg-red-600 dark:bg-red-500`}>
                  {item.surplus}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
