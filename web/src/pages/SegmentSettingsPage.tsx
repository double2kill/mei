import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  defaultSegmentPlayConfig,
  loadSegmentPlayConfig,
  saveSegmentPlayConfig,
  type SegmentPlayConfig,
} from "../test/segment-config";

export function SegmentSettingsPage() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<SegmentPlayConfig>(() =>
    loadSegmentPlayConfig(),
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setCfg(loadSegmentPlayConfig());
  }, []);

  const update = useCallback(<K extends keyof SegmentPlayConfig>(
    key: K,
    value: SegmentPlayConfig[K],
  ) => {
    setCfg((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onSave = useCallback(() => {
    if (!cfg.title.trim()) {
      setErr("请填写标题。");
      return;
    }
    if (!cfg.answerText.trim()) {
      setErr("请填写参考答案。");
      return;
    }
    setErr(null);
    saveSegmentPlayConfig(cfg);
    navigate("/test/segment");
  }, [cfg, navigate]);

  const onRestore = useCallback(() => {
    const d = defaultSegmentPlayConfig();
    setCfg(d);
    setErr(null);
  }, []);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-zinc-100 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold sm:text-2xl">排段设置</h1>
          <Link
            to="/test/segment"
            className="touch-manipulation self-start rounded-lg px-3 py-2.5 text-base text-zinc-600 active:bg-zinc-200 sm:self-auto sm:py-2 dark:text-zinc-400 dark:active:bg-zinc-800"
          >
            返回玩法
          </Link>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:space-y-5 sm:p-6">
          {err ? (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {err}
            </p>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              标题
            </span>
            <input
              value={cfg.title}
              onChange={(e) => update("title", e.target.value)}
              autoComplete="off"
              className="min-h-12 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              参考答案（你的答案）
            </span>
            <textarea
              value={cfg.answerText}
              onChange={(e) => update("answerText", e.target.value)}
              rows={3}
              className="min-h-24 w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:pt-1">
            <button
              type="button"
              onClick={onRestore}
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
