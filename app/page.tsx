"use client";

import { useState } from "react";
import { SAMPLE_RESUME } from "@/lib/sample";
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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Header />
      {/* 后续区块见下方追加 */}
      <ResumeInput
        resumeText={resumeText}
        setResumeText={setResumeText}
        onMatch={handleMatch}
        onSample={() => setResumeText(SAMPLE_RESUME)}
        loading={loading}
      />
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {loading && (
        <p className="mt-4 animate-pulse text-sm text-brand">{loading}</p>
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
    </main>
  );
}

function Header() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-slate-900">AI 求职智能匹配助手</h1>
      <p className="mt-2 text-slate-500">
        粘贴简历 → 智能匹配契合岗位 → 针对心仪岗位给出简历优化建议，提升初筛命中率
      </p>
    </header>
  );
}

function ResumeInput({
  resumeText,
  setResumeText,
  onMatch,
  onSample,
  loading,
}: {
  resumeText: string;
  setResumeText: (v: string) => void;
  onMatch: () => void;
  onSample: () => void;
  loading: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <label className="font-medium text-slate-700">粘贴你的简历</label>
        <button
          onClick={onSample}
          className="text-sm text-brand hover:underline"
        >
          填入示例简历
        </button>
      </div>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        rows={10}
        placeholder="把简历内容粘贴到这里，包含教育背景、技能、项目/实习经历、求职意向..."
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
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
    <section className="mt-6">
      <h2 className="mb-3 font-semibold text-slate-800">
        为你匹配到 {matches.length} 个岗位
      </h2>
      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={m.job.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
              selected?.job.id === m.job.id
                ? "border-brand ring-1 ring-brand"
                : "border-slate-200"
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
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
