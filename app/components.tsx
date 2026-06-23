"use client";

import type { ParsedResume } from "@/lib/types";

export function Tags({ items, color }: { items: string[]; color: string }) {
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

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/60 bg-white/85 p-5 shadow-xl backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

// 简历输入区：上传文件 / 粘贴文本 / 填入示例 + 主操作按钮
export function ResumeInput({
  resumeText,
  setResumeText,
  onSubmit,
  onSample,
  onFile,
  loading,
  submitLabel,
}: {
  resumeText: string;
  setResumeText: (v: string) => void;
  onSubmit: () => void;
  onSample: () => void;
  onFile: (file: File) => void;
  loading: string;
  submitLabel: string;
}) {
  return (
    <Card>
      <div className="mb-2 flex items-center justify-between">
        <label className="font-medium text-slate-700">上传或粘贴你的简历</label>
        <button
          onClick={onSample}
          className="text-sm text-amber-600 hover:underline"
        >
          填入示例简历
        </button>
      </div>
      <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 py-3 text-sm text-slate-500 transition hover:border-amber-500 hover:text-amber-600">
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
        rows={9}
        placeholder="上传文件后内容会显示在这里，也可直接粘贴简历：教育背景、技能、项目/实习经历、求职意向..."
        className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-amber-500"
      />
      <button
        onClick={onSubmit}
        disabled={!!loading}
        className="mt-3 w-full rounded-lg bg-amber-500 py-2.5 font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
      >
        {loading ? loading : submitLabel}
      </button>
    </Card>
  );
}

export function ProfileCard({ parsed }: { parsed: ParsedResume }) {
  return (
    <Card>
      <h2 className="mb-2 font-semibold text-slate-800">简历画像</h2>
      <p className="mb-3 text-sm text-slate-600">{parsed.summary}</p>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-400">技能：</span>
          <Tags items={parsed.skills} color="bg-amber-50 text-amber-700" />
        </div>
        <div>
          <span className="text-slate-400">意向：</span>
          <Tags items={parsed.interests} color="bg-orange-50 text-orange-700" />
        </div>
      </div>
    </Card>
  );
}
