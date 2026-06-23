import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/claude";
import { loadJobs } from "@/lib/jobs";
import type { MbtiResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TYPES = new Set([
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
]);

const SYSTEM = `你是结合 MBTI 人格理论与职业规划的顾问。给定用户的 MBTI 类型和一份候选岗位库，请输出该人格的职场画像与推荐岗位。
推荐岗位优先从给出的岗位库里选（用其岗位名称），最多 4 个，按契合度降序；岗位库不够贴合时可补充通用方向。
输出 JSON，字段：
- type: 规范化的四字母大写 MBTI，如 INTJ
- nickname: 人格别称，如 建筑师
- traits: 4-6 个性格关键词
- strengths: 3-5 条职场优势
- watchouts: 2-4 条需要注意/扬长避短的点
- recommendedJobs: 数组(最多4项)，每项 { "title": 岗位名, "reason": "为什么契合这个人格", "fit": 0-100整数契合度 }
- workStyle: 一句话描述最适合该人格的工作方式/团队环境`;

export async function POST(req: NextRequest) {
  try {
    const { mbti } = (await req.json()) as { mbti?: string };
    const type = (mbti || "").trim().toUpperCase();
    if (!TYPES.has(type)) {
      return NextResponse.json(
        { error: "请输入有效的 MBTI 类型（如 INTJ、ENFP）" },
        { status: 400 }
      );
    }

    const jobList = loadJobs()
      .map((j) => `${j.title}（${j.category}，技能:${j.skills.join("/")}）`)
      .join("\n");

    const result = await chatJSON<MbtiResult>(
      SYSTEM,
      `用户 MBTI 类型：${type}\n\n【候选岗位库】\n${jobList}`,
      1500
    );
    result.type = type;

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "分析失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
