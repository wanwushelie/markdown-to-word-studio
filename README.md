# Markdown to Word Converter

> 一个功能强大的 Markdown 转 Word (.docx) 转换工具，支持自定义字体、排版、样式配置，并提供 Web 前端实时预览。
>
> A powerful Markdown to Word (.docx) converter with customizable fonts, typography, styling, and a web-based real-time preview.

## ✨ Features / 功能特性

- 📝 **Markdown 解析** — 基于 markdown-it，支持 CommonMark + 表格扩展
- 📄 **Word 文档生成** — 使用 docx.js 生成标准 .docx 文件
- 🎨 **样式可配置** — 字体 (中/英/代码独立设置)、字号、各级段落间距、四边独立页边距、颜色等全面可定制
- 🤖 **智能文本调参** — 复制 AI 生成的参数文本（支持自然语言/JSON），一键应用全套排版，并内置学术论文、简历等多种预设模板
- 🖼️ **图片支持** — 本地文件和远程 URL 图片自动嵌入，支持缩放和对齐
- 📊 **表格支持** — Markdown 表格自动转换为 Word 表格
- ✏️ **专业编辑器** — CodeMirror 5，Markdown 语法高亮、行号、快捷键（Ctrl+B/I/S）
- 🌐 **Web 界面** — 三栏布局（编辑器 + 预览 + 配置），支持拖拽调整大小
- 👁️ **五种预览模式** — Markdown 即时预览、HTML 创意模板（4 款）、Docx 快速预览、PDF 高保真预览、Collabora 编辑
- 🔄 **自动预览** — 输入或配置变更后防抖自动刷新（800ms）
- 🎨 **HTML 创意模板** — Modern Dark、Glassmorphism、Editorial、Neon Cyber，超越 Word 的创意渲染
- 📥 **一键下载** — 直接下载生成的 .docx 文件
- 📋 **PDF 导出** — 通过 LibreOffice 导出 PDF（需安装 LibreOffice）
- 🔧 **CLI 工具** — 命令行接口，支持批量转换
- 🐳 **Docker 支持** — docker-compose 一键部署含 Collabora Online

## 📁 Project Structure / 项目结构

```
markdowntoword/
├── src/
│   ├── index.ts              # Library entry - exports public API
│   ├── cli.ts                # CLI entry point (md2word command)
│   ├── server.ts             # Express server entry point
│   ├── core/
│   │   ├── types.ts          # IR type definitions (DocumentIR, BlockNode, InlineNode, Config)
│   │   ├── config.ts         # Zod-based configuration schema with defaults
│   │   └── errors.ts         # Custom error classes
│   ├── parser/
│   │   ├── index.ts          # Parser entry - markdown string → DocumentIR
│   │   ├── tokenize.ts       # markdown-it tokenizer wrapper
│   │   └── transformer.ts    # Token → IR node transformer
│   ├── generator/
│   │   ├── index.ts          # Generator entry - DocumentIR → docx file
│   │   ├── document-builder.ts # Build docx Document from IR
│   │   ├── styles.ts         # Paragraph style definitions (Normal, Heading1-6, Code, Quote)
│   │   └── renderers/
│   │       ├── block.ts      # Block-level node rendering (heading, paragraph, list, table, etc.)
│   │       ├── inline.ts     # Inline-level node rendering (text, bold, italic, code, link)
│   │       └── image.ts      # Image rendering with scaling
│   ├── routes/
│   │   └── api.ts            # REST API endpoints (/convert, /preview, /download, /export/pdf)
│   ├── wopi/
│   │   ├── index.ts          # WOPI router (CheckFileInfo, GetFile, PutFile, Lock)
│   │   ├── discovery.ts      # Collabora Online discovery.xml parser
│   │   ├── storage.ts        # Temp file storage with TTL cleanup
│   │   └── token.ts          # HMAC-based access token generation/validation
│   └── utils/
│       ├── units.ts          # Unit conversions (px→EMU, pt→halfPt, pt→twip)
│       └── image.ts          # Image reading (local/remote) and dimension scaling
├── public/
│   └── index.html            # Web UI (CodeMirror editor + 5-mode preview + config panel)
├── tests/
│   ├── unit/
│   │   ├── core/config.test.ts
│   │   └── parser/transformer.test.ts
│   ├── e2e/
│   │   └── full-pipeline.test.ts
│   └── fixtures/
│       ├── markdown/sample.md
│       └── config/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── GEMINI.md                 # AI assistant project guide
```

## 🚀 Quick Start / 快速开始

### Prerequisites / 前置要求

- Node.js 20+
- npm

### Installation / 安装

```bash
npm install
```

### Development / 开发模式

```bash
# Build with watch mode / 监视模式构建
npm run dev

# Start server / 启动服务器
npm run server

# Open browser / 打开浏览器
# http://localhost:3000
```

### CLI Usage / 命令行使用

```bash
# Build first / 先构建
npm run build

# Basic conversion / 基本转换
npm run cli -- input.md

# With options / 带选项
npm run cli -- input.md -o report.docx -c config.json --title "My Report" --author "Author"
```

### Docker (with Collabora Online Preview) / Docker（含 Collabora 在线预览）

```bash
# Copy and configure environment / 复制并配置环境变量
cp .env.example .env

# Start all services / 启动所有服务
npm run compose:up

# Open browser / 打开浏览器
# http://localhost:3000
```

## 🔧 API Endpoints / API 接口

| Method | Path | Description / 描述 |
|--------|------|-------------------|
| POST | `/api/convert` | Convert markdown to .docx and download / 转换 Markdown 为 .docx 并下载 |
| POST | `/api/convert/pdf` | Direct export to PDF without Collabora session / 直接导出 PDF，无需 Collabora 会话 |
| POST | `/api/preview` | Create Collabora preview session / 创建 Collabora 预览会话 |
| GET | `/api/files/:id/download` | Download generated .docx file / 下载生成的 .docx 文件 |
| POST | `/api/files/:id/export/pdf` | Export as PDF (requires LibreOffice) / 导出为 PDF（需要 LibreOffice） |
| GET | `/health` | Health check / 健康检查 |

### Request Body (POST /api/convert) / 请求体

```json
{
  "markdown": "# Hello World\n\nThis is **bold** text.",
  "config": {
    "font": { "body": "SimSun", "heading": "SimHei" },
    "size": { "body": 12 },
    "spacing": { "lineSpacing": 1.5 },
    "pageSize": "A4",
    "orientation": "portrait"
  },
  "meta": {
    "title": "My Document",
    "author": "Author Name"
  }
}
```

## 🧪 Testing / 测试

```bash
# Run all tests / 运行所有测试
npm test

# Watch mode / 监视模式
npm run test:watch
```

## 📐 Data Flow / 数据流

```
Markdown String
     ↓ tokenize()
markdown-it Token[]
     ↓ transformTokens()
DocumentIR { type: 'document', meta, config, children: BlockNode[] }
     ↓ buildDocument()
docx.Document
     ↓ Packer.toBuffer()
Buffer (.docx)
```

## 📋 Supported Markdown Elements / 支持的 Markdown 元素

| Element / 元素 | Support / 支持 | Notes / 备注 |
|---|---|---|
| Headings H1-H6 | ✅ | With configurable font, size, color / 可配置字体、字号、颜色 |
| Bold / 粗体 | ✅ | `**text**` |
| Italic / 斜体 | ✅ | `*text*` |
| Underline / 下划线 | ✅ | `<u>text</u>` |
| Inline code / 行内代码 | ✅ | `` `code` `` |
| Code blocks / 代码块 | ✅ | With language info, monospace font / 支持语言信息 |
| Links / 链接 | ✅ | Clickable hyperlinks in docx / 在 docx 中可点击的超链接 |
| Images / 图片 | ✅ | Local + remote, auto-scaling / 本地+远程，自动缩放 |
| Tables / 表格 | ✅ | With header styling / 带表头样式 |
| Ordered lists / 有序列表 | ✅ | 3-level Word native decimal/letter numbering / 3级原生编号 |
| Unordered lists / 无序列表 | ✅ | 3-level Word native bullets (•/◦/▪) / 3级原生项目符号 |
| Blockquotes / 引用 | ✅ | With left border + italic / 带左边框和斜体 |
| Horizontal rules / 分割线 | ✅ | Bottom border / 底部边框 |
| Strikethrough / 删除线 | ✅ | Proper docx strike formatting / 正确的删除线格式 |
| HTML images / HTML 图片 | ✅ | `<img>` tags extracted / 提取 `<img>` 标签 |

## 🚨 代码体量与结构预警（新增）

为避免文件持续膨胀导致维护成本上升，项目采用以下即时预警规则：

- 单文件 `> 800` 行：进入预警，新增功能前优先考虑拆分模块。
- 单文件 `> 1500` 行：进入强预警，默认需要提交拆分方案（按职责拆为多个文件）。
- 出现以下结构信号时，即使行数不足也应预警：  
  1) 同一文件同时承担“数据模型 + 业务逻辑 + IO/网络”；  
  2) 单个函数过长（建议 `> 60` 行）；  
  3) 条件分支层级过深（建议 `>= 4` 层）。

提醒策略（你要求的“即时提醒”）：

- 每次改动后都检查触达阈值的文件，并在变更说明中显式列出。
- 如触发强预警，优先执行“先拆分再继续加功能”。

当前已触发预警的文件（按行数统计）：

- 暂无（当前代码库未发现 `> 800` 行的源码文件）

## 📜 License

ISC
