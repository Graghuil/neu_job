import type { Job } from "../lib/types";

// 岗位种子库 —— 字段结构对齐真实招聘平台 JD（标题/技能/薪资/经验/职责）
// 覆盖学生高频领域：互联网研发、产品运营，含应届校招与实习岗
export const seedJobs: Job[] = [
  {
    id: "job-001",
    title: "后端开发工程师（校招）",
    company: "云启科技",
    category: "互联网研发",
    location: "杭州",
    salary: "15-25K·14薪",
    experience: "应届",
    skills: ["Java", "Spring Boot", "MySQL", "Redis", "微服务", "分布式"],
    description:
      "负责核心业务系统的后端开发与维护；参与高并发服务的设计与优化；编写高质量、可测试的代码。要求：计算机相关专业本科及以上；扎实的 Java 基础，熟悉 Spring Boot；了解 MySQL、Redis；理解常见数据结构与算法；有微服务或分布式项目经历者优先。",
  },
  {
    id: "job-002",
    title: "前端开发工程师（校招）",
    company: "界面工场",
    category: "互联网研发",
    location: "北京",
    salary: "14-22K·13薪",
    experience: "应届",
    skills: ["JavaScript", "TypeScript", "React", "Vue", "HTML/CSS", "Webpack"],
    description:
      "负责 Web 前端产品的开发与优化；与设计、后端协作完成需求；持续优化页面性能与用户体验。要求：熟悉 HTML/CSS/JavaScript；掌握 React 或 Vue 之一；了解 TypeScript 与前端工程化；有完整项目作品或开源贡献者优先。",
  },
  {
    id: "job-003",
    title: "算法工程师-机器学习（校招）",
    company: "智深智能",
    category: "互联网研发",
    location: "深圳",
    salary: "25-40K·15薪",
    experience: "应届",
    skills: ["Python", "PyTorch", "机器学习", "深度学习", "数据挖掘", "NLP"],
    description:
      "负责推荐/搜索/NLP 等方向的算法研发与落地；跟进前沿论文并工程化。要求：硕士及以上，机器学习/统计相关；熟悉 Python 与 PyTorch；有扎实的机器学习理论基础；有顶会论文、竞赛获奖或实习项目者优先。",
  },
  {
    id: "job-004",
    title: "数据分析师（校招）",
    company: "数知未来",
    category: "互联网研发",
    location: "上海",
    salary: "12-20K·13薪",
    experience: "应届",
    skills: ["SQL", "Python", "数据分析", "Excel", "Tableau", "统计学"],
    description:
      "负责业务数据的提取、分析与可视化，输出数据报告支持决策；搭建和维护核心业务指标体系。要求：熟练 SQL；掌握 Python 或 R 做数据处理；熟悉常用统计方法；有较强的业务理解与表达能力；用过 Tableau/PowerBI 者优先。",
  },
  {
    id: "job-005",
    title: "测试开发工程师（校招）",
    company: "稳健软件",
    category: "互联网研发",
    location: "成都",
    salary: "12-18K·13薪",
    experience: "应届",
    skills: ["Python", "自动化测试", "Selenium", "接口测试", "Linux", "CI/CD"],
    description:
      "负责自动化测试框架的开发与维护；编写测试用例并执行；推动质量保障流程。要求：熟悉至少一门编程语言（Python/Java）；了解自动化测试与接口测试；熟悉 Linux 基本操作；有 CI/CD 经验者优先。",
  },
  {
    id: "job-006",
    title: "产品经理（校招）",
    company: "悦享互娱",
    category: "产品运营",
    location: "广州",
    salary: "13-20K·14薪",
    experience: "应届",
    skills: ["需求分析", "产品设计", "Axure", "数据分析", "项目管理", "竞品分析"],
    description:
      "负责产品需求调研、方案设计与功能落地；撰写 PRD 并跟进开发上线；分析数据驱动产品迭代。要求：逻辑清晰、有较强沟通能力；会用 Axure/墨刀 等原型工具；有产品实习或完整项目经历者优先。",
  },
  {
    id: "job-007",
    title: "用户运营实习生",
    company: "潮起社区",
    category: "产品运营",
    location: "北京",
    salary: "150-200元/天",
    experience: "实习",
    skills: ["用户运营", "活动策划", "数据分析", "社群运营", "内容运营", "Excel"],
    description:
      "协助用户增长与活跃运营；策划并执行线上活动；维护用户社群并收集反馈；输出运营数据复盘。要求：在校生，每周到岗 4 天以上；细心、有责任心；有社群或活动运营经验者优先。",
  },
  {
    id: "job-008",
    title: "新媒体运营实习生",
    company: "光年传媒",
    category: "产品运营",
    location: "上海",
    salary: "120-180元/天",
    experience: "实习",
    skills: ["内容运营", "文案", "短视频", "新媒体", "数据分析", "社交媒体"],
    description:
      "负责公众号/小红书/抖音等平台内容创作与发布；跟踪数据并优化内容；参与选题策划。要求：文字功底好、有网感；熟悉主流社交媒体平台；会基础图文/视频编辑者优先。",
  },
  {
    id: "job-009",
    title: "Java 后端实习生",
    company: "云启科技",
    category: "互联网研发",
    location: "杭州",
    salary: "180-260元/天",
    experience: "实习",
    skills: ["Java", "Spring", "MySQL", "Git", "数据结构", "算法"],
    description:
      "参与后端业务模块开发；在导师指导下完成接口开发与联调；编写单元测试。要求：在校生，掌握 Java 基础与面向对象；了解 Spring 与 MySQL；熟悉常见数据结构与算法；每周到岗 3 天以上。",
  },
  {
    id: "job-010",
    title: "前端开发实习生",
    company: "界面工场",
    category: "互联网研发",
    location: "远程",
    salary: "150-220元/天",
    experience: "实习",
    skills: ["JavaScript", "React", "HTML/CSS", "Git", "TypeScript"],
    description:
      "参与 Web 前端页面开发与组件封装；配合修复 bug 与样式还原。要求：在校生，熟悉 HTML/CSS/JS；了解 React；有 Git 使用经验；可远程稳定投入者优先。",
  },
  {
    id: "job-011",
    title: "市场营销专员（校招）",
    company: "鲜活快消",
    category: "其他行业",
    location: "深圳",
    salary: "8-12K·13薪",
    experience: "应届",
    skills: ["市场营销", "活动策划", "文案", "沟通", "Excel", "PPT"],
    description:
      "负责品牌市场活动的策划与执行；对接供应商与渠道；整理市场数据与营销复盘。要求：市场/营销/传播相关专业优先；有较强沟通与执行力；熟练 Office；有活动落地经验者优先。",
  },
  {
    id: "job-012",
    title: "财务分析实习生",
    company: "稳金资本",
    category: "其他行业",
    location: "上海",
    salary: "150-200元/天",
    experience: "实习",
    skills: ["财务分析", "Excel", "会计", "数据分析", "财务建模"],
    description:
      "协助财务报表整理与分析；参与预算与成本核算；制作财务分析模型与报告。要求：财会/金融相关专业在校生；Excel 熟练；了解基本财务知识；细致、严谨；每周到岗 4 天以上。",
  },
];
