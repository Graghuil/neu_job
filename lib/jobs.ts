// 岗位库加载 —— 直接使用 seed 种子库（召回由 Claude 完成，无需预计算向量）
import type { Job } from "./types";
import { seedJobs } from "../scripts/seed-jobs";

export function loadJobs(): Job[] {
  return seedJobs;
}
