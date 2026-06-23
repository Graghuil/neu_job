import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "求职鹅 · AI 求职智能助手",
  description: "简历打分推荐、能力五维评估、MBTI 荐岗、AI 求职问答",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
