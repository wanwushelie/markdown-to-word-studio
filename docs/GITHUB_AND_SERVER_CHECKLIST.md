# GitHub and Server Checklist

Last updated: 2026-04-28

## 1) Before Pushing to GitHub

- Ensure secrets are not committed:
  - `.env` should stay local (already ignored).
  - Use `.env.example` and `.env.production.example` as templates only.
- Keep lockfiles committed for reproducible installs:
  - `package-lock.json`
  - `frontend/package-lock.json` (if used)
- Confirm local build succeeds:
  - `npm run build`
- Confirm runtime health:
  - `GET /health`
  - `GET /capabilities`

Recommended quick check:

```bash
git status
npm run build
```

## 2) Suggested Git Workflow

- Commit in logical groups (runtime detection, UI modal, docs, etc.).
- Write clear commit messages.
- Tag release after validation (optional):
  - `v1.0.0`, `v1.1.0`, etc.

## 3) Server Deployment Prep

- Decide host convention per environment (do not mix):
  - Use `localhost` consistently in local mode
  - Use real domain consistently in server mode
- Prepare `.env` from template:
  - `cp .env.production.example .env`
- Set at least:
  - `PUBLIC_APP_URL`
  - `WOPI_SECRET`
  - `CODE_URL`

## 4) Deploy on Server

```bash
npm run compose:up:server
```

Validate:

- `GET /health`
- `GET /capabilities`
- Open one preview session from UI

## 5) LibreOffice and Collabora Expectations

- LibreOffice:
  - If `soffice --version` works, PDF capability should be detected.
  - If not, set custom executable path in Runtime modal and save.
- Collabora:
  - `http://<host>:9980/hosting/discovery` should return XML.
  - Root `/` returning `OK` is normal.

## 6) Post-Deploy Observability

- Keep app logs available.
- Track failed preview/PDF requests.
- Keep `TODO.md` updated with operational issues found in production.
