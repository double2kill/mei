export type QuizCellSource = {
  order: number;
  name: string;
  safe: boolean;
};

export const QUIZ_RAW: QuizCellSource[] = [
  { order: 1, name: "预言家", safe: true },
  { order: 2, name: "守卫", safe: true },
  { order: 3, name: "女巫", safe: true },
  { order: 4, name: "猎人", safe: true },
  { order: 5, name: "白神", safe: true },
  { order: 6, name: "通灵师", safe: true },
  { order: 7, name: "机械狼", safe: true },
  { order: 8, name: "假面", safe: true },
  { order: 9, name: "舞者", safe: true },
  { order: 10, name: "混子", safe: true },
  { order: 11, name: "平民", safe: true },
  { order: 12, name: "狼美人", safe: true },
  { order: 13, name: "骑士", safe: false },
  { order: 14, name: "摄梦人", safe: true },
  { order: 15, name: "禁言长老", safe: true },
  { order: 16, name: "捣蛋鬼", safe: true },
];

export const DEFAULT_TITLE = "女巫的毒药 1（湄师傅 杭城小师赛）";
export const DEFAULT_DESC =
  "以下有一个身份是女巫的毒药，请避开女巫的毒药选择";
export const DEFAULT_LIMIT = 1200;

export type QuizOption = {
  id: string;
  name: string;
  isMine: boolean;
};

export type QuizConfig = {
  title: string;
  desc: string;
  tagInput: string;
  timeLimitSec: number;
  options: QuizOption[];
};

export const STORAGE_KEY = "mei:test-quiz-config";

export function defaultOptionsFromSeed(): QuizOption[] {
  return QUIZ_RAW.map((r) => ({
    id: `seed-${r.order}`,
    name: r.name,
    isMine: !r.safe,
  }));
}

export function defaultQuizConfig(): QuizConfig {
  return {
    title: DEFAULT_TITLE,
    desc: DEFAULT_DESC,
    tagInput: "",
    timeLimitSec: DEFAULT_LIMIT,
    options: defaultOptionsFromSeed(),
  };
}

export function newOptionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function countSafeMines(options: QuizOption[]) {
  const safe = options.filter((o) => !o.isMine).length;
  const mines = options.filter((o) => o.isMine).length;
  return { safe, mines, total: options.length };
}

export function parseTags(tagInput: string): string[] {
  return tagInput
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function parseStoredOptions(raw: unknown): QuizOption[] | null {
  if (!Array.isArray(raw)) return null;
  const out: QuizOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" && o.id ? o.id : newOptionId();
    out.push({
      id,
      name: typeof o.name === "string" ? o.name : "",
      isMine: Boolean(o.isMine),
    });
  }
  return out.length > 0 ? out : null;
}

export function loadQuizConfig(): QuizConfig {
  if (typeof window === "undefined") return defaultQuizConfig();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultQuizConfig();
    const v = JSON.parse(raw) as Partial<QuizConfig>;
    const n = Number(v.timeLimitSec);
    const options = parseStoredOptions(v.options) ?? defaultOptionsFromSeed();
    return {
      title: typeof v.title === "string" ? v.title : DEFAULT_TITLE,
      desc: typeof v.desc === "string" ? v.desc : DEFAULT_DESC,
      tagInput: typeof v.tagInput === "string" ? v.tagInput : "",
      timeLimitSec:
        Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_LIMIT,
      options,
    };
  } catch {
    return defaultQuizConfig();
  }
}

export function saveQuizConfig(c: QuizConfig): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}
