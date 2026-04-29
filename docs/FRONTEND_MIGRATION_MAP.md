# Frontend Migration Map

## Purpose

This document records how the old `frontend-pages/` proving ground was folded back into the canonical `frontend/` app.

Use it when:

- updating old notes or docs
- moving a remaining implementation detail
- checking whether a `frontend-pages/` file still matters before deletion

## Current Rule

- Active frontend development belongs in `frontend/`
- GitHub Pages builds come from `frontend/`
- the old `frontend-pages/` tree has been removed

## Directory-Level Mapping

| Old location | Canonical location | Status |
| --- | --- | --- |
| `frontend-pages/package.json` | `frontend/package.json` | wrapper used temporarily, then removed |
| `frontend-pages/src/services/api.ts` | `frontend/src/services/api.ts` | migrated |
| `frontend-pages/src/services/capabilities/` | `frontend/src/services/capabilities/` | migrated |
| `frontend-pages/src/store/useStore.ts` | `frontend/src/store/useStore.ts` | migrated |
| `frontend-pages/src/components/config/ConfigPanel.tsx` | `frontend/src/components/config/ConfigPanel.tsx` | migrated |
| `frontend-pages/src/components/editor/EditorToolbar.tsx` | `frontend/src/components/editor/EditorToolbar.tsx` | migrated |
| `frontend-pages/src/components/preview/PreviewPanel.tsx` | `frontend/src/components/preview/PreviewPanel.tsx` | migrated |
| `frontend-pages/src/browser-stubs/` | `frontend/src/browser-stubs/` | migrated and removed from transitional directory |
| `frontend-pages/index.html` | none | removed, wrapper no longer hosts its own Vite app |
| `frontend-pages/vite.config.ts` | `frontend/vite.config.ts` | wrapper copy removed |
| `frontend-pages/tsconfig*.json` | `frontend/tsconfig*.json` | wrapper copies removed |
| `frontend-pages/public/*` | `frontend/public/*` | migrated or removed |
| `frontend-pages/src/components/*` | `frontend/src/components/*` | migrated or removed |
| `frontend-pages/src/utils/*` | `frontend/src/utils/*` | migrated or removed |

## Important Migrations Already Completed

### Capability layer

The browser-public capability model now lives under:

- `frontend/src/services/capabilities/types.ts`
- `frontend/src/services/capabilities/providers/browserDocxProvider.ts`
- `frontend/src/services/capabilities/providers/serverDocxProvider.ts`
- `frontend/src/services/capabilities/resolvers/docxResolver.ts`
- `frontend/src/services/capabilities/serverApi.ts`

### Shared frontend state

The canonical store now owns:

- `docxExecutionMode`
- panel visibility
- preview state
- persisted UI preferences

Primary file:

- `frontend/src/store/useStore.ts`

### Unified service facade

The canonical frontend entry now routes through:

- `frontend/src/services/api.ts`

That facade is responsible for:

- `.docx` provider selection
- browser-public disabled errors
- server-backed capability forwarding

## Final Outcome

The repository now treats `frontend/` as the only product frontend.

What remains from the old split is only architectural memory:

- why the second frontend existed
- which capabilities were proven there first
- how those pieces were folded back into the canonical app
