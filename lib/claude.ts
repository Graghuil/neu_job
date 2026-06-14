// Claude 适配层 —— 纯 fetch 调用 Anthropic 原生 /v1/messages
// 不用官方 SDK：部分网关 WAF 会拦截 SDK 的 User-Agent，故自行控制请求头

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

interface AnthropicResponse {
  content: { type: string; text?: string }[];
}

async function createMessage(
  system: string,
  user: string,
  maxTokens: number
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("缺少 ANTHROPIC_API_KEY 环境变量");
  const base = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(
    /\/$/,
    ""
  );

  const res = await fetch(`${base}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      // 用普通 UA，避免网关 WAF 拦截 SDK 默认的 Anthropic/JS
      "User-Agent": "Mozilla/5.0 (compatible; ai-job-matcher/1.0)",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Claude API 错误 ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as AnthropicResponse;
  const block = json.content.find((b) => b.type === "text");
  return block?.text || "";
}

/** 通用对话，返回纯文本 */
export async function chat(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<string> {
  return createMessage(system, user, maxTokens);
}

/** 要求 Claude 输出 JSON 并解析 */
export async function chatJSON<T>(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<T> {
  const raw = await createMessage(
    `${system}\n\n你必须只输出合法的 JSON，不要任何额外文字、解释或 markdown 代码块标记。直接以 { 开头。`,
    user,
    maxTokens
  );
  return JSON.parse(extractJSON(raw)) as T;
}

/** 从模型返回文本中稳健提取 JSON 对象 */
function extractJSON(s: string): string {
  let t = s.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return t.slice(start, end + 1);
  }
  return t;
}
