# Architecture Review and Retrospective

## Purpose

This document records how the project architecture evolved, what was reasonable at each stage, what is now creating friction, and why the next step should be a unified architecture rather than continued parallel growth.

It is meant to be a stable project memory for future decisions.

## Project Evolution

### Stage 1: Server-first document conversion tool

The original project was primarily a server-oriented Markdown to Word converter:

- Node.js + Express handled the API layer.
- Core conversion lived in shared TypeScript modules under `src/`.
- The frontend was a web client for the server.
- Advanced features such as PDF export and Collabora/WOPI preview depended on server-side runtime capabilities.

This architecture was reasonable because:

- `.docx` generation, PDF export, and online editing were easiest to expose through a service.
- Runtime capability detection fit naturally on the server.
- The frontend could stay thin and focus on editing and preview.

This architecture had clear strengths:

- Full feature set in one deployment.
- Natural support for server-only integrations.
- Good fit for local private use and full server deployment.

It also had a natural limitation:

- Public free deployment to GitHub Pages was not possible because GitHub Pages cannot run Node.js, LibreOffice, or WOPI services.

### Stage 2: Pure frontend public deployment path

To support free public deployment, a second frontend was added in `frontend-pages/`.

The idea was:

- Reuse the existing core conversion modules from `src/`.
- Move `.docx` generation into the browser.
- Keep GitHub Pages deployment static and free.
- Offer the public a basic feature tier without server costs.

This was also a reasonable step because:

- `markdown-it`, the parser, and the `docx` generation path can run in the browser.
- HTML preview and `docx-preview` are also browser-friendly.
- It allowed quick validation of the public free tier without redesigning the whole repository first.

This stage proved an important product fact:

- A meaningful subset of the product can run entirely in the browser.

### Stage 3: Tension between the two frontends

Once `frontend/` and `frontend-pages/` both existed, an architectural tension became obvious:

- Both frontends serve nearly the same user workflow.
- Both need editor, config, preview, and export UI.
- Most differences are not in the UI itself, but in which capabilities are available behind the UI.

This is the key insight:

- The system does not fundamentally need two separate frontends.
- It needs one frontend and multiple capability providers.

## What Is Reasonable Today

The current split architecture is understandable and useful as an intermediate state.

It was good for:

- Proving that a browser-only product tier is viable.
- Preserving the original full-featured server app while experimenting.
- Shipping something quickly without a risky full refactor.

So the current architecture is not a mistake. It is an acceptable transition state.

## What Is No Longer Reasonable

Keeping two separate frontends as a long-term architecture is not a good fit for the product direction.

### Problem 1: UI duplication

Both frontends need the same concepts:

- Markdown editor
- Toolbar
- Config panel
- Preview panel
- Download flow
- Styling presets
- State persistence

When these exist in two frontend codebases, every UI improvement risks becoming double work.

### Problem 2: Product drift

If features are added separately:

- Public free mode and full mode will slowly stop feeling like the same product.
- Fixes and refinements may land in one UI but not the other.
- Users will experience inconsistent interactions and wording.

### Problem 3: Maintenance overhead

Two frontends increase:

- Testing burden
- Refactor difficulty
- Cognitive load for future contributors
- Risk of silent regressions

### Problem 4: Wrong separation boundary

The true difference between product tiers is not the page layout.

The true difference is capability availability:

- Browser mode can do local `.docx` generation and fast preview.
- Server mode can also do PDF, Collabora, and runtime-backed operations.
- Local desktop mode could additionally expose filesystem and native integrations.

That means the correct boundary is not "frontend A vs frontend B".
It is "same frontend, different capability adapter".

## Product Model Going Forward

The intended product model is:

- Public free tier: browser-only, static deployable, basic conversion features
- Server tier: advanced online capabilities
- Local paid tier: full local/private use with advanced native integrations

This model strongly favors a shared frontend and a shared core.

## Recommended Architecture Direction

The project should move toward:

- one shared core conversion layer
- one shared frontend UI
- one shared state and component system
- multiple environment-specific capability providers
- one resolver layer that decides which provider should run for a given capability

The crucial architectural idea is not just "adapters exist".
It is:

- providers perform concrete work
- resolvers choose between providers according to product policy

The frontend should call a stable capability interface such as:

- convert to docx
- render local preview
- export pdf
- create online preview session
- query capability availability

Then different runtime targets provide different implementations:

- browser adapter
- server API adapter
- local desktop/native adapter in the future

For some capabilities such as `.docx` export, more than one provider may exist at the same time.
In that case, resolver policy should decide:

- whether browser or server is preferred by default
- whether fallback is allowed
- whether the user can force one implementation

This preserves one product surface while allowing different feature tiers.

## Architecture Quality Assessment

### What the project already does well

- Core conversion logic is already separated from the frontend.
- Browser-side `.docx` generation has been proven viable.
- Server-only capabilities are already conceptually gated by capability flags.
- The product naturally supports tiered feature exposure.

### What the project currently does poorly

- Frontend code organization still implies duplicated product surfaces.
- Capability differences are represented partly as separate apps instead of just separate providers.
- The repository does not yet express the future product structure clearly.

### Overall judgment

The project is in a healthy but transitional state.

It is not overengineered. It is also not yet organized around the long-term product shape.

The next step should not be "keep polishing two frontends forever".
The next step should be "merge toward one frontend with multiple runtime adapters".

## Good and Bad Decision Summary

### Good decisions already made

- Keeping core conversion logic shared in `src/`
- Proving browser-only conversion with `frontend-pages/`
- Preserving server-only advanced capabilities instead of deleting them
- Using capability-based thinking for optional features

### Decisions that are acceptable short-term but weak long-term

- Maintaining `frontend/` and `frontend-pages/` as separate product frontends
- Letting similar UI behavior exist in two places
- Treating deployment mode as if it requires a separate app

### Recommended long-term decision

Adopt a unified product frontend and move environment differences into adapters and capability flags.

## Final Conclusion

The project began correctly as a server-first conversion system.
Adding a pure frontend path was also the right move for public free deployment.
The current split frontend state is a useful transition, not a final architecture.

The long-term architecture should be:

- shared core
- shared UI
- shared state
- environment-specific capability adapters

That direction best supports the actual product strategy:

- free public browser version
- advanced server version
- full-featured local/private version
