# Task Flow

轻量级个人工作日志管理系统

## 功能特性

- 📋 工作项管理 - 创建/编辑/删除工作项，支持6种状态
- 📁 子工作项 - 支持3级嵌套的树形结构
- 💬 评论管理 - 在工作项下添加评论
- 📅 日志查看 - 按日期查看操作历史，支持日历视图
- 🗑️ 回收站 - 软删除，7天自动清理
- 🤖 AI 周报/月报 - 一键生成本周或本月工作总结（兼容 OpenAI API 规范，配置与结果入库）

## 技术栈

- 前端：Vue 3 + TypeScript + Vite + Pinia + TailwindCSS
- 后端：Node.js + Express + TypeScript
- 数据库：SQLite + Prisma
- 部署：Docker

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 初始化数据库

```bash
pnpm --filter server prisma:migrate
```

### 开发模式

```bash
# 同时启动前后端
pnpm dev

# 或分别启动
pnpm --filter server dev  # 后端 http://localhost:3001
pnpm --filter client dev  # 前端 http://localhost:3000
```

### AI 模型配置（后端）

说明：
- 首次访问 AI 功能时，会自动在 SQLite 中初始化模型配置与摘要记录表。
- 前端可在“按天日志查看”页面通过“模型参数”按钮修改配置并保存到数据库。

### 生产构建

```bash
pnpm build
```

### Docker 部署

```bash
docker-compose up -d
```

## 项目结构

```
task-flow/
├── packages/
│   ├── client/      # Vue 3 前端
│   └── server/      # Express 后端
├── docker/          # Docker 配置
└── vibe-coding-doc/ # 项目文档
```

## API 文档

详见 [技术方案.md](vibe-coding-doc/技术方案.md)

## License

MIT
