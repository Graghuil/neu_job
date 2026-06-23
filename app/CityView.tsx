"use client";

import { useState } from "react";
import { call } from "@/lib/api";
import { Card, Tags } from "./components";
import type { CityJobResult } from "@/lib/types";

const HOT_CITIES = [
  "北京", "上海", "深圳", "广州", "杭州",
  "成都", "武汉", "南京", "西安", "远程",
];

function Stars({ value }: { value: number }) {
  // 渲染 5 颗星，支持半星
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} 星`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)); // 0 / 0.5 / 1
        return (
          <span key={i} className="relative text-lg leading-none">
            <span className="text-slate-200">★</span>
            <span
              className="absolute inset-0 overflow-hidden text-amber-400"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </span>
        );
      })}
      <span className="ml-1 text-sm font-semibold text-amber-600">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

export function CityView() {
  const [city, setCity] = useState("");
  const [direction, setDirection] = useState("");
  const [results, setResults] = useState<CityJobResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(target: string) {
    const c = target.trim();
    setCity(c);
    setError("");
    setResults(null);
    if (!c) {
      setError("请输入或选择城市");
      return;
    }
    setLoading(true);
    try {
      const { results } = await call<{ results: CityJobResult[] }>(
        "/api/city-match",
        { city: c, direction }
      );
      setResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "匹配失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-700">同城职位匹配</h2>
        <p className="text-sm text-slate-500">
          输入城市，AI 按星级为该城市的岗位打分推荐（可填求职方向更精准）
        </p>
      </div>

      <Card className="mb-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(city)}
            placeholder="城市，如 上海"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 sm:w-36"
          />
          <input
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(city)}
            placeholder="求职方向（可选），如 前端、运营"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
          <button
            onClick={() => search(city)}
            disabled={loading}
            className="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "匹配中..." : "搜索"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {HOT_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => search(c)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                city === c
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-600 hover:border-amber-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {results && (
        <>
          <h3 className="mb-3 font-semibold text-slate-700">
            {city} · 为你找到 {results.length} 个岗位
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {results.map((r) => (
              <Card key={r.job.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-slate-900">
                    {r.job.title}
                    <span className="ml-1 block text-xs font-normal text-slate-400">
                      {r.job.company} · {r.job.location} · {r.job.salary}
                    </span>
                  </h4>
                  <Stars value={r.stars} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{r.reason}</p>
                {r.highlights.length > 0 && (
                  <div className="mt-2">
                    <Tags
                      items={r.highlights}
                      color="bg-amber-50 text-amber-700"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {!results && !loading && !error && (
        <Card className="flex h-40 items-center justify-center text-sm text-slate-400">
          输入城市开始匹配
        </Card>
      )}
    </div>
  );
}
