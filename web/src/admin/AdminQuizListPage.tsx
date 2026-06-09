import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAdminQuiz, fetchAdminQuizzes } from "./api";
import { quizTypeLabels } from "../quiz-type-meta";
import type { QuizDef } from "../type";

export function AdminQuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAdminQuizzes()
      .then((data) => {
        setQuizzes(data.quizzes);
        setErr(null);
      })
      .catch(() => setErr("加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    if (!window.confirm(`删除题目 ${id}？`)) return;
    try {
      await deleteAdminQuiz(id);
      load();
    } catch {
      setErr("删除失败，可能仍被展示位引用");
    }
  };

  if (loading) return <p className="text-zinc-500">加载中…</p>;
  if (err) return <p className="text-red-600">{err}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          题目列表
        </h2>
        <Link
          to="/admin/quizzes/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          新建题目
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">类型</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr
                key={q.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="px-4 py-3 font-mono text-xs">{q.id}</td>
                <td className="px-4 py-3">{q.title}</td>
                <td className="px-4 py-3">{quizTypeLabels[q.type]}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/quizzes/${q.id}`}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(q.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
