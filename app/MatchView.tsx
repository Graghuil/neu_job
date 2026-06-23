"use client";

import { useState } from "react";
import { SAMPLE_RESUME } from "@/lib/sample";
import { RESUME_BEFORE, RESUME_AFTER, DIFF_POINTS } from "@/lib/showcase";
import { call } from "@/lib/api";
import { Tags, Card, ResumeInput, ProfileCard } from "./components";
import type {
  ParsedResume,
  MatchResult,
  OptimizeResult,
} from "@/lib/types";

export function MatchView({
  resumeText,
  setResumeText,
  parsed,
  setParsed,
  onFile,
  fileLoading,
  error,
  setError,
}: {
  resumeText: string;
  setResumeText: (v: string) => void;
  parsed: ParsedResume | null;
  setParsed: (p: ParsedResume | null) => void;
  onFile: (f: File) => void;
  fileLoading: string;
  error: string;
  setError: (e: string) => void;
}) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<MatchResult | null>(null);
  const [optimize, setOptimize] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState("");

  async function handleMatch() {
    setError("");
    setMatches([]);
    setSelected(null);
    setOptimize(null);
    if (!resumeText.trim()) {
      setError("请先粘贴或上传简历内容");
      return;
    }
    try {
      setLoading("正在解析简历...");
      const p = await call<ParsedResume>("/api/parse-resume", { resumeText });
      setParsed(p);
      setLoading("正在匹配岗位...");
      const { results } = await call<{ results: MatchResult[] }>(
        "/api/match",
        p
      );
      setMatches(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "出错了");
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <ResumeInput
          resumeText={resumeText}
          setResumeText={setResumeText}
          onSubmit={handleMatch}
          onSample={() => setResumeText(SAMPLE_RESUME)}
          onFile={onFile}
          loading={loading || fileLoading}
          submitLabel="开始智能匹配"
        />
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
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
      <div className="lg:sticky lg:top-8 lg:h-fit">
        <ShowcasePanel />
      </div>
    </div>
  );
}

function ShowcasePanel() {
  return (
    <Card>
      <h2 className="mb-1 font-semibold text-slate-800">📝 简历优化示例</h2>
      <p className="mb-4 text-xs text-slate-500">
        看看一份简历优化前后的差别 —— 这正是 AI 能帮你做的
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
        <div className="flex justify-center text-amber-500">
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
      <div className="mt-4 rounded-xl bg-amber-50/70 p-3">
        <h3 className="mb-1.5 text-xs font-semibold text-amber-800">
          优化做了什么
        </h3>
        <ul className="space-y-1 text-xs text-slate-600">
          {DIFF_POINTS.map((p, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-amber-500">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
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
      <h2 className="mb-3 font-semibold text-slate-700">
        为你匹配到 {matches.length} 个岗位
      </h2>
      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m.job.id}
            className={`rounded-2xl border bg-white/85 p-4 shadow-xl backdrop-blur transition ${
              selected?.job.id === m.job.id
                ? "border-amber-500 ring-1 ring-amber-500"
                : "border-white/60"
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
                <div className="text-2xl font-bold text-amber-600">
                  {m.score}
                </div>
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
              className="mt-3 rounded-lg border border-amber-500 px-3 py-1.5 text-sm text-amber-600 transition hover:bg-amber-500 hover:text-white"
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
    <Card>
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
          <Tags
            items={result.matchedKeywords}
            color="bg-green-50 text-green-700"
          />
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
    </Card>
  );
}
