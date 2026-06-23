import { NextRequest, NextResponse } from "next/server";
import { findDuplicate, insertJob, countJobs } from "@/lib/db";
import type { Job } from "@/lib/types";

export const runtime = "nodejs";

// 用户提交岗位的入参（不含 id，id 由服务端生成）
type SubmitPayload = Partial<Omit<Job, "id" | "skills">> & {
  skills?: string[] | string;
};

const MAX_LEN = {
  title: 60,
  company: 60,
  category: 20,
  location: 30,
  salary: 40,
  experience: 20,
  description: 2000,
};

/** 把 skills 统一成去空白、去重后的字符串数组 */
function normalizeSkills(raw: string[] | string | undefined): string[] {
  const arr = Array.isArray(raw)
    ? raw
    : (raw || "").split(/[,，、\s]+/);
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))].slice(0, 12);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitPayload;

    const title = (body.title || "").trim();
    const company = (body.company || "").trim();
    const location = (body.location || "").trim();
    const category = (body.category || "").trim() || "其他";
    const salary = (body.salary || "").trim() || "面议";
    const experience = (body.experience || "").trim() || "不限";
    const description = (body.description || "").trim();
    const skills = normalizeSkills(body.skills);

    // 必填校验：标题、公司、城市、岗位描述
    if (!title || !company || !location) {
      return NextResponse.json(
        { error: "请至少填写岗位名称、公司和工作城市" },
        { status: 400 }
      );
    }
    if (description.length < 10) {
      return NextResponse.json(
        { error: "岗位描述太短了，多写一点更有用（至少 10 字）" },
        { status: 400 }
      );
    }
    // 长度防护
    for (const [k, max] of Object.entries(MAX_LEN)) {
      const v = { title, company, category, location, salary, experience, description }[
        k as keyof typeof MAX_LEN
      ];
      if (v && v.length > max) {
        return NextResponse.json(
          { error: `「${k}」内容过长，请控制在 ${max} 字以内` },
          { status: 400 }
        );
      }
    }

    // 查重：标题+公司+城市归一化后比对
    const existing = findDuplicate(title, company, location);
    if (existing) {
      return NextResponse.json(
        {
          duplicate: true,
          error: `这个岗位已经在库里啦：${existing.company} · ${existing.title}（${existing.location}）`,
        },
        { status: 409 }
      );
    }

    const job = insertJob({
      title,
      company,
      category,
      location,
      salary,
      experience,
      skills,
      description,
    });

    return NextResponse.json({ ok: true, job, total: countJobs() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "提交失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
