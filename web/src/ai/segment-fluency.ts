export type SegmentFluencyMessage = {
  role: "system" | "user";
  content: string;
};

export type SegmentFluencyReview = {
  score: number;
  reason: string;
};

export const DEFAULT_ZHIPU_MODEL = "glm-4.7-flash";

const MIN_SCORE = 0;
const MAX_SCORE = 100;
const HIGH_FLUENCY_SCORE = 85;
const MEDIUM_FLUENCY_SCORE = 60;
const JSON_FENCE_RE = /```(?:json)?\s*([\s\S]*?)```/i;
const SCORE_RE = /(-?\d{1,3})(?:\s*分|\/\s*100|%)/;
const SYSTEM_PROMPT = [
  "你是中文编辑。",
  "你只判断句子本身是否通顺自然，不判断它是否和任何标准答案一致。",
  "评分要严格，宁可保守，不要宽松。",
  "如果句子是残缺短语、词语堆砌、语义跳跃、搭配明显异常、主谓宾不完整、缩略语过多导致不自然，应判为不够通顺。",
  "不要脑补作者想表达的原意，不要根据常识自动补全缺失成分，不要把缩略语擅自扩写成完整句子。",
  "只有在原句本身已经完整、清楚、自然时，才可以给 85 分及以上。",
  '你必须只返回 JSON，不要输出 markdown，不要补充解释。',
  'JSON 结构必须是 {"score":0-100的整数,"reason":"一句简短理由"}。',
].join("");

export function buildSegmentFluencyMessages(
  sentence: string,
): SegmentFluencyMessage[] {
  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `请评价这句话是否通顺自然：${sentence}`,
    },
  ];
}

export function parseSegmentFluencyResponseContent(
  content: string,
): SegmentFluencyReview {
  const text = content.trim();
  const jsonCandidate = extractJsonCandidate(text);

  if (jsonCandidate) {
    try {
      const parsed = JSON.parse(jsonCandidate) as Record<string, unknown>;
      return {
        score: normalizeScore(parsed.score),
        reason: pickString(parsed, ["reason", "analysis", "comment"]) || text,
      };
    } catch {}
  }

  return {
    score: inferScore(text),
    reason: text || "未拿到可用评价",
  };
}

export function labelSegmentFluency(score: number): string {
  if (score >= HIGH_FLUENCY_SCORE) return "通顺";
  if (score >= MEDIUM_FLUENCY_SCORE) return "基本通顺";
  return "不够通顺";
}

function extractJsonCandidate(content: string): string | null {
  const fenced = content.match(JSON_FENCE_RE)?.[1]?.trim();
  if (fenced) return fenced;

  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return content.slice(start, end + 1).trim();
  }

  return null;
}

function pickString(
  source: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function normalizeScore(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampScore(Math.round(value));
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) {
      return clampScore(Math.round(parsed));
    }
  }

  return MIN_SCORE;
}

function clampScore(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
}

function inferScore(content: string): number {
  const matchedScore = content.match(SCORE_RE)?.[1];
  if (matchedScore) {
    return clampScore(Number(matchedScore));
  }

  if (/不通顺|欠通顺|生硬|别扭/.test(content)) {
    return 35;
  }

  if (/基本通顺|较通顺|还算通顺|大体通顺/.test(content)) {
    return 70;
  }

  if (/通顺|自然|流畅/.test(content)) {
    return 90;
  }

  return MIN_SCORE;
}
