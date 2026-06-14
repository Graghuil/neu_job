import { NextRequest, NextResponse } from "next/server";
import { loadJobs } from "@/lib/jobs";
import { chatJSON } from "@/lib/claude";
import type { ParsedResume, MatchResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** 技能标签重合 */
function skillOverlap(resumeSkills: string[], jobSkills: string[]): string[] {
  const lower = resumeSkills.map((s) => s.toLowerCase());
  return jobSkills.filter((js) =>
    lower.some(
      (rs) => rs.includes(js.toLowerCase()) || js.toLowerCase().includes(rs)
    )
  );
}

const SYSTEM = `你是资深求职顾问。给定求职者画像和岗位库，请评估每个岗位与求职者的匹配度并排序。
评估维度：技能契合、经历相关性、求职意向匹配、经验要求是否合适。
输出 JSON：{ "matches": [ { "id": 岗位id, "score": 0-100整数综合匹配度, "semanticScore": 0-100整数语义契合度, "reason": "一句话匹配理由(突出契合点与可补强点)" } ] }
只返回匹配度 >= 40 的岗位，按 score 降序，最多 6 个。`;

export async function POST(req: NextRequest) {
  try {
    const resume = (await req.json()) as ParsedResume;
    if (!resume?.skills) {
      return NextResponse.json({ error: "请先解析简历" }, { status: 400 });
    }

    const jobs = loadJobs();

    const jobList = jobs
      .map(
        (j) =>
          `id=${j.id} | ${j.title} @${j.company} | 领域:${j.category} | 经验:${j.experience} | 技能:${j.skills.join(
            "、"
          )} | ${j.description}`
      )
      .join("\n");

    const ranked = await chatJSON<{
      matches: {
        id: string;
        score: number;
        semanticScore: number;
        reason: string;
      }[];
    }>(
      SYSTEM,
      `【求职者】\n画像：${resume.summary}\n技能：${resume.skills.join(
        "、"
      )}\n经历：${resume.experiences.join("；")}\n教育：${
        resume.education
      }\n求职意向：${resume.interests.join("、")}\n\n【岗位库】\n${jobList}`,
      2000
    );

    const results: MatchResult[] = (ranked.matches || [])
      .map((m) => {
        const job = jobs.find((j) => j.id === m.id);
        if (!job) return null;
        return {
          job,
          score: m.score,
          semanticScore: m.semanticScore,
          skillOverlap: skillOverlap(resume.skills, job.skills),
          reason: m.reason,
        } as MatchResult;
      })
      .filter((x): x is MatchResult => x !== null);

    return NextResponse.json({ results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "匹配失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
