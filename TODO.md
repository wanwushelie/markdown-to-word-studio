# Development TODO / 开发待办

> Priority: 🔴 High | 🟡 Medium | 🟢 Low
>
> Status: ⬜ Not started | 🔲 In progress | ✅ Done

---

## ✅ Completed / 已完成

### Links (Hyperlinks) / 链接（超链接）
- ✅ Use `ExternalHyperlink` from docx to make links clickable in Word
- 使用 docx 的 `ExternalHyperlink` 使链接在 Word 中可点击
- File: `src/generator/renderers/inline.ts`

### List Rendering / 列表渲染
- ✅ Proper Word numbering for ordered lists (`LevelFormat.DECIMAL`)
- ✅ Bullet characters for unordered lists (•/◦/▪ three levels)
- ✅ Nested list indentation levels (3 levels with instance isolation)
- File: `src/generator/renderers/block.ts`, `src/generator/document-builder.ts`

### Strikethrough / 删除线
- ✅ Strikethrough text formatting in docx output (`strike: true`)
- File: `src/core/types.ts`, `src/parser/transformer.ts`, `src/generator/renderers/inline.ts`

### Preview Without Collabora / 无 Collabora 预览
- ✅ Local preview via `docx-preview` library (CDN, no Docker needed)
- 通过 `docx-preview` 库实现本地预览（CDN 加载，不需要 Docker）
- ✅ PDF preview via LibreOffice (high-fidelity with pagination)
- 通过 LibreOffice 实现 PDF 预览（高保真，正确分页）
- ✅ Three-mode preview switcher: Local (Fast) / PDF (Hi-Fi) / Collabora (Edit)
- 三模式预览切换器：本地（快速）/ PDF（高保真）/ Collabora（编辑）
- ✅ New API endpoint `POST /api/convert/pdf` for direct PDF export
- 新增 API 端点 `POST /api/convert/pdf` 支持直接 PDF 导出
- File: `public/index.html`, `src/routes/api.ts`

---

## 🔴 Next Up — High Impact / 下一步 — 高影响

### Auto-Preview on Input / 输入自动预览
- ⬜ Auto-refresh preview when user stops typing (debounced ~1.5s)
- 用户停止输入后自动刷新预览（防抖 ~1.5 秒）
- ⬜ Auto-refresh preview when config changes
- 配置变更时自动刷新预览

### Enhanced Config Panel / 增强配置面板
- ⬜ Add heading size controls (H1-H6 individual size inputs)
- 添加标题大小控制（H1-H6 单独的大小输入）
- ⬜ Add color pickers for heading, text, link, code background colors
- 添加标题、文本、链接、代码背景颜色的颜色选择器
- ⬜ Add header/footer text configuration
- 添加页眉/页脚文本配置
- ⬜ Add page number toggle
- 添加页码开关

### Style Templates / 样式模板
- ⬜ Add preset templates (Academic Paper, Report, Resume, etc.)
- 添加预设模板（学术论文、报告、简历等）
- ⬜ Support custom template import/export as JSON
- 支持自定义模板导入/导出为 JSON

---

## 🟡 Medium Priority / 中等优先级

### Better Editor / 更好的编辑器
- ⬜ Use Monaco or CodeMirror instead of plain textarea
- 使用 Monaco 或 CodeMirror 替代纯 textarea
- ⬜ Add Markdown syntax highlighting
- 添加 Markdown 语法高亮
- ⬜ Add keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+S, etc.)
- 添加键盘快捷键（Ctrl+B、Ctrl+I、Ctrl+S 等）

### Chinese Typography / 中文排版
- ⬜ Auto-detect Chinese/English text and apply different fonts per segment
- 自动检测中英文文本并按段落应用不同字体
- ⬜ Support font fallback chains (e.g. SimSun → Microsoft YaHei → Arial)
- 支持字体后备链（如 SimSun → Microsoft YaHei → Arial）

### TOC (Table of Contents) / 目录
- ⬜ Generate Word Table of Contents from headings
- 从标题生成 Word 目录

### UI Polish / UI 优化
- ⬜ Add dark mode support
- 添加深色模式支持
- ⬜ Add loading spinner/progress bar during conversion
- 转换期间添加加载动画/进度条
- ⬜ Improve mobile responsiveness
- 改善移动端响应式

---

## 🟢 Extended Markdown Support / 扩展 Markdown 支持

- ⬜ Task lists (checkboxes) `- [ ] task`
- ⬜ Footnotes / 脚注
- ⬜ Definition lists / 定义列表
- ⬜ Math equations (KaTeX/MathJax → image) / 数学公式
- ⬜ Mermaid diagrams → image / Mermaid 图表
- ⬜ Syntax highlighting in code blocks (colored text runs) / 代码块语法高亮
- ⬜ Emoji support / Emoji 支持

---

## 🟢 Testing / 测试

- ⬜ Add generator unit tests (block renderer, inline renderer)
- 添加生成器单元测试（块渲染器、行内渲染器）
- ⬜ Add API integration tests
- 添加 API 集成测试
- ⬜ Add visual regression tests for generated documents
- 添加生成文档的视觉回归测试
- ⬜ Create more fixture markdown files for edge cases
- 为边界情况创建更多夹具 Markdown 文件

---

## 🟢 DevOps & Infrastructure / 开发运维和基础设施

- ⬜ Add ESLint + Prettier configuration
- 添加 ESLint + Prettier 配置
- ⬜ Add GitHub Actions CI/CD pipeline
- 添加 GitHub Actions CI/CD 流水线
- ⬜ Add production build optimization
- 添加生产构建优化
- ⬜ Add rate limiting to API endpoints
- 添加 API 端点速率限制
- ⬜ Add request validation middleware
- 添加请求验证中间件
- ⬜ Consider migrating frontend to Vite + React/Vue
- 考虑将前端迁移到 Vite + React/Vue
