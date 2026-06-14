# AI 求职智能匹配助手

帮学生从海量岗位中匹配契合自身背景/能力/兴趣的岗位，并针对心仪岗位诊断简历、给出优化建议以提升初筛命中率。

## 功能
- **简历解析**：粘贴简历，AI 抽取技能、经历、教育、求职意向等结构化画像。
- **岗位智能匹配**：基于求职者画像对岗位库语义排序，给出匹配度与匹配理由。
- **简历诊断优化**：针对选定岗位，评估初筛命中率，列出命中/缺失关键词，给出优化建议与改写示例。

## 技术栈
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Claude（Anthropic 协议，支持自定义网关）做解析/匹配/优化
- 岗位库内置于 `scripts/seed-jobs.ts`（真实招聘 JD 结构）

## 本地运行
```bash
npm install
cp .env.example .env.local   # 填入 ANTHROPIC_API_KEY 等
npm run dev                  # http://localhost:3000
```

## 环境变量
| 变量 | 说明 |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API Key（必填） |
| `ANTHROPIC_BASE_URL` | 自定义网关地址；用官方则留空 |
| `ANTHROPIC_MODEL` | 模型名，默认 `claude-sonnet-4-6` |

## 部署到 Vercel
1. 把本仓库推到 GitHub。
2. 在 [vercel.com](https://vercel.com) 用 GitHub 登录 → New Project → 导入本仓库。
3. 在 Environment Variables 填入上表三个变量。
4. Deploy，几分钟后得到公网链接。
