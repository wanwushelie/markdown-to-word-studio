# Unified Refactor Guide

## Purpose

This document is the implementation guide for refactoring the project from two frontend entrypoints into one unified frontend architecture with multiple capability adapters.

The goal is to support three deployment shapes without duplicating product UI:

- browser-only public version
- server-backed version
- future local/native full version

## Refactor Target

The target architecture should look like this conceptually:

```text
apps/
  web/              shared product frontend
  server/           server runtime and API layer
packages/
  core/             markdown parsing and docx generation
  ui/               shared components if separation is useful
  app-state/        store, i18n, shared frontend types
  adapters/
    browser/        browser-only capability implementation
    server-api/     fetch-based capability implementation
    native/         reserved for future local desktop/full edition
```

This structure does not need to be created in one step.
The refactor can be phased.

## Design Rule

The frontend must not know whether it is running in public browser mode or full server mode by branching all over the UI.

Instead:

- the frontend renders one shared product surface
- capability availability is supplied by one adapter
- unavailable features are disabled or hidden according to product policy

In short:

- same UI
- different backend capability providers

## Phase 1: Stabilize Shared Interfaces

### Goal

Define one shared frontend capability interface before moving files around.
This interface must support both:

- one capability with only one implementation
- one capability with multiple implementations and selection logic

### Work

- Introduce a stable capability service contract for frontend use.
- Replace direct assumptions about `/api` with adapter methods.
- Keep method names aligned with current usage so migration stays low risk.

### Two-layer model

Do not stop at a single "adapter" abstraction.
Use two layers:

- provider layer
- resolver layer

The provider executes one concrete implementation.
The resolver selects which provider should run.

This distinction matters because:

- browser vs server is an implementation difference
- auto selection, fallback, and user override are product-policy decisions

Provider example:

```ts
interface CapabilityProvider<TInput, TOutput> {
  id: string;
  label: string;
  canExecute(): Promise<boolean>;
  execute(input: TInput): Promise<TOutput>;
}
```

Resolver example:

```ts
interface CapabilityResolver<TInput, TOutput> {
  execute(
    input: TInput,
    options?: { mode?: 'auto' | 'browser' | 'server' | 'native' }
  ): Promise<TOutput>;
  listAvailable(): Promise<string[]>;
}
```

Recommended frontend-facing service shape:

```ts
interface CapabilityAdapter {
  getCapabilities(): Promise<Capabilities>;
  convertToDocx(payload: ConvertPayload): Promise<Blob>;
  convertToPdf(payload: ConvertPayload): Promise<Blob>;
  createPreviewSession(payload: ConvertPayload): Promise<PreviewSession>;
  downloadPreviewFile(fileId: string, token: string): Promise<Blob>;
  exportPreviewPdf(fileId: string, token: string): Promise<Blob>;
  getRuntimeSettings(): Promise<RuntimeSettings>;
  updateRuntimeSettings(input: Partial<RuntimeSettings>): Promise<RuntimeState>;
}
```

Internally, methods like `convertToDocx()` may route through a resolver.

### Rules

- Browser adapter must implement unavailable methods by returning explicit errors.
- Server adapter must remain fetch-based.
- UI components must depend on the interface, not on deployment assumptions.
- Resolver policy must not be hardcoded inside UI components.
- Provider priority must be controlled by product policy, not by scattered component logic.

## Phase 1.5: Provider Selection Strategy

### Goal

Define how one capability chooses between multiple implementations.

### General rule

For any capability that can exist in more than one runtime, support:

- automatic selection
- explicit user override

The UI should expose one feature.
The resolver decides which implementation runs.

### Recommended selection modes

```ts
type ExecutionMode = 'auto' | 'browser' | 'server' | 'native';
```

### Default behavior

- If only one provider exists, use it.
- If multiple providers exist, use resolver policy.
- If the requested provider is unavailable, return a clear user-facing error.

### `.docx` export policy

This project should treat `.docx` export as a multi-provider capability.

Providers:

- browser docx provider
- server docx provider
- future native docx provider

Default resolver policy:

- prefer browser provider when it is available
- fall back to server provider only when browser provider is unavailable
- do not silently retry server after an actual browser execution failure unless the error is explicitly classified as recoverable

Reason:

- browser execution is fast
- browser execution supports free static deployment
- browser execution reduces server cost
- silent fallback after a real execution failure can make debugging and output differences harder to understand

### User override policy

For capabilities with more than one valid implementation, expose an advanced preference:

- auto select
- always use browser
- always use server
- always use native

This setting should be optional and default to `auto`.

### Example matrix

| Capability | Browser | Server | Native | Default |
| --- | --- | --- | --- | --- |
| `.docx` export | yes | yes | future | browser |
| HTML preview | yes | not needed | yes | browser |
| Word fast preview | yes | not needed | yes | browser |
| PDF export | no | yes | future | server/native only |
| Collabora preview | no | yes | no | server only |
| Runtime settings | no | yes | future | server/native only |

### Error handling rule

Use these rules consistently:

- provider unavailable before execution: auto selection may choose another provider
- provider execution failed after starting: do not silently cascade through every other provider
- instead, surface a clear error and optionally offer a manual retry using another provider

This keeps behavior understandable and avoids hidden double work.

## Phase 2: Unify Frontend App

### Goal

Collapse `frontend/` and `frontend-pages/` into one main frontend app.

### Work

- Choose one canonical frontend directory as the long-term home.
- Recommended choice: keep `frontend/` as the canonical shared app and remove the need for a second full UI tree.
- Move browser-only public deployment concerns into build configuration and adapter selection, not into a separate duplicated app.

### Implementation approach

- Keep one set of:
  - components
  - store
  - i18n
  - templates
  - preview logic
- Add adapter selection at app bootstrap time.

Recommended bootstrap pattern:

```ts
const adapter = import.meta.env.VITE_RUNTIME_TARGET === 'browser'
  ? browserAdapter
  : serverApiAdapter;
```

The adapter can be provided through:

- a module singleton
- React context
- injected store dependency

For this project, the simplest safe version is a module-level adapter export.

## Phase 3: Split Features by Capability, Not by App

### Goal

Represent product tiers through capability flags instead of separate apps.

### Feature behavior rules

- `docx`
  - browser: enabled
  - server: enabled
  - native: enabled
  - selection: multi-provider with resolver

- `localPreview`
  - browser: enabled
  - server: enabled
  - native: enabled
  - selection: browser/local renderer by default

- `pdfLocal`
  - browser: disabled
  - server: enabled when LibreOffice is available
  - native: enabled when native runtime is available
  - selection: server/native only

- `collabora`
  - browser: disabled
  - server: enabled when configured
  - native: optional, likely disabled unless implemented later
  - selection: server only

- `runtimeSettings`
  - browser: disabled
  - server: enabled
  - native: handled by native settings flow later

### UI policy

- Core features should always stay visible and usable.
- Advanced features should remain visible if they help communicate product tiers.
- Disabled features must show a clear explanation, not generic failure.

Recommended disabled message:

`This feature requires the server or full local edition.`

## Phase 4: Clarify Product Editions

### Goal

Make the architecture match the actual business model.

### Product editions

- Public browser edition
  - free
  - static deployable
  - `.docx` export
  - HTML preview
  - fast Word preview

- Server edition
  - advanced hosted features
  - PDF export
  - Collabora editing
  - runtime-backed integrations

- Local full edition
  - future buyout/perpetual local use
  - private/offline workflows
  - native integrations

### Architecture consequence

Do not model these as three separate frontends.
Model them as one frontend with:

- different capability providers
- different resolver policies where needed
- different packaging layers

## Phase 5: Repository Organization Migration

### Short-term acceptable structure

If a full monorepo move feels too disruptive now, keep the repository mostly as-is and refactor in place:

```text
frontend/                canonical frontend
src/                     shared conversion core and current server code
frontend-adapters/
  browser.ts
  server-api.ts
```

### Long-term preferred structure

When the refactor is stable, move toward:

```text
apps/web
apps/server
packages/core
packages/adapters
packages/app-state
```

This move should happen after interface stabilization, not before.

## Concrete Refactor Order

Execute in this order:

1. Define shared capability interface and provider/resolver model.
2. Create `browser` and `server-api` provider implementations.
3. Build resolvers for `.docx`, preview, PDF, and runtime-backed features.
4. Make current UI use resolvers instead of raw `/api` assumptions.
5. Pick one frontend as canonical.
6. Port missing features from the other frontend into the canonical frontend.
7. Remove duplicate frontend-only files once parity is confirmed.
8. Update build targets for browser-public and server-backed modes.
9. Add optional user override settings for multi-provider capabilities.
10. Update docs and release instructions.

This order reduces risk because the behavior boundary becomes stable before file consolidation.

## Current Code Mapping Recommendation

Recommended mapping from the current repository:

- Shared conversion logic remains based on `src/parser`, `src/generator`, and config/types modules.
- Current `frontend` should become the canonical long-term app because it already contains the fuller component structure.
- `frontend-pages` should be treated as a temporary proving ground, then folded back into the canonical app.
- The current local browser `api.ts` concept should become the browser `.docx`/preview provider, not remain a second frontend identity.
- The current server fetch service should become the server provider.
- Resolver logic should sit above both and remain independent of the UI tree.

## Testing Requirements

Every migration stage should verify:

- browser build succeeds
- server-backed frontend build succeeds
- root build succeeds
- automated tests still pass
- browser edition can:
  - edit markdown
  - apply config
  - render HTML preview
  - render fast Word preview
  - download `.docx`
- server edition can still:
  - call backend APIs
  - export PDF when available
  - open Collabora when available
- multi-provider `.docx` selection behaves correctly in:
  - auto mode
  - forced browser mode
  - forced server mode
- unavailable provider override returns a clear error
- browser-unavailable path can fall back to server
- browser execution failure does not silently chain into hidden retries

## Common Refactor Pitfalls

Avoid these mistakes:

- Duplicating components while only renaming directories
- Letting adapters leak UI concerns
- Mixing provider logic and resolver policy together
- Hiding too many advanced features so users do not understand the product tiers
- Packing browser-only hacks directly into shared UI components
- Moving directories before stabilizing interfaces

The adapter layer must absorb deployment differences, not the component tree.

## Definition of Done

The refactor should be considered complete when:

- there is one canonical product frontend
- deployment mode is selected by adapter/build target, not by maintaining a second frontend UI
- browser-public and server-backed editions both build from the same product frontend
- `.docx` export and preview remain available in browser mode
- PDF and Collabora remain available only where supported
- duplicate frontend trees are no longer needed

## Final Recommendation

Do not keep growing `frontend` and `frontend-pages` side by side.

Use the current pure frontend work as proof that the browser adapter is viable, then fold that capability back into a unified frontend architecture.

That gives the project the cleanest path toward:

- one product
- multiple editions
- less duplication
- easier maintenance
