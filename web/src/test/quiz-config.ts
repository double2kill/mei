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

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TAUNT_LAST_SAFE_MISS = [
  "再摸一格就全员安全，你偏偏戳到了女巫的营业指标",
  "全场离通关最近的人，恭喜反向通关",
  "差一步上岸，一脚踩进童话反面",
  "最后一格安全在隔壁，你精准导航到毒药",
  "清台进度条已经 99%，女巫帮你点了格式化",
] as const;

const TAUNT_FIRST_HIT = [
  "手气不错，一发入魂，毒药直达",
  "恭喜解锁：开局即退场成就",
  "爆冷！你成功避开所有安全选项",
  "恭喜触发隐藏结局：当场蒸发",
  "女巫：就你了，别问为什么",
  "很遗憾但也很荣幸，你是本轮唯一中毒玩家",
  "第一下就中奖，女巫都愣了一秒",
  "开局即巅峰，巅峰在毒药格",
] as const;

const TAUNT_EARLY = [
  "恭喜爆雷！女巫精准点名你，直接带走",
  "恭喜成为本局最短生命周期选手",
  "恭喜你成功抽中女巫的毒药，今晚KPI：躺平",
  "安全区还在热身，你先去观众席了",
  "进度条刚起步，你选择了毒药快进键",
  "女巫：前面白点了，这一格算加班",
] as const;

const TAUNT_LATE = [
  "你都摸到门把手了，门框突然决定收费",
  "女巫：别人是概率，你是必然",
  "你这运气，连毒药都精准导航",
  "你抽到的不是毒药，是结局快进键",
  "恭喜成为毒药体验官，仅此一位",
  "你抽中的不是数字，是命运的终点",
  "女巫看了你一眼，然后你就没了",
  "恭喜进入观战模式，无需操作",
] as const;

const TAUNT_GENERAL = [
  "你中奖了，不过是“反向人生大奖”",
  "中奖提示：请立即停止呼吸（bushi）",
  "你不是踩雷，是雷长你脚下",
  "中奖啦！奖品是：女巫特调一杯（永久有效）",
] as const;

export type MineTauntContext = {
  revealedSafeCount: number;
  safeTotal: number;
};

function pickFromLines(lines: readonly string[]): string {
  if (lines.length === 0) return "";
  const i = Math.floor(Math.random() * lines.length);
  return lines[i] ?? lines[0];
}

export function pickRandomMineTaunt(ctx: MineTauntContext): string {
  const r = Math.max(0, Math.floor(ctx.revealedSafeCount));
  const s = Math.max(0, Math.floor(ctx.safeTotal));
  if (s <= 0) return pickFromLines(TAUNT_GENERAL);
  if (s >= 2 && r === s - 1) return pickFromLines(TAUNT_LAST_SAFE_MISS);
  if (r === 0) return pickFromLines(TAUNT_FIRST_HIT);
  const ratio = r / s;
  if (ratio < 1 / 3) return pickFromLines(TAUNT_EARLY);
  if (ratio >= 2 / 3) return pickFromLines(TAUNT_LATE);
  return pickFromLines(TAUNT_GENERAL);
}

export type QuizSeedMineMode = "fixed" | "randomSingle";

export function optionsFromRandomMineCount(mineCount: number): QuizOption[] {
  const list = QUIZ_RAW.map((r) => ({
    id: `seed-${r.order}`,
    name: r.name,
    isMine: false,
  }));
  if (list.length === 0) return list;
  const maxMines = Math.max(1, list.length - 1);
  const n = Math.min(Math.max(1, Math.floor(mineCount)), maxMines);
  const indices = new Set<number>();
  while (indices.size < n) {
    indices.add(Math.floor(Math.random() * list.length));
  }
  return list.map((o, i) => ({ ...o, isMine: indices.has(i) }));
}

export function optionsFromQuizSeed(mineMode: QuizSeedMineMode): QuizOption[] {
  if (mineMode === "fixed") {
    return QUIZ_RAW.map((r) => ({
      id: `seed-${r.order}`,
      name: r.name,
      isMine: !r.safe,
    }));
  }
  return optionsFromRandomMineCount(1);
}

export const DEFAULT_TITLE = "女巫的毒药 1.1（湄师傅 杭城小师赛）";
export const DEFAULT_DESC = "以下有一个身份是女巫的毒药，请避开女巫的毒药选择";
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

export const RANDOM_POISON_COUNT_KEY = "mei:random-poison-count";
export const DEFAULT_RANDOM_POISON_COUNT = 1;

export function maxRandomPoisonCount(): number {
  return Math.max(1, QUIZ_RAW.length - 1);
}

export function clampRandomPoisonCount(n: number): number {
  const max = maxRandomPoisonCount();
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_RANDOM_POISON_COUNT;
  return Math.min(max, Math.max(1, v));
}

export function loadRandomPoisonCount(): number {
  if (typeof window === "undefined") return DEFAULT_RANDOM_POISON_COUNT;
  try {
    const raw = window.localStorage.getItem(RANDOM_POISON_COUNT_KEY);
    if (raw == null || raw === "") return DEFAULT_RANDOM_POISON_COUNT;
    return clampRandomPoisonCount(JSON.parse(raw) as number);
  } catch {
    return DEFAULT_RANDOM_POISON_COUNT;
  }
}

export function saveRandomPoisonCount(n: number): void {
  window.localStorage.setItem(
    RANDOM_POISON_COUNT_KEY,
    JSON.stringify(clampRandomPoisonCount(n)),
  );
}

export function defaultOptionsFromSeed(): QuizOption[] {
  return optionsFromQuizSeed("fixed");
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

export function thunderRandomRoundConfig(mineCount: number): QuizConfig {
  const k = clampRandomPoisonCount(mineCount);
  const desc =
    k === 1
      ? DEFAULT_DESC
      : `以下有 ${k} 个身份中了女巫的毒药，请避开女巫的毒药选择`;
  return {
    title: DEFAULT_TITLE,
    desc,
    tagInput: "",
    timeLimitSec: DEFAULT_LIMIT,
    options: optionsFromRandomMineCount(k),
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
      timeLimitSec: Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_LIMIT,
      options,
    };
  } catch {
    return defaultQuizConfig();
  }
}

export function saveQuizConfig(c: QuizConfig): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}
