// 岗位库持久化 —— 基于 Node 内置 node:sqlite（无需原生编译）
// 首次运行从 seedJobs 灌入；用户新提交的岗位也写入此库。
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Job } from "./types";
import { seedJobs } from "../scripts/seed-jobs";

// 数据库文件落在项目根的 data/ 下（已在 .gitignore 忽略）
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "jobs.db");

// 数据库行：skills 以 JSON 字符串存储，读出时还原为数组
interface JobRow {
  id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  salary: string;
  experience: string;
  skills: string; // JSON
  description: string;
  source: string; // "seed" | "user"
  created_at: string;
}

// 用 globalThis 缓存连接，避免 Next.js 开发模式热重载反复打开数据库
const g = globalThis as unknown as { __jobsDb?: DatabaseSync };

function getDb(): DatabaseSync {
  if (g.__jobsDb) return g.__jobsDb;

  mkdirSync(DB_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      company     TEXT NOT NULL,
      category    TEXT NOT NULL,
      location    TEXT NOT NULL,
      salary      TEXT NOT NULL,
      experience  TEXT NOT NULL,
      skills      TEXT NOT NULL,
      description TEXT NOT NULL,
      source      TEXT NOT NULL DEFAULT 'user',
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      dedup_key   TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_dedup ON jobs(dedup_key);
  `);

  // 首次为空时灌入种子库
  const count = db.prepare("SELECT COUNT(*) AS c FROM jobs").get() as {
    c: number;
  };
  if (count.c === 0) {
    const insert = db.prepare(
      `INSERT OR IGNORE INTO jobs
        (id, title, company, category, location, salary, experience, skills, description, source, dedup_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'seed', ?)`
    );
    for (const j of seedJobs) {
      insert.run(
        j.id,
        j.title,
        j.company,
        j.category,
        j.location,
        j.salary,
        j.experience,
        JSON.stringify(j.skills),
        j.description,
        dedupKey(j.title, j.company, j.location)
      );
    }
  }

  g.__jobsDb = db;
  return db;
}

/** 归一化查重键：标题+公司+城市去空白、转小写，避免大小写/空格差异造成的重复 */
export function dedupKey(title: string, company: string, location: string): string {
  const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();
  return `${norm(title)}|${norm(company)}|${norm(location)}`;
}

function rowToJob(r: JobRow): Job {
  return {
    id: r.id,
    title: r.title,
    company: r.company,
    category: r.category,
    location: r.location,
    salary: r.salary,
    experience: r.experience,
    skills: JSON.parse(r.skills) as string[],
    description: r.description,
  };
}

/** 读取全部岗位（seed + 用户提交），用户提交的排在前面 */
export function getAllJobs(): Job[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM jobs ORDER BY CASE source WHEN 'user' THEN 0 ELSE 1 END, id"
    )
    .all() as unknown as JobRow[];
  return rows.map(rowToJob);
}

/** 按查重键判断岗位是否已存在 */
export function findDuplicate(
  title: string,
  company: string,
  location: string
): Job | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM jobs WHERE dedup_key = ?")
    .get(dedupKey(title, company, location)) as JobRow | undefined;
  return row ? rowToJob(row) : null;
}

/** 插入一条用户提交的岗位，返回入库后的 Job；若 id 由调用方给出需保证唯一 */
export function insertJob(
  job: Omit<Job, "id"> & { id?: string }
): Job {
  const db = getDb();
  const id = job.id || `job-u-${Date.now().toString(36)}`;
  db.prepare(
    `INSERT INTO jobs
      (id, title, company, category, location, salary, experience, skills, description, source, dedup_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'user', ?)`
  ).run(
    id,
    job.title,
    job.company,
    job.category,
    job.location,
    job.salary,
    job.experience,
    JSON.stringify(job.skills),
    job.description,
    dedupKey(job.title, job.company, job.location)
  );
  return { ...job, id };
}

/** 岗位总数 */
export function countJobs(): number {
  const db = getDb();
  const r = db.prepare("SELECT COUNT(*) AS c FROM jobs").get() as { c: number };
  return r.c;
}
