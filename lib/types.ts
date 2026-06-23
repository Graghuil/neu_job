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

/** 候选人五维能力评估 */
export interface AssessmentResult {
  /** 五个维度的得分，顺序固定，用于雷达图 */
  dimensions: { name: string; score: number; comment: string }[];
  overall: number; // 综合得分 0-100
  level: string; // 评级，如 优秀 / 良好 / 待提升
  strengths: string[]; // 亮点
  improvements: string[]; // 待提升项
  summary: string; // 一句话总评
}

/** MBTI 人格分析与荐岗 */
export interface MbtiJobRec {
  title: string; // 推荐岗位
  reason: string; // 推荐理由
  fit: number; // 契合度 0-100
}
export interface MbtiResult {
  type: string; // 规范化后的 MBTI 类型，如 INTJ
  nickname: string; // 人格别称，如 建筑师
  traits: string[]; // 性格关键词
  strengths: string[]; // 职场优势
  watchouts: string[]; // 需要注意的点
  recommendedJobs: MbtiJobRec[]; // 推荐岗位
  workStyle: string; // 适合的工作方式/环境
}

/** AI 求职问答消息 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** 同城匹配：单个岗位的星级评分结果 */
export interface CityJobResult {
  job: Job;
  stars: number; // 1-5，支持 0.5 档
  reason: string; // 打分理由
  highlights: string[]; // 亮点标签，如 高薪 / 应届友好 / 大厂
}
