// 岗位库加载 —— 直接使用 seed 种子库（召回由 Claude 完成，无需预计算向量）
import type { Job } from "./types";
import { seedJobs } from "../scripts/seed-jobs";

export function loadJobs(): Job[] {
  return seedJobs;
}

/** 岗位库覆盖的所有城市（去重，远程排在最后） */
export function listCities(): string[] {
  const cities = [...new Set(seedJobs.map((j) => j.location))];
  return cities.sort((a, b) => (a === "远程" ? 1 : b === "远程" ? -1 : 0));
}
