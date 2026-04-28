# Project Overview

Last updated: 2026-04-28

## 1. Product Positioning

This project is a public Markdown-to-Word conversion service:

- No mandatory login for core usage.
- Core value: fast and reliable `.docx` generation.
- Optional capabilities are additive, not required for core path.

## 2. Capability Layers

### Core (always-on target)

- Markdown parsing (`markdown-it`)
- Intermediate representation transformation
- Word document generation (`docx`)
- API/UI download path for `.docx`

### Optional Layer A: Local Preview

- Frontend `docx-preview`
- Controlled by `ENABLE_LOCAL_PREVIEW`

### Optional Layer B: Local PDF Export

- LibreOffice-based conversion
- Controlled by `ENABLE_LOCAL_PDF`

### Optional Layer C: Online Editing/Preview

- Collabora via WOPI
- Controlled by `ENABLE_COLLABORA`

## 3. Current Preferred Operating Mode

For simplicity and stability, default operational recommendation is:

- `ENABLE_LOCAL_PDF=false`
- `ENABLE_COLLABORA=false`
- `ENABLE_LOCAL_PREVIEW=true`

This gives:

- Core conversion enabled
- Fast local Word preview enabled
- No external editor dependency

## 4. Deployment Strategy

### Local

- Use direct `npm run server` for debugging.
- Use `docker-compose.local.yml` for containerized local runs.

### Server

- Use `docker-compose.server.yml`.
- Use reverse proxy config from `deploy/nginx.conf`.
- Enable optional capabilities only when operationally required.

## 5. Maintenance Rules

- Keep core conversion path independent from optional modules.
- Do not remove optional modules unless explicitly requested; gate them by capabilities.
- Reflect behavior changes in:
  - `README.md`
  - `TODO.md`
  - this `docs/PROJECT_OVERVIEW.md`

## 6. Known Risks

- Frontend bundle size is large.
- Capability combinations can cause UX confusion unless UI messaging stays explicit.
- Collabora deployment requires correct domain/reverse-proxy alignment when enabled.

## 7. Recent UI Decisions

- Markdown guide is bilingual and opens in an in-app modal from editor toolbar (`CN Guide` / `Guide`).
- Realtime preview behavior in `markdown` and `html` modes has been validated.
- Local docx preview mode now clears rendered DOM when switching modes to avoid residual overlay artifacts.
