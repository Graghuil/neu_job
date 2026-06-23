"use client";

import { useState } from "react";
import { SAMPLE_RESUME } from "@/lib/sample";
import { call } from "@/lib/api";
import { Card, ResumeInput } from "./components";
import { RadarChart } from "./RadarChart";
import type { ParsedResume, AssessmentResult } from "@/lib/types";

export function AssessView({
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
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState("");

  async function handleAssess() {
    setError("");
    setResult(null);
    if (!resumeText.trim()) {
      setError("请先粘贴或上传简历内容");
      return;
    }
    try {
      let p = parsed;
      if (!p || p.rawText !== resumeText) {
        setLoading("正在解析简历...");
        p = await call<ParsedResume>("/api/parse-resume", { resumeText });
        setParsed(p);
      }
      setLoading("正在评估能力...");
      const r = await call<AssessmentResult>("/api/assess", p);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "出错了");
    } finally {
      setLoading("");
    }
  }

  const levelColor =
    result &&
    (result.overall >= 80
      ? "text-green-600"
      : result.overall >= 60
        ? "text-amber-500"
        : "text-red-500");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-700">
            候选人信息评估
          </h2>
          <p className="mb-3 text-sm text-slate-500">
            上传简历，AI 从五个维度给出能力画像与雷达图
          </p>
        </div>
        <ResumeInput
          resumeText={resumeText}
          setResumeText={setResumeText}
          onSubmit={handleAssess}
          onSample={() => setResumeText(SAMPLE_RESUME)}
          onFile={onFile}
          loading={loading || fileLoading}
          submitLabel="开始评估"
        />
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-5">
        {result && (
          <>
            <Card>
              <div className="mb-2 flex items-end justify-between">
                <h3 className="font-semibold text-slate-800">能力五维图</h3>
                <div className="text-right">
                  <span className={`text-3xl font-bold ${levelColor}`}>
                    {result.overall}
                  </span>
                  <span className="ml-1 text-sm text-slate-400">/100</span>
                  <div className="text-xs text-slate-500">
                    评级：{result.level}
                  </div>
                </div>
              </div>
              <div className="flex justify-center py-2">
                <RadarChart data={result.dimensions} />
              </div>
              <p className="mt-2 rounded-lg bg-amber-50/70 p-3 text-sm text-slate-600">
                {result.summary}
              </p>
            </Card>

            <Card>
              <h3 className="mb-2 font-semibold text-slate-800">各维度点评</h3>
              <ul className="space-y-2 text-sm">
                {result.dimensions.map((d) => (
                  <li key={d.name} className="flex gap-2">
                    <span className="w-24 shrink-0 text-slate-500">
                      {d.name}
                    </span>
                    <span className="w-10 shrink-0 font-semibold text-amber-600">
                      {d.score}
                    </span>
                    <span className="text-slate-600">{d.comment}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <h3 className="mb-2 text-sm font-medium text-green-700">
                  ✓ 亮点
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="mb-2 text-sm font-medium text-amber-600">
                  ↑ 待提升
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {result.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}
        {!result && !loading && (
          <Card className="flex h-full items-center justify-center text-sm text-slate-400">
            评估结果将在这里显示
          </Card>
        )}
      </div>
    </div>
  );
}
