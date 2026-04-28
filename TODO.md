# TODO

Last updated: 2026-04-28

## In Progress

- [ ] Decide final UX for refresh button:
  - hide in realtime modes (`markdown`, `html`), or
  - keep button and rename to "Regenerate" for generated modes.

## Next (High Priority)

- [ ] Add a short "core-only mode" section to UI settings/help (explain disabled capabilities).
- [ ] Add API error normalization so frontend can show consistent capability-disabled messages.
- [ ] Add one smoke test for `/capabilities` + gated endpoints:
  - `/api/preview` returns 503 when `collabora=false`
  - `/api/convert/pdf` returns 503 when `pdfLocal=false`

## Medium Priority

- [ ] Add rate limiting to conversion endpoints.
- [ ] Add request size/content validation hardening.
- [ ] Split frontend bundle (current build reports large chunk warning).
- [ ] Add persistent process docs (`pm2`) for local/server ops.

## Backlog

- [ ] Account system + server-side template storage (only if product direction confirms this need).
- [ ] More markdown extensions (footnotes, task lists, math/diagram strategy).
- [ ] CI pipeline for build + tests on pull requests.

## Done Recently

- [x] Runtime capability system (`docx`, `pdfLocal`, `collabora`, `localPreview`).
- [x] `GET /capabilities` endpoint.
- [x] Frontend capability-aware mode/options rendering.
- [x] Added `docker-compose.local.yml` and `docker-compose.server.yml`.
- [x] Added `.env.production.example` and `deploy/nginx.conf`.
- [x] Verified realtime updates in `markdown` and `html` preview modes.
- [x] Fixed local docx preview residue when switching preview modes.
- [x] Added bilingual Markdown guide and in-app modal entry from editor toolbar.
