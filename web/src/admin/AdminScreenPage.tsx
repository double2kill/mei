import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { coverSrcForRef } from "../data-helpers";
import { COVER_REFS, fetchAdminQuizzes, fetchAdminScreen, saveAdminScreen } from "./api";
import { AdminQuizCard } from "./AdminQuizCard";
import { SortableCardGrid } from "./SortableCardGrid";
import type { QuizDef, ScreenRow } from "../type";

export function AdminScreenPage() {
  const { screen } = useParams<{ screen: "home" | "eva" }>();
  const active = screen === "eva" ? "eva" : "home";
  const [rows, setRows] = useState<ScreenRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pickId, setPickId] = useState("");
  const [pickCover, setPickCover] = useState("witch");

  const quizMap = useMemo(
    () => new Map(quizzes.map((q) => [q.id, q])),
    [quizzes],
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAdminScreen(active), fetchAdminQuizzes()])
      .then(([screenData, quizData]) => {
        setRows(screenData.rows);
        setQuizzes(quizData.quizzes);
        setErr(null);
      })
      .catch(() => setErr("加载失败"))
      .finally(() => setLoading(false));
  }, [active]);

  const onSave = async () => {
    setSaving(true);
    setErr(null);
    try {
      const data = await saveAdminScreen(active, rows);
      setRows(data.rows);
    } catch {
      setErr("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const onReorder = (ids: string[]) => {
    setRows((prev) => {
      const map = new Map(prev.map((r) => [r.quizId, r]));
      return ids
        .map((id) => map.get(id))
        .filter((r): r is ScreenRow => Boolean(r));
    });
  };

  const remove = (quizId: string) => {
    setRows((prev) => prev.filter((r) => r.quizId !== quizId));
  };

  const add = () => {
    if (!pickId || rows.some((r) => r.quizId === pickId)) return;
    setRows((prev) => [...prev, { quizId: pickId, coverRef: pickCover }]);
    setPickId("");
  };

  if (loading) return <p className="text-zinc-500">加载中…</p>;

  const title = active === "home" ? "首页展示" : "Eva 展示";
  const ids = rows.map((r) => r.quizId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">拖拽卡片调整顺序</p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? "保存中…" : "保存排序"}
        </button>
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无展示题目，请下方添加</p>
      ) : (
        <SortableCardGrid
          ids={ids}
          onReorder={onReorder}
          renderCard={(quizId, dragHandle, dragging) => {
            const row = rows.find((r) => r.quizId === quizId);
            const quiz = quizMap.get(quizId);
            if (!row || !quiz) return null;
            const coverRef = quiz.coverRef ?? row.coverRef;
            return (
              <AdminQuizCard
                title={quiz.title}
                coverSrc={coverSrcForRef(coverRef)}
                type={quiz.type}
                subtitle={quizId}
                dragging={dragging}
                dragHandle={dragHandle}
                actions={
                  <button
                    type="button"
                    onClick={() => remove(quizId)}
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    移除
                  </button>
                }
              />
            );
          }}
        />
      )}
      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">题目</span>
          <select
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="">选择题目</option>
            {quizzes
              .filter((q) => !rows.some((r) => r.quizId === q.id))
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">封面</span>
          <select
            value={pickCover}
            onChange={(e) => setPickCover(e.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          >
            {COVER_REFS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={!pickId}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-zinc-600"
        >
          添加
        </button>
      </div>
    </div>
  );
}
