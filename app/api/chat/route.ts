import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/claude";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `你是专业、友善的 AI 求职顾问，服务对象多为学生和应届/初级求职者。
你可以解答：简历撰写、岗位选择、面试准备、职业规划、薪资谈判、行业认知等求职相关问题。
回答要具体、可执行、有条理；适当用要点。语气专业但亲切，简洁不啰嗦。
如果问题与求职/职业发展无关，礼貌说明你专注于求职话题并把话题引导回来。`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages?: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "消息为空" }, { status: 400 });
    }

    // 仅保留最近若干轮，拼成对话上下文交给单轮接口
    const recent = messages.slice(-10);
    const convo = recent
      .map((m) => `${m.role === "user" ? "用户" : "顾问"}：${m.content}`)
      .join("\n");

    const reply = await chat(
      SYSTEM,
      `以下是对话历史，请作为"顾问"接着回答用户最后一句：\n\n${convo}\n\n顾问：`,
      1200
    );

    return NextResponse.json({ reply: reply.trim() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "回答失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
