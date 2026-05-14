import { useState, useMemo, useRef, useCallback, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { getQuizDef } from "../data-helpers";

interface CharCount {
  char: string;
  total: number;
  used: number;
}

interface CharInfo {
  char: string;
  isExcess: boolean;
}

export function SentencePlayPage() {
  const [selectedChars, setSelectedChars] = useState<CharInfo[]>([]);
  const [sentences, setSentences] = useState<string[]>([]);

  const sentenceQuiz = useMemo(() => getQuizDef("sentence"), []);
  const textChars = useMemo(() => {
    if (!sentenceQuiz?.text) return [];
    return sentenceQuiz.text.split("");
  }, [sentenceQuiz?.text]);

  const charCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    textChars.forEach((char) => {
      counts[char] = (counts[char] || 0) + 1;
    });
    return counts;
  }, [textChars]);

  const usedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedChars.forEach((item) => {
      counts[item.char] = (counts[item.char] || 0) + 1;
    });
    return counts;
  }, [selectedChars]);

  const availableChars = useMemo((): CharCount[] => {
    return Object.entries(charCounts)
      .map(([char, total]) => ({
        char,
        total,
        used: usedCounts[char] || 0,
      }))
      .filter((c) => c.used < c.total);
  }, [charCounts, usedCounts]);

  const hasExcessChars = useMemo(() => {
    return selectedChars.some((item) => item.isExcess);
  }, [selectedChars]);

  const excessChars = useMemo(() => {
    const excess: string[] = [];
    selectedChars.forEach((item) => {
      if (item.isExcess) {
        excess.push(item.char);
      }
    });
    return [...new Set(excess)];
  }, [selectedChars]);

  const usageStats = useMemo(() => {
    const totalChars = textChars.length;
    const validChars = selectedChars.filter((item) => !item.isExcess).length;
    const percentage = totalChars > 0 ? Math.round((validChars / totalChars) * 100) : 0;
    const required = sentenceQuiz?.usageRequired || 0;
    const meetsRequirement = percentage >= required;
    return {
      used: validChars,
      total: totalChars,
      percentage,
      required,
      meetsRequirement,
    };
  }, [selectedChars, textChars, sentenceQuiz?.usageRequired]);

  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastSel = useRef({ start: 0, end: 0 });
  const pendingCaret = useRef<number | null>(null);

  const captureSel = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    lastSel.current = {
      start: el.selectionStart,
      end: el.selectionEnd,
    };
  }, []);

  useLayoutEffect(() => {
    if (pendingCaret.current == null) return;
    const pos = pendingCaret.current;
    pendingCaret.current = null;
    const el = taRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(pos, el.value.length));
    el.focus();
    el.setSelectionRange(clamped, clamped);
    lastSel.current = { start: clamped, end: clamped };
  }, [selectedChars.map((c) => c.char).join("")]);

  const isCharExcess = (char: string, usedInNew: number): boolean => {
    const available = charCounts[char] || 0;
    return usedInNew > available;
  };

  const insertAtCursor = useCallback((ch: string) => {
    const currentChars = selectedChars.map((c) => c.char).join("");
    const el = taRef.current;
    const active = el != null && document.activeElement === el;
    let a = active ? el.selectionStart : lastSel.current.start;
    let b = active ? el.selectionEnd : lastSel.current.end;
    a = Math.max(0, Math.min(a, currentChars.length));
    b = Math.max(a, Math.min(b, currentChars.length));

    const before = currentChars.slice(0, a);
    const after = currentChars.slice(b);
    const newCharsStr = before + ch + after;

    const newUsedCounts: Record<string, number> = {};
    newCharsStr.split("").forEach((c) => {
      newUsedCounts[c] = (newUsedCounts[c] || 0) + 1;
    });

    const newChars = newCharsStr.split("").map((c) => ({
      char: c,
      isExcess: isCharExcess(c, newUsedCounts[c] || 0),
    }));

    setSelectedChars(newChars);

    const pos = a + ch.length;
    pendingCaret.current = pos;
    lastSel.current = { start: pos, end: pos };
  }, [selectedChars, charCounts]);

  const handleCharClick = (char: string) => {
    const currentUsed = usedCounts[char] || 0;
    const available = charCounts[char] || 0;
    if (currentUsed >= available) return;
    insertAtCursor(char);
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    const newUsedCounts: Record<string, number> = {};
    newValue.split("").forEach((c) => {
      newUsedCounts[c] = (newUsedCounts[c] || 0) + 1;
    });

    const newChars = newValue.split("").map((c) => ({
      char: c,
      isExcess: isCharExcess(c, newUsedCounts[c] || 0),
    }));

    setSelectedChars(newChars);
    lastSel.current = {
      start: e.target.selectionStart,
      end: e.target.selectionEnd,
    };
  };

  const handleSubmit = () => {
    const validChars = selectedChars.filter((item) => !item.isExcess);
    if (validChars.length > 0 && !hasExcessChars) {
      const sentence = validChars.map((c) => c.char).join("");
      setSentences([...sentences, sentence]);
      setSelectedChars([]);
      lastSel.current = { start: 0, end: 0 };
      pendingCaret.current = null;
    }
  };

  const handleDeleteSentence = (index: number) => {
    setSentences(sentences.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setSelectedChars([]);
    lastSel.current = { start: 0, end: 0 };
    pendingCaret.current = null;
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-zinc-100 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-3 py-4 sm:px-6 sm:py-5">
        <header className="mb-4 shrink-0 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl md:text-2xl">
                {sentenceQuiz?.title.trim() || "造句"}
              </h1>
            </div>
            <Link
              to="/"
              className="touch-manipulation shrink-0 self-start rounded-lg px-4 py-2.5 text-base font-medium text-zinc-600 active:bg-zinc-200 sm:px-3 sm:py-1.5 sm:text-sm dark:text-zinc-400 dark:active:bg-zinc-800"
            >
              返回首页
            </Link>
          </div>
        </header>

        <section className="mb-4 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              1. 文字池
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            点击下方字卡添加到输入框。每个字只能使用限定次数。
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            已使用 {usageStats.used} / {usageStats.total} 字
            {usageStats.required > 0 && (
              <span className="ml-2">
                （要求达到 {usageStats.required}%）
              </span>
            )}
          </p>
          {availableChars.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {availableChars.map((item) => (
                <li key={item.char} className="list-none">
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => handleCharClick(item.char)}
                    aria-label={`插入${item.char}，还剩${item.total - item.used}个`}
                    className="touch-manipulation relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border-2 border-amber-200 bg-amber-50/90 px-2 py-1.5 shadow-sm select-none active:opacity-90 dark:border-amber-700/60 dark:bg-amber-950/40"
                  >
                    <span className="text-xl font-semibold leading-none text-zinc-900 dark:text-zinc-50">
                      {item.char}
                    </span>
                    {item.total > 1 && (
                      <span className="pointer-events-none absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold tabular-nums leading-none text-white shadow dark:bg-amber-500">
                        {item.total - item.used}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              所有字卡已用完，请清空后重新选择。
            </p>
          )}
        </section>

        <section className="mb-4 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900 sm:p-5">
          <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            2. 输入文字
          </h2>
          {hasExcessChars && (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-700/50 dark:bg-red-950/30">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                警告：存在多余的字符「{excessChars.join("、")}」，请删除后再造句
              </p>
            </div>
          )}
          {usageStats.required > 0 && !usageStats.meetsRequirement && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-700/50 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                提示：当前使用度 {usageStats.percentage}%，需达到 {usageStats.required}% 才能造句
              </p>
            </div>
          )}
          <div className="space-y-2">
            <div
              className="min-h-28 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base leading-relaxed dark:border-zinc-700 dark:bg-zinc-950"
              onClick={() => taRef.current?.focus()}
            >
              {selectedChars.length === 0 ? (
                <span className="text-zinc-400 dark:text-zinc-600">
                  点击上方字卡添加文字...
                </span>
              ) : (
                selectedChars.map((item, index) => (
                  <span
                    key={index}
                    className={`${
                      item.isExcess
                        ? "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-400 rounded"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {item.char}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                selectedChars.filter((c) => !c.isExcess).length === 0 ||
                hasExcessChars ||
                (usageStats.required > 0 && !usageStats.meetsRequirement)
              }
              className="touch-manipulation min-h-11 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-white active:opacity-90 disabled:opacity-45 dark:bg-zinc-100 dark:text-zinc-900"
            >
              造句
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="touch-manipulation min-h-11 rounded-lg border border-zinc-300 px-5 text-sm font-medium active:bg-zinc-100 dark:border-zinc-600 dark:active:bg-zinc-800"
            >
              清空
            </button>
          </div>
          {sentences.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/80">
              <div className="grid grid-cols-1 gap-0 border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span>造句列表</span>
              </div>
              <ul className="max-h-72 overflow-y-auto bg-white dark:bg-zinc-950">
                {sentences.map((sentence, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5 text-sm last:border-b-0 dark:border-zinc-800/80"
                  >
                    <span className="whitespace-pre-wrap break-words text-zinc-900 dark:text-zinc-100">
                      {sentence.length > 0 ? sentence : "（空）"}
                    </span>
                    <button
                      onClick={() => handleDeleteSentence(index)}
                      className="touch-manipulation rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      删除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              每次点击「造句」会在此追加一条记录。
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
