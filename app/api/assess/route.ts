import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/claude";
import type { ParsedResume, AssessmentResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// 固定五个评估维度，保证雷达图轴稳定
const DIMENSIONS = [
  "专业技能",
  "项目经历",
  "教育背景",
  "综合素质",
  "岗位匹配潜力",
];

const SYSTEM = `你是资深 HR 与人才测评专家。请基于求职者简历，从以下五个固定维度做客观评估，每个维度给 0-100 整数分并附一句点评。
五个维度（顺序必须保持一致）：${DIMENSIONS.join("、")}。
评分要克制、有区分度，避免全部高分。
输出 JSON，字段：
- dimensions: 长度为 5 的数组，每项 { "name": 维度名(与上面完全一致), "score": 0-100整数, "comment": "一句点评" }
- overall: 综合得分 0-100 整数(可与各维度加权但需自洽)
- level: 评级，从 "优秀"/"良好"/"中等"/"待提升" 四选一
- strengths: 2-4 条亮点
- improvements: 2-4 条待提升建议
- summary: 一句话总评`;

export async function POST(req: NextRequest) {
  try {
    const resume = (await req.json()) as ParsedResume;
    if (!resume?.skills) {
      return NextResponse.json({ error: "请先解析简历" }, { status: 400 });
    }

    const result = await chatJSON<AssessmentResult>(
      SYSTEM,
      `【求职者画像】${resume.summary}\n技能：${resume.skills.join(
        "、"
      )}\n经历：${resume.experiences.join("；")}\n教育：${
        resume.education
      }\n求职意向：${resume.interests.join("、")}`,
      1500
    );

    // 兜底：保证维度顺序与数量正确，避免雷达图错轴
    const byName = new Map(
      (result.dimensions || []).map((d) => [d.name, d])
    );
    result.dimensions = DIMENSIONS.map((name) => {
      const d = byName.get(name);
      return {
        name,
        score: Math.max(0, Math.min(100, Math.round(d?.score ?? 0))),
        comment: d?.comment ?? "",
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "评估失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
