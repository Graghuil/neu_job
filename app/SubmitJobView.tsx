"use client";

import { useState } from "react";
import { call } from "@/lib/api";
import { Card } from "./components";
import type { Job } from "@/lib/types";

// 以梦为马 —— 骏马奔腾图（Unsplash 直链，带渐变兜底）
const DREAM_HORSE_IMG =
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80&auto=format&fit=crop";

const CATEGORIES = [
  "互联网研发", "产品运营", "数据分析", "设计", "市场营销",
  "销售", "人力资源", "财务", "金融", "供应链",
  "教育", "内容创作", "医疗健康", "硬件智能", "法务", "其他",
];

const EXPERIENCES = ["应届", "实习", "1-3年", "3-5年", "不限"];

type Field = {
  title: string;
  company: string;
  category: string;
  location: string;
  salary: string;
  experience: string;
  skills: string;
  description: string;
};

const EMPTY: Field = {
  title: "",
  company: "",
  category: "互联网研发",
  location: "",
  salary: "",
  experience: "应届",
  skills: "",
  description: "",
};

export function SubmitJobView() {
  const [form, setForm] = useState<Field>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Job | null>(null);

  function set<K extends keyof Field>(k: K, v: Field[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit() {
    setError("");
    if (!form.title.trim() || !form.company.trim() || !form.location.trim()) {
      setError("请至少填写岗位名称、公司和工作城市");
      return;
    }
    setLoading(true);
    try {
      const { job } = await call<{ job: Job }>("/api/submit-job", {
        ...form,
        skills: form.skills,
      });
      setSuccess(job);
      setForm(EMPTY);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-700">提交岗位信息</h2>
        <p className="text-sm text-slate-500">
          把你收集到的招聘信息分享进岗位库，校验通过后将成为别人求职路上的新机会
        </p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="岗位名称" required>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="如 前端开发工程师（校招）"
              className={inputCls}
            />
          </Labeled>
          <Labeled label="公司" required>
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="如 云启科技"
              className={inputCls}
            />
          </Labeled>
          <Labeled label="工作城市" required>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="如 上海 / 远程"
              className={inputCls}
            />
          </Labeled>
          <Labeled label="薪资">
            <input
              value={form.salary}
              onChange={(e) => set("salary", e.target.value)}
              placeholder="如 15-25K·14薪 / 200元/天"
              className={inputCls}
            />
          </Labeled>
          <Labeled label="职能领域">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Labeled>
          <Labeled label="经验要求">
            <select
              value={form.experience}
              onChange={(e) => set("experience", e.target.value)}
              className={inputCls}
            >
              {EXPERIENCES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Labeled>
        </div>

        <div className="mt-4">
          <Labeled label="技能标签">
            <input
              value={form.skills}
              onChange={(e) => set("skills", e.target.value)}
              placeholder="用逗号分隔，如 React, TypeScript, Node.js"
              className={inputCls}
            />
          </Labeled>
        </div>

        <div className="mt-4">
          <Labeled label="岗位描述（职责与要求）" required>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              placeholder="岗位职责、任职要求、加分项等，越具体越能帮到别人"
              className={`${inputCls} resize-y`}
            />
          </Labeled>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-amber-500 py-2.5 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? "提交中..." : "提交岗位信息"}
        </button>
      </Card>

      {success && (
        <DreamModal job={success} onClose={() => setSuccess(null)} />
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500";

function Labeled({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

// 成功提示框 —— 以梦为马背景
function DreamModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(180,83,9,0.35), rgba(0,0,0,0.7)), url(${DREAM_HORSE_IMG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-center px-8 py-12 text-center text-white">
          <span className="mb-4 text-5xl drop-shadow-lg">🐎</span>
          <h3 className="text-2xl font-bold drop-shadow-lg">
            你可能为他人提供新的可能
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-amber-50/90 drop-shadow">
            以梦为马，不负韶华。你分享的「{job.title}」已收入岗位库，
            或许正是某个人在等的那束光。
          </p>

          <div className="mt-6 rounded-xl bg-white/15 px-5 py-3 text-left text-sm backdrop-blur">
            <p className="font-medium">{job.title}</p>
            <p className="mt-1 text-amber-50/80">
              {job.company} · {job.location}
              {job.salary ? ` · ${job.salary}` : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-8 rounded-full bg-white px-8 py-2.5 font-medium text-amber-700 shadow-lg transition hover:bg-amber-50"
          >
            继续分享
          </button>
        </div>
      </div>
    </div>
  );
}
