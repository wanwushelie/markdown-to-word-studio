# Markdown to Word Converter

Markdown to `.docx` conversion service with a web UI, CLI, and optional preview/export capabilities.

## 使用方式（简体中文）

目前这个项目可以分成 **4 种使用方法**：

### 1. 纯前端公开版（适合免费部署到 GitHub Pages）

这种方式只使用 `frontend/` 的 `browser-public` 构建产物，不启动 Node.js 后端。

特点：

- 浏览器内直接完成 Markdown 转 `.docx`
- 支持 Markdown 编辑、样式配置、HTML 预览、快速 Word 预览
- 适合公开给别人免费使用
- 不支持 PDF 导出、Collabora 在线编辑、Runtime 设置

常用命令：

```bash
cd frontend
npm run build:browser-public
```

构建产物输出到：

```text
frontend/dist
```

#### 1.1 GitHub Pages 自动部署（推荐）

项目里已经自带了自动化工作流：

- 工作流文件：`.github/workflows/pages.yml`
- 触发条件：推送到 `main` 或 `master`
- 构建内容：`frontend/` 的 `browser-public` 版本
- 发布目录：`frontend/dist`

也就是说，这个项目**已经具备自动部署到 GitHub Pages 的能力**，你不需要自己额外写工作流。

**第一次启用时怎么操作：**

1. 把仓库推送到 GitHub。
2. 打开 GitHub 仓库页面。
3. 进入 `Settings -> Pages`。
4. 在 `Source` 里选择 `GitHub Actions`。
5. 确认默认分支是 `main` 或 `master`。
6. 之后只要你 `push` 新代码，GitHub 就会自动：
   - 安装依赖
   - 构建 `frontend`
   - 发布到 GitHub Pages

**你本地常用命令：**

```bash
git add .
git commit -m "update pages app"
git push origin main
```

推送完成后，可以在 GitHub 的：

- `Actions`
- `Deploy GitHub Pages`

里查看构建和发布日志。

发布成功后，GitHub Pages 地址通常是：

```text
https://你的用户名.github.io/仓库名/
```

如果是用户主页仓库（例如 `你的用户名.github.io`），地址通常就是：

```text
https://你的用户名.github.io/
```

#### 1.2 GitHub Pages 手动部署（不推荐，但可以）

如果你暂时不想走 GitHub Actions，也可以手动构建后再发布静态文件。

先在本地生成 Pages 版本：

```bash
cd frontend
npm run build:browser-public
```

生成结果在：

```text
frontend/dist
```

手动部署有两种常见方式：

##### 方式 A：手动上传到单独静态托管环境

适合你自己把 `frontend/dist` 上传到别的平台，或者以后接入别的静态托管服务。

步骤：

1. 本地执行 `npm run build:browser-public`
2. 取出 `frontend/dist` 目录中的内容
3. 上传这些静态文件到你的静态站点托管位置

##### 方式 B：手动发到 GitHub 的静态分支（例如 `gh-pages`）

这是传统做法，但比 GitHub Actions 麻烦一些。

基本思路是：

1. 本地构建 `frontend/dist`
2. 新建或切换到 `gh-pages` 分支
3. 把 `frontend/dist` 里的静态文件放到分支根目录
4. 提交并推送这个分支
5. 在 GitHub 的 `Settings -> Pages` 里把发布源切到该分支

这种方式的问题是：

- 要手动维护发布分支
- 每次更新都要重复构建和推送
- 容易把源码分支和发布分支搞乱

所以对这个项目来说，**更推荐直接使用仓库里现成的 GitHub Actions 自动部署。**

#### 1.3 自动部署和手动部署怎么选

- 想省事、长期维护：选 **自动部署**
- 只是临时试一下静态产物：可以用 **手动构建**
- 想长期稳定公开给别人用：还是建议 **自动部署**

### 2. 本地网页完整模式（适合自己在电脑上直接用）

这种方式会启动后端服务，再访问本地网页使用完整界面。

特点：

- 使用统一前端界面
- 可以调用本地服务端 API
- 如果本机装了 LibreOffice，可以启用 PDF 导出
- 如果服务端环境配置了 Collabora/WOPI，可以启用在线预览/编辑链路

常用命令：

```bash
npm install
npm run build
npm run server
```

默认打开：

- `http://localhost:3000`
- `http://localhost:3000/health`
- `http://localhost:3000/capabilities`

### 3. 服务器部署模式（适合部署到自己的云服务器）

这种方式面向正式部署，通常配合 Docker Compose、Nginx、环境变量来运行。

特点：

- 可以对外提供完整网页服务
- 可以按服务器能力开启 PDF、Collabora、Runtime 相关功能
- 适合团队内部、个人正式站点、私有服务

常用命令：

```bash
npm run compose:up:server
```

相关文件：

- `docker-compose.server.yml`
- `deploy/nginx.conf`
- `.env.production.example`

### 4. 命令行 / 程序化调用模式（适合集成）

这种方式不一定要打开网页，可以直接走 CLI 或 HTTP API。

#### 4.1 命令行模式

适合本地批量转换、脚本调用。

```bash
npm run build
node dist/cli.js document.md -o report.docx
```

也支持：

- `-c, --config <path>`：传入 JSON 配置文件
- `--title <title>`：文档标题
- `--author <author>`：文档作者

#### 4.2 HTTP API 模式

适合和其他系统、前端页面、自动化流程对接。

常用接口：

- `POST /api/convert`：Markdown 转 `.docx`
- `POST /api/convert/pdf`：Markdown 转 PDF（需要 `pdfLocal`）
- `POST /api/preview`：创建 Collabora 预览会话（需要 `collabora`）
- `GET /capabilities`：读取当前环境能力矩阵

### 怎么选

- 想免费公开部署：选 **纯前端公开版**
- 想自己本机完整使用：选 **本地网页完整模式**
- 想部署到服务器正式提供服务：选 **服务器部署模式**
- 想接入脚本、自动化或别的系统：选 **命令行 / 程序化调用模式**

## What This Project Does

- Converts Markdown to Word (`.docx`) via API and UI.
- Supports configurable typography/layout (font, size, spacing, page setup).
- Provides optional preview modes (local `docx-preview`, Collabora online preview).
- Provides optional PDF export (via LibreOffice).

Core conversion works without LibreOffice and without Collabora.

## Runtime Capability Model

Capabilities are modular and can be enabled/disabled by environment:

- `docx`: always available (core feature)
- `localPreview`: optional (frontend `docx-preview`)
- `pdfLocal`: optional (LibreOffice)
- `collabora`: optional (WOPI + Collabora)

Capability endpoint:

- `GET /capabilities`

## Tech Stack

- Backend: Node.js, TypeScript, Express
- Frontend: React + Vite
- Conversion: `docx`, `markdown-it`
- Optional PDF: `libreoffice-convert`
- Optional online editor: Collabora (WOPI)

## Quick Start (Local Development)

### 1) Install

```bash
npm install
```

### 2) Build

```bash
npm run build
```

### 3) Run (core + local preview enabled example)

```bash
# PowerShell
$env:ENABLE_LOCAL_PDF='false'
$env:ENABLE_COLLABORA='false'
$env:ENABLE_LOCAL_PREVIEW='true'
$env:PORT='3000'
npm run server
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/health`
- `http://localhost:3000/capabilities`

## Browser-Public Build

The canonical frontend lives in `frontend/` and can now build two targets:

- server-backed build: `cd frontend && npm run build`
- GitHub Pages browser-public build: `cd frontend && npm run build:browser-public`

The browser-public output is written to `frontend/dist` and is what the GitHub Pages workflow deploys.

## Docker Compose Profiles

- Local profile: `docker-compose.local.yml`
- Server profile: `docker-compose.server.yml`

Commands:

```bash
npm run compose:up:local
npm run compose:up:server
npm run compose:down
```

## Server Deployment (Fast Path)

1. Prepare env:

```bash
cp .env.production.example .env
```

2. Set at least:

- `PUBLIC_APP_URL`
- `WOPI_SECRET`
- `ENABLE_LOCAL_PDF`
- `ENABLE_COLLABORA`
- `ENABLE_LOCAL_PREVIEW`

3. Start:

```bash
npm run compose:up:server
```

4. Reverse proxy:

- Use `deploy/nginx.conf` as baseline.

## API Overview

- `POST /api/convert` -> Markdown to `.docx`
- `POST /api/convert/pdf` -> Markdown to PDF (requires `pdfLocal`)
- `POST /api/preview` -> create Collabora preview session (requires `collabora`)
- `GET /api/files/:id/download` -> download generated `.docx`
- `POST /api/files/:id/export/pdf` -> export WOPI file to PDF (requires `pdfLocal`)
- `GET /health` -> health status
- `GET /capabilities` -> runtime capability matrix

## Environment Variables

See:

- `.env.example`
- `.env.production.example`

Important flags:

- `ENABLE_LOCAL_PDF=true|false`
- `ENABLE_COLLABORA=true|false`
- `ENABLE_LOCAL_PREVIEW=true|false`

If unset, backend may auto-detect some capabilities.

### Host Consistency Rule

Within one environment, do not mix `localhost` and `127.0.0.1`.
Use one host style consistently for:

- browser URL
- `PUBLIC_APP_URL`
- generated preview URLs

## Project Structure (High Level)

- `src/` backend source
- `frontend/` canonical React app source
- `public/` built frontend output (served by backend)
- `docs/` project notes/changelogs
- `deploy/` deployment config (Nginx)

## Development Notes

- Keep core conversion path independent from optional capabilities.
- Do not delete Collabora/PDF code paths unless explicitly planned; use feature flags/capability gating.
- Update `TODO.md` when priorities or scope changes.
- Release/deploy checklist: `docs/GITHUB_AND_SERVER_CHECKLIST.md`

## Markdown Guide

- Bilingual markdown guide source: `docs/MARKDOWN_GUIDE.md`
- UI guide page: `/markdown-guide.html`
- Editor toolbar includes a bilingual guide button:
  - Chinese label: `CN Guide`
  - English label: `Guide`
- The guide opens as an in-app modal (not a new browser tab).
