<div align="center">

# ☯️ 灵枢·五觉养生阁

**多 Agent 中医养生 AI 助手**

基于 React + FastAPI + Coze 工作流的智能健康咨询平台，融合传统中医理论与现代 AI 技术。

[![Tech Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tech Stack](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Tech Stack](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Tech Stack](https://img.shields.io/badge/Coze-Workflow-000?logo=bytedance)](https://www.coze.cn/)

</div>

---

## ✨ 项目特色

- **五大养生模块**：饮食调理、运动导引、心理疏导、经穴养生、惊喜彩蛋
- **双引擎架构**：Coze 工作流优先，LLM 智能兜底，确保回复质量
- **中医时辰养生**：子午流注经络时钟，按当前时辰推荐穴位与药茶
- **动态灵感推荐**：LLM 根据节气生成个性化健康探讨话题
- **响应式设计**：支持大字号无障碍模式，深色/浅色主题切换

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (React 19 + Vite)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ 类别选择  │ │ 灵感推荐  │ │ 聊天窗口  │ │ 经络时钟   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │ /api/*
┌─────────────────────────┴───────────────────────────────┐
│                  后端 (FastAPI + Python)                  │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ Coze 工作流引擎 │→│ 相关性检查   │→│ 回复放行/兜底 │  │
│  └────────────────┘  └─────────────┘  └──────────────┘  │
│  ┌────────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ LLM 兜底引擎   │  │ OSS 图片上传 │  │ 灵感生成 API │  │
│  └────────────────┘  └─────────────┘  └──────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   Coze 工作流       DeepSeek/OpenAI     阿里云 OSS
   (5 个模块)          (LLM API)        (图片存储)
```

## 📦 项目结构

```
lingshu/
├── server.py                  # FastAPI 后端主文件
├── .env                       # 环境变量（不提交）
├── .env.example               # 环境变量模板
├── requirements.txt           # Python 依赖
├── package.json               # Node.js 依赖
├── vite.config.ts             # Vite 构建配置
└── src/
    ├── App.tsx                # 主应用组件
    ├── main.tsx               # 入口文件
    ├── types.ts               # TypeScript 类型定义
    ├── index.css              # 全局样式
    ├── components/
    │   ├── VoiceConsultant.tsx    # 聊天窗口核心组件
    │   ├── CategorySelector.tsx   # 五大模块选择器
    │   ├── QuickInspirations.tsx  # 动态灵感推荐卡片
    │   ├── MeridianClock.tsx      # 子午流注经络时钟
    │   ├── FortunePreloader.tsx   # 开场加载动画
    │   ├── DailyReminders.tsx     # 每日养生提醒
    │   └── ZenMeditate.tsx        # 冥想静修组件
    ├── assets/images/             # 静态图片资源
    ├── data/                      # 静态数据
    └── utils/                     # 工具函数
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18（推荐使用 pnpm）
- **Python** >= 3.10
- **Coze 账号**（用于创建工作流）

### 1. 克隆项目

```bash
git clone https://github.com/karenepitaya/lingshu.git
cd lingshu
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入以下配置：

```env
# LLM API（用于兜底回复和灵感生成）
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
MODEL_NAME=deepseek-v4-flash

# Coze 工作流（5 个模块各需一组 workflow_id + token）
COZE_BASE_URL=https://api.coze.cn
COZE_DIET_WORKFLOW_ID=your_workflow_id
COZE_DIET_TOKEN=pat_your_token
# ... 其余模块配置见 .env.example

# 阿里云 OSS（可选，用于图片上传）
OSS_ACCESS_KEY_ID=your_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET_NAME=your_bucket
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_PUBLIC_URL=https://your-cdn-domain.com
```

### 3. 安装依赖

```bash
# 前端依赖
pnpm install

# Python 依赖
pip install -r requirements.txt
```

### 4. 启动开发服务器

```bash
# 同时启动前端 + 后端
pnpm run dev
```

前端运行在 `http://localhost:5173`，后端运行在 `http://localhost:6001`。

### 5. 生产构建

```bash
pnpm run build
python server.py
```

构建产物输出到 `dist/`，由 FastAPI 直接托管静态文件。

## 🧩 五大养生模块

| 模块 | 名称 | 说明 |
|------|------|------|
| 🍕 `diet` | 健康食疗 | 中医膳食调理，结合节气与体质推荐食方 |
| 🏃 `exercise` | 气血导引 | 传统导引运动功法，缓解久坐疲劳 |
| 🧠 `mental` | 安心情志 | 情志调理与心理疏导，平和身心 |
| 🍃 `wellness` | 时辰穴位 | 子午流注与节气养生，穴位保健 |
| 🎁 `surprise` | 随缘妙用 | 趣味养生知识与传统智慧小彩蛋 |

## ⚙️ 核心机制

### 双引擎回复策略

```
用户提问
  │
  ▼
Coze 工作流（60s 超时）
  │
  ├── 有回复 → LLM 相关性检查
  │     ├── 相关 → 使用 Coze 回复
  │     └── 不相关 → 转交 LLM 兜底
  │
  └── 超时/失败 → 直接使用 LLM 兜底
```

### 动态灵感推荐

- 后端 `/api/inspirations/{module}` 接口调用 LLM 生成当季节气话题
- 前端 `sessionStorage` 缓存，避免重复请求
- 失败时自动回退到硬编码示例

## 📄 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/chat` | 聊天消息（支持文本 + 图片） |
| `GET` | `/api/inspirations/{module}` | 获取模块灵感推荐 |
| `GET` | `/api/health` | 健康检查 |
| `GET` | `/api/test` | 测试端点 |

### 聊天请求格式

```json
{
  "activeModule": "diet",
  "messages": [
    {
      "role": "user",
      "text": "最近脾胃不好，有什么食疗建议？",
      "attachments": []
    }
  ]
}
```

## 🎨 技术栈

**前端**
- React 19 + TypeScript 5.8
- Vite 6（构建工具）
- Tailwind CSS 4（样式框架）
- Motion（动画库）
- react-markdown + remark-gfm（Markdown 渲染）
- Lucide React（图标库）

**后端**
- FastAPI + Uvicorn
- OpenAI Python SDK（LLM 调用）
- Coze API（工作流引擎）
- 阿里云 OSS SDK（图片存储）

## 📝 开源协议

本项目仅供学习与交流使用。中医养生建议仅供参考，不构成专业医疗诊断。如有身体不适，请前往正规医疗机构就诊。

---

<div align="center">

**灵枢·五觉养生阁** — 顺时养生，调和身心 ☯️

</div>
