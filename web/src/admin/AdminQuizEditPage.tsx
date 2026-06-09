import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  COVER_REFS,
  QUIZ_TYPES,
  createAdminQuiz,
  fetchAdminQuiz,
  updateAdminQuiz,
} from "./api";
import { quizTypeLabels } from "../quiz-type-meta";
import type { QuizDef, QuizType } from "../type";

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="border-b border-zinc-100 pb-2 text-base font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function hasQuizContent(type: QuizType) {
  return (
    type === "segment" ||
    type === "sentence" ||
    type === "baike" ||
    type === "baike-en"
  );
}

const emptyForm = (): Partial<QuizDef> & { id: string } => ({
  id: "",
  title: "",
  type: "segment",
  coverRef: "witch",
  settings: false,
  answerText: "",
  text: "",
  usageRequired: 0,
  wikiTitle: "",
  wikiDetail: "",
});

export function AdminQuizEditPage() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setForm(emptyForm());
      setLoading(false);
      setErr(null);
      return;
    }
    if (!id) return;
    setLoading(true);
    fetchAdminQuiz(id)
      .then((quiz) => {
        setForm({
          id: quiz.id,
          title: quiz.title,
          type: quiz.type,
          coverRef: quiz.coverRef ?? "witch",
          settings: quiz.settings ?? false,
          answerText: quiz.answerText ?? "",
          text: quiz.text ?? "",
          usageRequired: quiz.usageRequired ?? 0,
          wikiTitle: quiz.wikiTitle ?? "",
          wikiDetail: quiz.wikiDetail ?? "",
        });
        setErr(null);
      })
      .catch(() => setErr("加载失败"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const setField = <K extends keyof QuizDef>(key: K, value: QuizDef[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      if (isNew) {
        await createAdminQuiz(form);
      } else if (id) {
        await updateAdminQuiz(id, form);
      }
      navigate("/admin/quizzes");
    } catch {
      setErr("保存失败，请检查字段");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-zinc-500">加载中…</p>;

  const type = form.type as QuizType;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {isNew ? "新建题目" : `编辑 ${id}`}
        </h2>
        <Link to="/admin/quizzes" className="text-sm text-zinc-500">
          返回列表
        </Link>
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <div className="space-y-4">
        <FormSection title="基础设置">
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              ID
            </span>
            <input
              value={form.id}
              disabled={!isNew}
              onChange={(e) => setField("id", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              标题
            </span>
            <input
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              类型
            </span>
            <select
              value={type}
              onChange={(e) => setField("type", e.target.value as QuizType)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {QUIZ_TYPES.map((t) => (
                <option key={t} value={t}>
                  {quizTypeLabels[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              封面
            </span>
            <select
              value={form.coverRef ?? "witch"}
              onChange={(e) => setField("coverRef", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            >
              {COVER_REFS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {type === "fixed" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.settings)}
                onChange={(e) => setField("settings", e.target.checked)}
              />
              启用设置页
            </label>
          )}
        </FormSection>
        <FormSection title="题目设置">
          {type === "segment" && (
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                参考答案
              </span>
              <textarea
                value={form.answerText ?? ""}
                onChange={(e) => setField("answerText", e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          )}
          {type === "sentence" && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  参考文本
                </span>
                <textarea
                  value={form.text ?? ""}
                  onChange={(e) => setField("text", e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  使用度要求 (%)
                </span>
                <input
                  type="number"
                  value={form.usageRequired ?? 0}
                  onChange={(e) =>
                    setField("usageRequired", Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </>
          )}
          {(type === "baike" || type === "baike-en") && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  百科标题
                </span>
                <input
                  value={form.wikiTitle ?? ""}
                  onChange={(e) => setField("wikiTitle", e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  百科正文
                </span>
                <textarea
                  value={form.wikiDetail ?? ""}
                  onChange={(e) => setField("wikiDetail", e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </>
          )}
          {!hasQuizContent(type) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              当前类型无需配置题目内容
            </p>
          )}
        </FormSection>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {saving ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
