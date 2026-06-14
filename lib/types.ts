// 统一数据模型 —— 全项目共享的类型契约

/** 岗位 */
export interface Job {
  id: string;
  title: string; // 岗位名称
  company: string; // 公司
  category: string; // 职能领域，如 互联网研发 / 产品运营
  location: string; // 工作地点
  salary: string; // 薪资范围
  experience: string; // 经验要求，如 应届 / 实习 / 1-3年
  skills: string[]; // 技能标签
  description: string; // 岗位职责与要求(JD)
}

/** 带预计算向量的岗位(数据构建期生成) */
export interface JobWithEmbedding extends Job {
  embedding: number[];
}

/** 简历解析后的结构化结果 */
export interface ParsedResume {
  name?: string;
  summary: string; // 一句话画像
  skills: string[]; // 技能
  experiences: string[]; // 经历(实习/项目)
  education: string; // 教育背景
  interests: string[]; // 求职意向/兴趣方向
  rawText: string; // 原始文本
}

/** 单个岗位的匹配结果 */
export interface MatchResult {
  job: Job;
  score: number; // 综合匹配度 0-100
  semanticScore: number; // 语义相似度 0-100
  skillOverlap: string[]; // 命中的技能
  reason: string; // LLM 给出的匹配理由
}

/** 简历针对某岗位的诊断与优化 */
export interface OptimizeResult {
  hitRate: number; // 预估初筛命中率 0-100
  matchedKeywords: string[]; // 命中的关键词
  missingKeywords: string[]; // 缺失的关键词
  suggestions: string[]; // 优化建议
  rewriteExample: string; // 针对该 JD 的简历改写示例
}
