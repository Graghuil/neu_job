import { NextRequest, NextResponse } from "next/server";
import { chatJSON } from "@/lib/claude";
import { loadJobs, listCities } from "@/lib/jobs";
import type { CityJobResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `你是熟悉各城市就业市场的求职顾问。给定一个城市的岗位列表和用户可选的求职方向，请为每个岗位做星级评分。
评分维度：岗位吸引力（薪资/成长/公司）、对应届/学生的友好度、与用户求职方向的契合度（若提供）。
星级用 1-5，可出现 0.5 档，要有区分度，不要全部高分。
输出 JSON：{ "results": [ { "id": 岗位id, "stars": 1-5的数字(可0.5), "reason": "一句话打分理由", "highlights": ["亮点标签"] } ] }
highlights 为 1-3 个简短标签，如 "高薪"、"应届友好"、"成长快"、"对口"、"大厂"、"远程"。按 stars 降序。`;

export async function POST(req: NextRequest) {
  try {
    const { city, direction } = (await req.json()) as {
      city?: string;
      direction?: string;
    };
    const target = (city || "").trim();
    if (!target) {
      return NextResponse.json({ error: "请输入城市" }, { status: 400 });
    }

    const all = loadJobs();
    // 该城市岗位 + 远程岗（远程对任何城市都可投）
    const inCity = all.filter(
      (j) => j.location === target || j.location.includes(target)
    );
    const remote = all.filter((j) => j.location === "远程");
    const pool = [...inCity, ...(target === "远程" ? [] : remote)];

    if (pool.length === 0) {
      return NextResponse.json(
        {
          error: `暂无「${target}」的岗位数据，可尝试：${listCities().join("、")}`,
          cities: listCities(),
        },
        { status: 404 }
      );
    }

    const jobList = pool
      .map(
        (j) =>
          `id=${j.id} | ${j.title} @${j.company} | ${j.location} | ${j.salary} | ${j.experience} | 领域:${j.category} | 技能:${j.skills.join(
            "/"
          )}`
      )
      .join("\n");

    const ranked = await chatJSON<{
      results: {
        id: string;
        stars: number;
        reason: string;
        highlights: string[];
      }[];
    }>(
      SYSTEM,
      `目标城市：${target}\n用户求职方向：${direction?.trim() || "（未指定，按岗位综合吸引力评分）"}\n\n【该城市岗位】\n${jobList}`,
      2000
    );

    const byId = new Map(pool.map((j) => [j.id, j]));
    const results: CityJobResult[] = (ranked.results || [])
      .map((r) => {
        const job = byId.get(r.id);
        if (!job) return null;
        const stars = Math.max(0, Math.min(5, Math.round(r.stars * 2) / 2));
        return {
          job,
          stars,
          reason: r.reason,
          highlights: Array.isArray(r.highlights) ? r.highlights.slice(0, 3) : [],
        } as CityJobResult;
      })
      .filter((x): x is CityJobResult => x !== null)
      .sort((a, b) => b.stars - a.stars);

    return NextResponse.json({ city: target, results });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "匹配失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
