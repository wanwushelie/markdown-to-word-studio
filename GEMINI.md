# Markdown to Word - Project Guide / 项目指南

## Project Overview / 项目概述

A Markdown to Word (.docx) converter with customizable styling, real-time preview via Collabora Online, and a web-based editor interface. Built with TypeScript, Express, and the `docx` library.

一个支持自定义样式的 Markdown 转 Word (.docx) 转换器，通过 Collabora Online 实现实时预览，并提供 Web 编辑器界面。使用 TypeScript、Express 和 `docx` 库构建。

---

## Tech Stack / 技术栈

| Layer / 层级 | Technology / 技术 |
|---|---|
| Language / 语言 | TypeScript (ES2022, ESM) |
| Build / 构建 | tsup |
| Runtime / 运行时 | Node.js 20+ |
| Web Framework / Web 框架 | Express 5 |
| Docx Generation / Docx 生成 | docx (v9.6) |
| Markdown Parsing / Markdown 解析 | markdown-it |
| Schema Validation / 模式验证 | Zod |
| Image Processing / 图像处理 | sharp |
| PDF Export / PDF 导出 | libreoffice-convert |
| Preview / 预览 | Collabora Online (WOPI), docx-preview, markdown-it, LibreOffice |
| Editor / 编辑器 | CodeMirror 5 (Markdown mode) |
| Testing / 测试 | Vitest |
| Container / 容器 | Docker + docker-compose |
| Frontend / 前端 | Vanilla HTML/CSS/JS + CodeMirror + markdown-it (single page in `public/index.html`) |

---

## Architecture / 架构

The project follows a **pipeline architecture**: Markdown → IR (Intermediate Representation) → docx.

项目遵循**管线架构**：Markdown → IR（中间表示）→ docx。

```
Markdown Input
     ↓
[Parser] markdown-it tokenize → transformer → DocumentIR
     ↓
[Generator] DocumentIR → docx Document (styles + block/inline renderers)
     ↓
[Output] Buffer → file / HTTP response
```

### Key Modules / 关键模块

- **`src/core/`** — Types (`DocumentIR`, config types), Zod-based config schema, custom error classes
- **`src/parser/`** — `tokenize.ts` (markdown-it wrapper), `transformer.ts` (tokens → IR nodes)
- **`src/generator/`** — `document-builder.ts` (IR → docx Document), `styles.ts` (paragraph styles), `renderers/` (block, inline, image)
- **`src/routes/api.ts`** — Express REST endpoints (`/api/convert`, `/api/convert/pdf`, `/api/preview`, download)
- **`src/wopi/`** — Collabora Online integration (WOPI protocol: discovery, storage, token, lock management)
- **`src/utils/`** — Unit conversion (px→EMU, pt→twip), image reading with sharp
- **`src/cli.ts`** — CLI entry point (`md2word` command)
- **`src/server.ts`** — Express server entry point
- **`public/index.html`** — Full single-page web UI (editor + preview + config panels)

---

## Configuration / 配置

The config system uses **Zod** schemas with sensible defaults. Key config areas:

配置系统使用 **Zod** 模式定义，带有合理的默认值。主要配置区域：

| Config / 配置 | Default / 默认值 | Description / 描述 |
|---|---|---|
| `font.body` | Microsoft YaHei | Body text font / 正文字体 |
| `font.heading` | SimHei | Heading font / 标题字体 |
| `font.english` | Times New Roman | English font / 英文字体 |
| `font.code` | Consolas | Code font / 代码字体 |
| `size.body` | 11pt | Body font size / 正文字号 |
| `size.heading1-6` | 22-11pt | Heading sizes / 标题字号 |
| `spacing.lineSpacing` | 1.5 | Line spacing / 行间距 |
| `margin.*` | 1440 twips (1 inch) | Page margins / 页边距 |
| `pageSize` | A4 | Page size / 纸张大小 |
| `orientation` | portrait | Orientation / 页面方向 |
| `color.heading` | 000000 | Heading color / 标题颜色 |
| `color.link` | 0563C1 | Link color / 链接颜色 |
| `image.maxWidthPercent` | 80% | Max image width / 最大图片宽度 |
| `image.defaultAlign` | center | Image alignment / 图片对齐 |

---

## Coding Conventions / 编码规范

1. **ESM-only** — All imports use `.js` extension suffix (TypeScript ESM convention)  
   所有导入使用 `.js` 扩展名后缀（TypeScript ESM 约定）
2. **Strict TypeScript** — `strict: true` in tsconfig  
   TypeScript 严格模式
3. **Functional style** — Parser and generator use pure functions, no classes (except docx API)  
   解析器和生成器使用纯函数，不用类（docx API 除外）
4. **Error hierarchy** — Custom error classes: `MarkdownParseError`, `DocxGenerationError`, `ImageProcessingError`, `ConfigValidationError`  
   自定义错误层级
5. **Unit-aware** — All dimension conversions go through `utils/units.ts` (px→EMU, pt→halfPt, pt→twip)  
   所有尺寸转换通过 `utils/units.ts`

---

## Important Patterns / 重要模式

### IR (Intermediate Representation / 中间表示)

The IR (`DocumentIR`) is the core data structure bridging parser and generator:  
IR (`DocumentIR`) 是连接解析器和生成器的核心数据结构：

- **Block nodes**: heading, paragraph, list, listItem, blockquote, codeBlock, table, tableRow, tableCell, image, thematicBreak
- **Inline nodes**: text, bold, italic, underline, inlineCode, link, lineBreak

### WOPI Integration / WOPI 集成

Preview uses Collabora Online via WOPI protocol:  
预览通过 WOPI 协议使用 Collabora Online：

1. Server generates docx buffer → saves to temp storage  
   服务器生成 docx 缓冲 → 保存到临时存储
2. Generates HMAC-based access token  
   生成基于 HMAC 的访问令牌
3. Returns Collabora iframe URL with WOPI source  
   返回带 WOPI 源的 Collabora iframe URL
4. Collabora fetches/saves via WOPI endpoints  
   Collabora 通过 WOPI 端点获取/保存

### Frontend / 前端

Single-page app in `public/index.html` with three resizable columns:  
单页应用，位于 `public/index.html`，三列可调整大小：

1. **Editor** — CodeMirror 5 with Markdown syntax highlighting, line numbers, keyboard shortcuts (Ctrl+B/I/S)  
   编辑器 — CodeMirror 5，Markdown 语法高亮、行号、快捷键（Ctrl+B/I/S）
2. **Preview** — Five modes:  
   预览 — 五种模式：
   - **Markdown (Instant)** — Client-side markdown-it → clean HTML, zero latency  
     Markdown（即时）— 客户端 markdown-it → 干净 HTML，零延迟
   - **HTML Creative ✨** — markdown-it + 4 CSS templates (Modern Dark, Glassmorphism, Editorial, Neon Cyber)  
     HTML 创意 ✨ — markdown-it + 4 款 CSS 模板（现代暗黑、毛玻璃、复古杂志、赛博朋克）
   - **Docx Preview (Fast)** — Server-side docx → docx-preview in-browser rendering  
     Docx 预览（快速）— 服务端 docx → docx-preview 浏览器渲染
   - **PDF Preview (Hi-Fi)** — Server-side docx → LibreOffice → PDF, perfect pagination  
     PDF 预览（高保真）— 服务端 docx → LibreOffice → PDF，完美分页
   - **Collabora (Edit)** — WOPI protocol, full editing in Collabora Online  
     Collabora（编辑）— WOPI 协议，Collabora Online 中完整编辑
3. **Config** — Typography (body/heading fonts, H1-H6 sizes), colors (heading/link/code BG/quote border), page layout, header/footer, images  
   配置 — 排版（正文/标题字体、H1-H6 字号）、颜色（标题/链接/代码背景/引用边框）、页面布局、页眉页脚、图片
4. **Auto-Preview** — Debounced auto-refresh (800ms) on editor input or config change, toggleable checkbox  
   自动预览 — 输入或配置变更后防抖自动刷新（800ms），可切换复选框

---

## Running / 运行

```bash
# Development build (watch mode)
# 开发构建（监视模式）
npm run dev

# Start server
# 启动服务器
npm run server

# CLI usage
# CLI 使用
npm run cli -- input.md -o output.docx

# With Collabora Online (Docker)
# 使用 Collabora Online（Docker）
npm run compose:up

# Tests
# 测试
npm test
```

---

## Environment Variables / 环境变量

| Variable / 变量 | Default / 默认值 | Description / 描述 |
|---|---|---|
| `PORT` | 3000 | Server port / 服务器端口 |
| `CODE_URL` | http://localhost:9980 | Collabora Online URL |
| `PUBLIC_APP_URL` | http://localhost:3000 | Public URL for WOPI callbacks |
| `WOPI_SECRET` | dev-secret-not-for-production | HMAC token secret / HMAC 令牌密钥 |
| `TEMP_DIR` | ./tmp/wopi | Temp file storage / 临时文件存储 |

---

## Known Limitations / 已知限制

1. ~~**Link rendering** — Links are styled but not clickable hyperlinks~~ ✅ Fixed: uses `ExternalHyperlink`  
   ~~链接有样式但不可点击~~ ✅ 已修复：使用 `ExternalHyperlink`
2. ~~**List bullets/numbers** — Currently rendered as plain paragraphs~~ ✅ Fixed: proper Word numbering (3 levels)  
   ~~列表作为普通段落~~ ✅ 已修复：正确的 Word 编号（3 级）
3. **Nested lists** — Handled recursively with 3 indent levels, but deeper nesting flattens  
   嵌套列表 — 递归处理支持 3 级缩进，更深嵌套会扁平化
4. ~~**Strikethrough** — Parsed but rendered as plain text~~ ✅ Fixed: `strike: true`  
   ~~删除线作为纯文本~~ ✅ 已修复：`strike: true`
5. **Image fallback** — Failed images render as empty 1x1 pixel image  
   图片降级 — 失败的图片渲染为空的 1x1 像素图像
6. ~~**Collabora dependency** — Preview requires Collabora Online~~ ✅ Fixed: 5 preview modes  
   ~~预览需要 Collabora~~ ✅ 已修复：5 种预览模式
7. **PDF export** — Requires LibreOffice installed on server  
   PDF 导出 — 需要服务器安装 LibreOffice
8. **Frontend** — Single HTML file (~1000 lines), no build toolchain, no component system  
   前端 — 单个 HTML 文件（约 1000 行），无构建工具链，无组件系统
9. **HTML Creative templates** — 4 built-in templates, no custom template editor yet  
   HTML 创意模板 — 4 个内置模板，尚无自定义模板编辑器
