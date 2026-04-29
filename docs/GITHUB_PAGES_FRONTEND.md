# GitHub Pages Browser-Public Deployment

This repository now builds the GitHub Pages version from the canonical frontend in `frontend/`.

## What Runs On GitHub Pages

- Markdown parsing runs in the browser.
- Word `.docx` generation runs in the browser.
- No Express server, LibreOffice, Collabora, WOPI, or backend API is used.
- Markdown content is not uploaded by the app.

## Local Development

```bash
cd frontend
npm run dev
```

For the actual GitHub Pages target, use the browser-public build command shown below.

## Local Build

```bash
cd frontend
npm run build:browser-public
```

The output is written to:

```text
frontend/dist
```

## GitHub Pages Automation

The workflow at `.github/workflows/pages.yml` builds and deploys automatically when code is pushed to `main` or `master`.

In GitHub repository settings:

1. Open `Settings -> Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to `main` or `master`.

## Feature Boundary

The browser-public version supports `.docx` export, HTML preview, and fast Word preview. PDF export and Collabora preview remain server-only features because they require LibreOffice and WOPI endpoints.

## Current Status

The GitHub Pages path has been fully consolidated into `frontend/`.

- there is no separate `frontend-pages/` app anymore
- all active frontend work belongs in `frontend/`
- the Pages workflow builds `frontend/` directly
