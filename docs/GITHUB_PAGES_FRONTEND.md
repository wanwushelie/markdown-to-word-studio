# GitHub Pages Pure Frontend Deployment

This repository contains a browser-only frontend in `frontend-pages`.

## What Runs On GitHub Pages

- Markdown parsing runs in the browser.
- Word `.docx` generation runs in the browser.
- No Express server, LibreOffice, Collabora, WOPI, or backend API is used.
- Markdown content is not uploaded by the app.

## Local Development

```bash
cd frontend-pages
npm install
npm run dev
```

## Local Build

```bash
cd frontend-pages
npm run build
```

The output is written to:

```text
frontend-pages/dist
```

## GitHub Pages Automation

The workflow at `.github/workflows/pages.yml` builds and deploys automatically when code is pushed to `main` or `master`.

In GitHub repository settings:

1. Open `Settings -> Pages`.
2. Set `Source` to `GitHub Actions`.
3. Push to `main` or `master`.

## Feature Boundary

The pure frontend version supports `.docx` export. PDF export and Collabora preview remain server-only features because they require LibreOffice and WOPI endpoints.
