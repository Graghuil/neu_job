// LLM 适配层 —— DeepSeek（OpenAI 兼容 /chat/completions）
// 用纯 fetch 调用，函数签名保持不变，上层 API 无需改动

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

interface ChatCompletionResponse {
  choices: { message: { content: string } }[];
}

async function createMessage(
  system: string,
  user: string,
  maxTokens: number,
  jsonMode = false
): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("缺少 DEEPSEEK_API_KEY 环境变量");
  const base = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(
    /\/$/,
    ""
  );

  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`DeepSeek API 错误 ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as ChatCompletionResponse;
  return json.choices?.[0]?.message?.content || "";
}

/** 通用对话，返回纯文本 */
export async function chat(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<string> {
  return createMessage(system, user, maxTokens);
}

/** 要求模型输出 JSON 并解析 */
export async function chatJSON<T>(
  system: string,
  user: string,
  maxTokens = 1500
): Promise<T> {
  const raw = await createMessage(
    `${system}\n\n你必须只输出合法的 JSON，不要任何额外文字、解释或 markdown 代码块标记。`,
    user,
    maxTokens,
    true // 启用 JSON 模式
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
