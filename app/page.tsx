"use client";

import { useState } from "react";
import { SAMPLE_RESUME } from "@/lib/sample";
import { RESUME_BEFORE, RESUME_AFTER, DIFF_POINTS } from "@/lib/showcase";
import { WhaleBackground } from "./WhaleBackground";
import type { ParsedResume, MatchResult, OptimizeResult } from "@/lib/types";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<MatchResult | null>(null);
  const [optimize, setOptimize] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function call<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "请求失败");
    return json as T;
  }

  async function handleMatch() {
    setError("");
    setMatches([]);
    setSelected(null);
    setOptimize(null);
    if (!resumeText.trim()) {
      setError("请先粘贴简历内容");
      return;
    }
    try {
      setLoading("正在解析简历...");
      const p = await call<ParsedResume>("/api/parse-resume", { resumeText });
      setParsed(p);
      setLoading("正在匹配岗位...");
      const { results } = await call<{ results: MatchResult[] }>("/api/match", p);
      setMatches(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "出错了");
    } finally {
      setLoading("");
    }
  }

  async function handleFile(file: File) {
    setError("");
    try {
      setLoading("正在读取文件...");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-file", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "文件解析失败");
      setResumeText(json.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件解析失败");
    } finally {
      setLoading("");
    }
  }

  async function handleOptimize(m: MatchResult) {
    setSelected(m);
    setOptimize(null);
    setError("");
    try {
      setLoading("正在诊断简历...");
      const r = await call<OptimizeResult>("/api/optimize", {
        resume: parsed,
        job: m.job,
      });
      setOptimize(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "出错了");
    } finally {
      setLoading("");
    }
  }

  return (
    <>
      <WhaleBackground />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Header />
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左：功能区 */}
          <div className="space-y-5">
            <ResumeInput
              resumeText={resumeText}
              setResumeText={setResumeText}
              onMatch={handleMatch}
              onSample={() => setResumeText(SAMPLE_RESUME)}
              onFile={handleFile}
              loading={loading}
            />
            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}
            {loading && (
              <p className="animate-pulse text-sm font-medium text-white">
                {loading}
              </p>
            )}
            {parsed && <ProfileCard parsed={parsed} />}
            {matches.length > 0 && (
              <MatchList
                matches={matches}
                selected={selected}
                onSelect={handleOptimize}
              />
            )}
            {selected && optimize && (
              <OptimizePanel job={selected.job.title} result={optimize} />
            )}
          </div>

          {/* 右：示例对比区 */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <ShowcasePanel />
          </div>
        </div>
      </main>
    </>
  );
}

function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl">
        🐳 AI 求职智能匹配助手
      </h1>
      <p className="mt-2 text-sm text-blue-50/90 drop-shadow">
        上传简历 → 智能匹配契合岗位 → 针对心仪岗位给出优化建议，提升初筛命中率
      </p>
    </header>
  );
}

function ShowcasePanel() {
  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur">
      <h2 className="mb-1 font-semibold text-slate-800">📝 简历优化示例</h2>
      <p className="mb-4 text-xs text-slate-500">
        看看一份简历优化前后的差别 —— 这正是右侧 AI 能帮你做的
      </p>

      <div className="space-y-3">
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
            <span className="rounded bg-red-200 px-1.5 py-0.5">修改前</span>
            平淡、无量化、缺关键词
          </div>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">
            {RESUME_BEFORE}
          </pre>
        </div>

        <div className="flex justify-center text-blue-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50/60 p-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-green-700">
            <span className="rounded bg-green-200 px-1.5 py-0.5">修改后</span>
            量化成果、补齐关键词、STAR 表达
          </div>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
            {RESUME_AFTER}
          </pre>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-blue-50/70 p-3">
        <h3 className="mb-1.5 text-xs font-semibold text-blue-800">
          优化做了什么
        </h3>
        <ul className="space-y-1 text-xs text-slate-600">
          {DIFF_POINTS.map((p, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-blue-500">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ResumeInput({
  resumeText,
  setResumeText,
  onMatch,
  onSample,
  onFile,
  loading,
}: {
  resumeText: string;
  setResumeText: (v: string) => void;
  onMatch: () => void;
  onSample: () => void;
  onFile: (file: File) => void;
  loading: string;
}) {
  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <label className="font-medium text-slate-700">上传或粘贴你的简历</label>
        <button
          onClick={onSample}
          className="text-sm text-brand hover:underline"
        >
          填入示例简历
        </button>
      </div>
      <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-3 text-sm text-slate-500 transition hover:border-brand hover:text-brand">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        点击上传简历文件（PDF / DOCX）
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        rows={10}
        placeholder="上传文件后内容会显示在这里，也可直接粘贴简历：教育背景、技能、项目/实习经历、求职意向..."
        className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand"
      />
      <button
        onClick={onMatch}
        disabled={!!loading}
        className="mt-3 w-full rounded-lg bg-brand py-2.5 font-medium text-white transition hover:bg-brand-dark disabled:opacity-50"
      >
        {loading ? loading : "开始智能匹配"}
      </button>
    </section>
  );
}

function Tags({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className={`rounded-full px-2 py-0.5 text-xs ${color}`}>
          {t}
        </span>
      ))}
    </div>
  );
}

function ProfileCard({ parsed }: { parsed: ParsedResume }) {
  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur">
      <h2 className="mb-2 font-semibold text-slate-800">简历画像</h2>
      <p className="mb-3 text-sm text-slate-600">{parsed.summary}</p>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-400">技能：</span>
          <Tags items={parsed.skills} color="bg-blue-50 text-blue-700" />
        </div>
        <div>
          <span className="text-slate-400">意向：</span>
          <Tags items={parsed.interests} color="bg-violet-50 text-violet-700" />
        </div>
      </div>
    </section>
  );
}

function MatchList({
  matches,
  selected,
  onSelect,
}: {
  matches: MatchResult[];
  selected: MatchResult | null;
  onSelect: (m: MatchResult) => void;
}) {
  return (
    <section>
      <h2 className="mb-3 font-semibold text-white drop-shadow">
        为你匹配到 {matches.length} 个岗位
      </h2>
      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m.job.id}
            className={`rounded-2xl border bg-white/90 p-4 shadow-xl backdrop-blur transition ${
              selected?.job.id === m.job.id
                ? "border-brand ring-1 ring-brand"
                : "border-white/40"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-slate-900">
                  {m.job.title}
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    {m.job.company} · {m.job.location} · {m.job.salary}
                  </span>
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-brand">{m.score}</div>
                <div className="text-xs text-slate-400">匹配度</div>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{m.reason}</p>
            {m.skillOverlap.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-slate-400">命中技能：</span>
                <Tags
                  items={m.skillOverlap}
                  color="bg-green-50 text-green-700"
                />
              </div>
            )}
            <button
              onClick={() => onSelect(m)}
              className="mt-3 rounded-lg border border-brand px-3 py-1.5 text-sm text-brand transition hover:bg-brand hover:text-white"
            >
              诊断简历并优化
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function OptimizePanel({
  job,
  result,
}: {
  job: string;
  result: OptimizeResult;
}) {
  const color =
    result.hitRate >= 70
      ? "text-green-600"
      : result.hitRate >= 40
        ? "text-amber-500"
        : "text-red-500";
  return (
    <section className="rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur">
      <h2 className="mb-3 font-semibold text-slate-800">
        《{job}》简历诊断与优化
      </h2>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-slate-500">预估初筛命中率</span>
        <span className={`text-3xl font-bold ${color}`}>{result.hitRate}%</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-1.5 text-sm font-medium text-green-700">
            ✓ 已命中关键词
          </h3>
          <Tags items={result.matchedKeywords} color="bg-green-50 text-green-700" />
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-medium text-red-600">
            ✗ 建议补充关键词
          </h3>
          <Tags items={result.missingKeywords} color="bg-red-50 text-red-600" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-1.5 text-sm font-medium text-slate-700">优化建议</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          {result.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="mb-1.5 text-sm font-medium text-slate-700">
          针对该岗位的改写示例
        </h3>
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          {result.rewriteExample}
        </pre>
      </div>
    </section>
  );
}
