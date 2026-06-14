import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/claude";
import type { ParsedResume, Job, OptimizeResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `你是资深简历优化顾问，熟悉 ATS 初筛规则。请对比"求职者简历"与"目标岗位 JD"，给出诊断与优化方案。
输出 JSON，字段：
- hitRate: 预估该简历通过岗位初筛的命中率(0-100 整数)，依据关键词/技能/经历匹配程度客观评估
- matchedKeywords: 简历已命中的岗位关键词数组
- missingKeywords: 岗位要求但简历缺失/未突出的关键词数组
- suggestions: 具体可执行的优化建议数组(4-6 条，针对该岗位，强调量化成果、STAR、关键词补齐)
- rewriteExample: 一段针对该 JD 改写后的简历要点示例(突出匹配该岗位，可量化、可信)`;

export async function POST(req: NextRequest) {
  try {
    const { resume, job } = (await req.json()) as {
      resume: ParsedResume;
      job: Job;
    };
    if (!resume?.skills || !job?.id) {
      return NextResponse.json({ error: "缺少简历或岗位信息" }, { status: 400 });
    }

    const result = await chatJSON<OptimizeResult>(
      SYSTEM,
      `【求职者简历】\n画像：${resume.summary}\n技能：${resume.skills.join(
        "、"
      )}\n经历：${resume.experiences.join("；")}\n教育：${
        resume.education
      }\n\n【目标岗位】\n${job.title}@${job.company}\n要求技能：${job.skills.join(
        "、"
      )}\nJD：${job.description}`,
      2000
    );

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "优化分析失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
