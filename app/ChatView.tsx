"use client";

import { useEffect, useRef, useState } from "react";
import { call } from "@/lib/api";
import { Card } from "./components";
import type { ChatMessage } from "@/lib/types";

const QUICK_QUESTIONS = [
  "应届生简历怎么写才有竞争力？",
  "没有实习经历怎么找工作？",
  "面试时如何介绍自己的项目？",
  "如何谈薪资？",
];

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "你好，我是你的 AI 求职顾问 🦢 简历、面试、选岗、职业规划，有什么求职问题都可以问我。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError("");
    setInput("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply } = await call<{ reply: string }>("/api/chat", {
        messages: next,
      });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "回答失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-700">AI 求职问答</h2>
        <p className="text-sm text-slate-500">
          解答简历、面试、选岗、职业规划等求职问题
        </p>
      </div>

      <Card className="flex h-[60vh] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-slate-700"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-amber-50 px-4 py-2.5 text-sm text-slate-400">
                正在思考...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-amber-200 bg-amber-50/60 px-3 py-1 text-xs text-amber-700 transition hover:bg-amber-100"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="px-5 pb-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-2 border-t border-slate-100 p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="输入你的求职问题..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="rounded-lg bg-amber-500 px-5 py-2 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </Card>
    </div>
  );
}
