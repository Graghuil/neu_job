// 岗位库加载 —— 从 SQLite 持久化库读取（首次运行由 db 层从 seed 灌入）
import type { Job } from "./types";
import { getAllJobs } from "./db";

export function loadJobs(): Job[] {
  return getAllJobs();
}

/** 岗位库覆盖的所有城市（去重，远程排在最后） */
export function listCities(): string[] {
  const cities = [...new Set(loadJobs().map((j) => j.location))];
  return cities.sort((a, b) => (a === "远程" ? 1 : b === "远程" ? -1 : 0));
}
