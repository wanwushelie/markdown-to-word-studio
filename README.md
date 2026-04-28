# Markdown to Word Converter

Markdown to `.docx` conversion service with a web UI, CLI, and optional preview/export capabilities.

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
- `frontend/` React app source
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
