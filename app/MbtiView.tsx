"use client";

import { useState } from "react";
import { call } from "@/lib/api";
import { Card, Tags } from "./components";
import type { MbtiResult } from "@/lib/types";

const ALL_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export function MbtiView() {
  const [mbti, setMbti] = useState("");
  const [result, setResult] = useState<MbtiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(type: string) {
    const t = type.trim().toUpperCase();
    setMbti(t);
    setError("");
    setResult(null);
    if (!/^[EI][NS][FT][JP]$/.test(t)) {
      setError("请输入有效的 MBTI 类型（如 INTJ、ENFP）");
      return;
    }
    setLoading(true);
    try {
      const r = await call<MbtiResult>("/api/mbti", { mbti: t });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "出错了");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <h2 className="mb-1 text-lg font-semibold text-slate-700">
            MBTI 人格分析
          </h2>
          <p className="mb-3 text-sm text-slate-500">
            选择或输入你的 MBTI 类型，AI 给出职场画像与推荐岗位
          </p>
        </div>
        <Card>
          <div className="flex gap-2">
            <input
              value={mbti}
              onChange={(e) => setMbti(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze(mbti)}
              maxLength={4}
              placeholder="如 INTJ"
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-center text-lg font-semibold tracking-widest outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleAnalyze(mbti)}
              disabled={loading}
              className="flex-1 rounded-lg bg-amber-500 py-2 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "分析中..." : "开始分析"}
            </button>
          </div>
          <p className="mt-3 mb-2 text-xs text-slate-400">不确定？点选一个：</p>
          <div className="grid grid-cols-4 gap-2">
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => handleAnalyze(t)}
                className={`rounded-lg border py-1.5 text-sm transition ${
                  mbti === t
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-600 hover:border-amber-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Card>
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
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-amber-500 px-3 py-2 text-2xl font-bold tracking-wider text-white">
                  {result.type}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {result.nickname}
                  </h3>
                  <div className="mt-1">
                    <Tags
                      items={result.traits}
                      color="bg-amber-50 text-amber-700"
                    />
                  </div>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-amber-50/70 p-3 text-sm text-slate-600">
                适合的工作方式：{result.workStyle}
              </p>
            </Card>

            <Card>
              <h3 className="mb-3 font-semibold text-slate-800">推荐岗位</h3>
              <div className="space-y-3">
                {result.recommendedJobs.map((j, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-100 bg-white/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">{j.title}</h4>
                      <span className="text-lg font-bold text-amber-600">
                        {j.fit}
                        <span className="text-xs text-slate-400">%契合</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{j.reason}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <h3 className="mb-2 text-sm font-medium text-green-700">
                  职场优势
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="mb-2 text-sm font-medium text-amber-600">
                  扬长避短
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {result.watchouts.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </>
        )}
        {!result && !loading && (
          <Card className="flex h-full items-center justify-center text-sm text-slate-400">
            分析结果将在这里显示
          </Card>
        )}
      </div>
    </div>
  );
}
