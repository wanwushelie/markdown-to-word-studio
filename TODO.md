# TODO

Last updated: 2026-04-28

## In Progress

- [ ] Extend provider/resolver-style capability organization beyond `.docx` if future complexity makes it worthwhile.

## Next (High Priority)

- [ ] Review whether runtime success toasts should also be fully localized.

## Medium Priority

- [ ] Add rate limiting to conversion endpoints.
- [ ] Add request size/content validation hardening.
- [ ] Further split the `MarkdownEditor` chunk if startup weight becomes a product concern.
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
- [x] Finalized refresh UX by hiding refresh in realtime modes and using `Regenerate` for generated modes.
- [x] Added a core-only mode explanation for disabled advanced capabilities.
- [x] Normalized capability-disabled/API errors in the frontend service layer.
- [x] Added smoke coverage for `/capabilities`, `/api/preview`, and `/api/convert/pdf` gating behavior.
- [x] Split the frontend bundle with lazy-loaded panels and dynamic `docx-preview` import.
