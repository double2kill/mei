import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_DESC,
  countSafeMines,
  defaultQuizConfig,
  loadQuizConfig,
  newOptionId,
  parseTags,
  saveQuizConfig,
  type QuizConfig,
  type QuizOption,
} from "../test/quiz-config";

function formatSecAsMinSec(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (s === 0) return `合 ${m} 分钟`;
  return `合 ${m} 分 ${s} 秒`;
}

export function TestSettingsPage() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<QuizConfig>(() => defaultQuizConfig());
  const [timeDraft, setTimeDraft] = useState(() =>
    String(defaultQuizConfig().timeLimitSec),
  );
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    desc?: string;
    time?: string;
    options?: string;
  }>({});
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const descBlockRef = useRef<HTMLDivElement>(null);
  const timeBlockRef = useRef<HTMLDivElement>(null);
  const optionsBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = loadQuizConfig();
    setCfg(c);
    setTimeDraft(String(c.timeLimitSec));
  }, []);

  useEffect(() => {
    setFieldErrors((prev) =>
      prev.title ? { ...prev, title: undefined } : prev,
    );
  }, [cfg.title]);

  useEffect(() => {
    setFieldErrors((prev) =>
      prev.desc ? { ...prev, desc: undefined } : prev,
    );
  }, [cfg.desc]);

  useEffect(() => {
    setFieldErrors((prev) =>
      prev.time ? { ...prev, time: undefined } : prev,
    );
  }, [timeDraft]);

  const tags = useMemo(() => parseTags(cfg.tagInput), [cfg.tagInput]);
  const { safe, mines, total } = useMemo(
    () => countSafeMines(cfg.options),
    [cfg.options],
  );

  useEffect(() => {
    if (safe >= 1 && mines >= 1) {
      setFieldErrors((prev) =>
        prev.options ? { ...prev, options: undefined } : prev,
      );
    }
  }, [safe, mines]);

  const parsedTimeSec = useMemo(() => {
    const t = timeDraft.trim();
    if (t === "") return null;
    const n = Number.parseInt(t, 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.floor(n);
  }, [timeDraft]);

  const timeLimitHint = useMemo(
    () => (parsedTimeSec == null ? "—" : formatSecAsMinSec(parsedTimeSec)),
    [parsedTimeSec],
  );

  const update = <K extends keyof QuizConfig>(key: K, value: QuizConfig[K]) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  };

  const patchOption = (id: string, patch: Partial<QuizOption>) => {
    setCfg((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  };

  const moveOption = (index: number, delta: number) => {
    setCfg((prev) => {
      const j = index + delta;
      if (j < 0 || j >= prev.options.length) return prev;
      const next = [...prev.options];
      [next[index], next[j]] = [next[j], next[index]];
      return { ...prev, options: next };
    });
  };

  const removeOption = (id: string) => {
    setCfg((prev) => {
      if (prev.options.length <= 1) return prev;
      return { ...prev, options: prev.options.filter((o) => o.id !== id) };
    });
  };

  const addOption = () => {
    setCfg((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          id: newOptionId(),
          name: "新选项",
          isMine: false,
        },
      ],
    }));
  };

  const onSave = () => {
    const err: {
      title?: string;
      desc?: string;
      time?: string;
      options?: string;
    } = {};
    if (!cfg.title.trim()) {
      err.title = "请填写标题。";
    }
    if (!cfg.desc.trim()) {
      err.desc = "请填写描述。";
    }
    if (parsedTimeSec == null) {
      err.time = "请填写限时（秒），须为正整数。";
    }
    if (safe < 1 || mines < 1) {
      err.options = "至少需要 1 个安全格与 1 个雷格。";
    }
    if (err.title || err.desc || err.time || err.options) {
      setFieldErrors(err);
      requestAnimationFrame(() => {
        const el = err.title
          ? titleBlockRef.current
          : err.desc
            ? descBlockRef.current
            : err.time
              ? timeBlockRef.current
              : optionsBlockRef.current;
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setFieldErrors({});
    const sec = parsedTimeSec;
    if (sec == null) return;
    saveQuizConfig({ ...cfg, timeLimitSec: sec });
    navigate("/test");
  };

  return (
    <div className="flex min-h-dvh w-full flex-col bg-zinc-100 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-8 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold sm:text-2xl">测验设置</h1>
          <Link
            to="/test"
            className="touch-manipulation self-start rounded-lg px-3 py-2.5 text-base text-zinc-600 active:bg-zinc-200 sm:self-auto sm:py-2 dark:text-zinc-400 dark:active:bg-zinc-800"
          >
            返回测验
          </Link>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:space-y-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div ref={titleBlockRef} className="sm:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  标题（必填）
                </span>
                <input
                  value={cfg.title}
                  onChange={(e) => update("title", e.target.value)}
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.title)}
                  className={`min-h-12 w-full rounded-lg border bg-zinc-50 px-3 py-2 text-base dark:bg-zinc-950 ${
                    fieldErrors.title
                      ? "border-red-500 dark:border-red-500"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                />
                {fieldErrors.title ? (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.title}
                  </p>
                ) : null}
              </label>
            </div>
            <div ref={descBlockRef} className="sm:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  描述（必填）
                </span>
                <textarea
                  value={cfg.desc}
                  onChange={(e) => update("desc", e.target.value)}
                  rows={3}
                  placeholder={DEFAULT_DESC}
                  aria-invalid={Boolean(fieldErrors.desc)}
                  className={`min-h-[5.5rem] w-full resize-y rounded-lg border bg-zinc-50 px-3 py-2 text-base dark:bg-zinc-950 sm:resize-none sm:min-h-0 ${
                    fieldErrors.desc
                      ? "border-red-500 dark:border-red-500"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                />
                {fieldErrors.desc ? (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.desc}
                  </p>
                ) : null}
              </label>
            </div>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
                标签（逗号分隔，最多 10 个）
              </span>
              <input
                value={cfg.tagInput}
                onChange={(e) => update("tagInput", e.target.value)}
                autoComplete="off"
                className="min-h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950"
              />
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-zinc-200 px-2.5 py-1 text-sm dark:border-zinc-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </label>
            <div ref={timeBlockRef} className="w-full max-w-full sm:max-w-xs">
              <label className="block">
                <div className="mb-1.5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    限时（秒）
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                    {timeLimitHint}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={timeDraft}
                  onChange={(e) => setTimeDraft(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.time)}
                  className={`min-h-12 w-full rounded-lg border bg-zinc-50 px-3 py-2 text-base tabular-nums dark:bg-zinc-950 ${
                    fieldErrors.time
                      ? "border-red-500 dark:border-red-500"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                />
                {fieldErrors.time ? (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.time}
                  </p>
                ) : null}
              </label>
            </div>
          </div>

          <div ref={optionsBlockRef}>
            <div className="mb-3">
              <h2 className="text-lg font-semibold">选项</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                绿 {safe} · 红 {mines} · 共 {total}（测验页会随机打乱顺序）
              </p>
              {fieldErrors.options ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {fieldErrors.options}
                </p>
              ) : null}
            </div>

            <div className="space-y-3 md:hidden">
              {cfg.options.map((row, index) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/50"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium tabular-nums text-zinc-500">
                      序号 {index + 1}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveOption(index, -1)}
                        className="touch-manipulation min-h-11 min-w-11 rounded-lg border border-zinc-200 bg-white text-sm font-medium active:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-zinc-800"
                      >
                        上移
                      </button>
                      <button
                        type="button"
                        disabled={index === cfg.options.length - 1}
                        onClick={() => moveOption(index, 1)}
                        className="touch-manipulation min-h-11 min-w-11 rounded-lg border border-zinc-200 bg-white text-sm font-medium active:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:bg-zinc-900 dark:active:bg-zinc-800"
                      >
                        下移
                      </button>
                    </div>
                  </div>
                  <label className="mb-3 block">
                    <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                      名称
                    </span>
                    <input
                      value={row.name}
                      onChange={(e) =>
                        patchOption(row.id, { name: e.target.value })
                      }
                      autoComplete="off"
                      className="min-h-12 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={row.isMine}
                        onChange={(e) =>
                          patchOption(row.id, {
                            isMine: e.target.checked,
                          })
                        }
                        className="size-6 shrink-0 touch-manipulation rounded border-zinc-300"
                      />
                      <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">
                        设为雷
                      </span>
                    </label>
                    <button
                      type="button"
                      disabled={cfg.options.length <= 1}
                      onClick={() => removeOption(row.id)}
                      className="touch-manipulation min-h-11 shrink-0 rounded-lg border border-red-200 px-4 text-sm font-medium text-red-600 active:bg-red-50 disabled:opacity-30 dark:border-red-900/50 dark:text-red-400 dark:active:bg-red-950/40"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 md:block">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                  <tr>
                    <th className="w-12 px-2 py-2.5 font-medium">序号</th>
                    <th className="w-28 px-3 py-2.5 font-medium">调整</th>
                    <th className="min-w-[8rem] px-3 py-2.5 font-medium">
                      名称
                    </th>
                    <th className="w-24 px-3 py-2.5 font-medium">雷</th>
                    <th className="w-24 px-3 py-2.5 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.options.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/80"
                    >
                      <td className="px-2 py-2 align-middle text-center tabular-nums text-zinc-500">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveOption(index, -1)}
                            className="touch-manipulation min-h-9 min-w-9 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium active:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:active:bg-zinc-800"
                          >
                            上
                          </button>
                          <button
                            type="button"
                            disabled={index === cfg.options.length - 1}
                            onClick={() => moveOption(index, 1)}
                            className="touch-manipulation min-h-9 min-w-9 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium active:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:active:bg-zinc-800"
                          >
                            下
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          value={row.name}
                          onChange={(e) =>
                            patchOption(row.id, { name: e.target.value })
                          }
                          autoComplete="off"
                          className="min-h-10 w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <label className="inline-flex cursor-pointer items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            checked={row.isMine}
                            onChange={(e) =>
                              patchOption(row.id, {
                                isMine: e.target.checked,
                              })
                            }
                            className="size-4 shrink-0 touch-manipulation rounded border-zinc-300"
                          />
                          <span className="text-xs text-zinc-500">雷</span>
                        </label>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <button
                          type="button"
                          disabled={cfg.options.length <= 1}
                          onClick={() => removeOption(row.id)}
                          className="touch-manipulation rounded-lg px-2 py-1.5 text-sm text-red-600 hover:underline active:bg-red-50 disabled:opacity-30 dark:text-red-400 dark:active:bg-red-950/40"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addOption}
              className="touch-manipulation mt-3 min-h-12 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-3 text-base font-medium sm:w-auto sm:py-2 sm:text-sm dark:border-zinc-600 dark:bg-zinc-800"
            >
              添加选项
            </button>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:pt-1">
            <button
              type="button"
              onClick={() => {
                const d = defaultQuizConfig();
                setCfg(d);
                setTimeDraft(String(d.timeLimitSec));
                setFieldErrors({});
              }}
              className="touch-manipulation min-h-12 w-full rounded-lg border border-zinc-300 px-5 py-3 text-base sm:w-auto sm:py-2.5 dark:border-zinc-600"
            >
              恢复默认
            </button>
            <button
              type="button"
              onClick={onSave}
              className="touch-manipulation min-h-12 w-full rounded-lg bg-zinc-900 px-5 py-3 text-base font-medium text-white sm:w-auto sm:py-2.5 dark:bg-zinc-100 dark:text-zinc-900"
            >
              保存并返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
