// Claude (Anthropic) 适配层 —— 封装 chat / JSON 输出
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("缺少 ANTHROPIC_API_KEY 环境变量");
  if (!client) {
    // 支持自定义网关 baseURL；未设置则用 Anthropic 官方
    const baseURL = process.env.ANTHROPIC_BASE_URL || undefined;
    client = new Anthropic({ apiKey: key, baseURL });
  }
  return client;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

/** 通用对话，返回纯文本 */
export async function chat(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<string> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

/** 要求 Claude 输出 JSON 并解析 */
export async function chatJSON<T>(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<T> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: `${system}\n\n你必须只输出合法的 JSON，不要任何额外文字、解释或 markdown 代码块标记。直接以 { 开头。`,
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  return JSON.parse(extractJSON(raw)) as T;
}

/** 从模型返回文本中稳健提取 JSON 对象 */
function extractJSON(s: string): string {
  let t = s.trim();
  // 去掉 ```json ... ``` 包裹
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  // 截取第一个 { 到最后一个 }
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return t.slice(start, end + 1);
  }
  return t;
}
