import {
  buildSegmentFluencyMessages,
  DEFAULT_ZHIPU_MODEL,
  parseSegmentFluencyResponseContent,
  type SegmentFluencyReview,
} from "./segment-fluency";

type ChatCompletionContentPart = {
  type?: string;
  text?: string;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | ChatCompletionContentPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const ZHIPU_API_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const ZHIPU_CHAT_COMPLETIONS_URL = `${ZHIPU_API_BASE_URL}/chat/completions`;
const REQUEST_TIMEOUT_MS = 45000;
const MAX_TOKENS = 128;
const TEMPERATURE = 0.1;

export function hasZhipuApiKey(): boolean {
  return Boolean(import.meta.env.PUBLIC_ZHIPU_API_KEY?.trim());
}

export async function evaluateSegmentFluency(
  sentence: string,
): Promise<SegmentFluencyReview> {
  const input = sentence.trim();

  if (!input) {
    throw new Error("请输入要评价的句子");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ZHIPU_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: getModel(),
        messages: buildSegmentFluencyMessages(input),
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        thinking: {
          type: "disabled",
        },
      }),
      signal: controller.signal,
    });

    const data = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      throw new Error(data.error?.message?.trim() || `请求失败（${response.status}）`);
    }

    const content = readChoiceContent(data);

    if (!content) {
      throw new Error("AI 未返回可用内容");
    }

    return parseSegmentFluencyResponseContent(content);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI 请求超时，请稍后重试");
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("AI 评价失败");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getApiKey(): string {
  const apiKey = import.meta.env.PUBLIC_ZHIPU_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("未配置 AI 接口参数");
  }

  return apiKey;
}

function getModel(): string {
  const model = import.meta.env.PUBLIC_ZHIPU_MODEL?.trim();
  return model || DEFAULT_ZHIPU_MODEL;
}

function readChoiceContent(response: ChatCompletionResponse): string {
  const content = response.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();
  }

  return "";
}
