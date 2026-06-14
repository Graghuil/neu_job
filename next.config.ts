import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 让 pdfjs-dist 不被打包，用原生 Node 解析，避免 worker 路径错乱
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;
