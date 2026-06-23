"use client";

import { useState } from "react";
import { GooseBackground } from "./GooseBackground";
import { MatchView } from "./MatchView";
import { AssessView } from "./AssessView";
import { MbtiView } from "./MbtiView";
import { ChatView } from "./ChatView";
import { CityView } from "./CityView";
import type { ParsedResume } from "@/lib/types";

type Tab = "match" | "assess" | "mbti" | "chat" | "city";

const NAV: { id: Tab; label: string; desc: string; icon: string }[] = [
  { id: "match", label: "简历打分与推荐", desc: "匹配岗位 + 优化", icon: "🎯" },
  { id: "assess", label: "候选人信息评估", desc: "能力五维雷达图", icon: "📊" },
  { id: "mbti", label: "MBTI 人格分析", desc: "人格荐岗", icon: "🧭" },
  { id: "chat", label: "AI 求职问答", desc: "求职答疑", icon: "💬" },
  { id: "city", label: "同城职位匹配", desc: "按城市星级荐岗", icon: "📍" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("match");
  // 简历文本与解析结果在「打分」和「评估」之间共享
  const [resumeText, setResumeText] = useState("");
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [error, setError] = useState("");
  const [fileLoading, setFileLoading] = useState("");

  async function handleFile(file: File) {
    setError("");
    try {
      setFileLoading("正在读取文件...");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-file", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "文件解析失败");
      setResumeText(json.text);
      setParsed(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件解析失败");
    } finally {
      setFileLoading("");
    }
  }

  const shared = {
    resumeText,
    setResumeText,
    parsed,
    setParsed,
    onFile: handleFile,
    fileLoading,
    error,
    setError,
  };

  return (
    <>
      <GooseBackground />
      <div className="flex min-h-screen">
        {/* 侧边栏 */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-amber-200/60 bg-white/70 p-4 backdrop-blur md:flex">
          <div className="mb-6 px-2">
            <h1 className="text-lg font-bold text-slate-800">🦢 求职鹅</h1>
            <p className="text-xs text-slate-500">AI 求职智能助手</p>
          </div>
          <nav className="space-y-1.5">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  tab === item.id
                    ? "bg-amber-500 text-white shadow"
                    : "text-slate-600 hover:bg-amber-100/70"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>
                  <span className="block text-sm font-medium">
                    {item.label}
                  </span>
                  <span
                    className={`block text-xs ${
                      tab === item.id ? "text-amber-50" : "text-slate-400"
                    }`}
                  >
                    {item.desc}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 顶部移动端导航 */}
        <div className="flex flex-1 flex-col">
          <div className="flex gap-1 overflow-x-auto border-b border-amber-200/60 bg-white/70 p-2 backdrop-blur md:hidden">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === item.id
                    ? "bg-amber-500 text-white"
                    : "text-slate-600"
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          <main className="flex-1 px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-6xl">
              {tab === "match" && <MatchView {...shared} />}
              {tab === "assess" && <AssessView {...shared} />}
              {tab === "mbti" && <MbtiView />}
              {tab === "chat" && <ChatView />}
              {tab === "city" && <CityView />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
