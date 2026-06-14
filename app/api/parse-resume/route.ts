import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/claude";
import type { ParsedResume } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `你是资深 HR 与简历分析专家。请把用户提供的简历文本解析为结构化信息。
输出 JSON，字段：
- name: 姓名(可空字符串)
- summary: 一句话求职者画像
- skills: 技能数组(标准化的技术/能力关键词)
- experiences: 经历数组(每条为一句话概括的实习/项目经历)
- education: 教育背景(学校+专业+学历)
- interests: 求职意向/兴趣方向数组(如 后端开发、产品运营)`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "请提供简历文本" }, { status: 400 });
    }

    const parsed = await chatJSON<Omit<ParsedResume, "rawText">>(
      SYSTEM,
      `简历文本：\n${resumeText}`
    );

    return NextResponse.json({ ...parsed, rawText: resumeText });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "解析失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
