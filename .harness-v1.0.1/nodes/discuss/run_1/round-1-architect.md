# Discuss — Architect (round 1, v1.0.1)

## Scope summary
Five feature blocks (F1-F5) layered on the v1.0 SPA. No teardown of v1.0
modules; additive only. Bundle budget tightens: main ≤30 KB gz (was 200),
total ≤250 KB gz including new lazy graph chunk.

## Module additions

```
src/
  views/
    graph.ts          # NEW — Cytoscape lazy entry; force-directed; theme restyle
  components/
    install-button.ts # NEW — PWA install prompt
    view-mode-toggle.ts (existing) — wrap with role=radiogroup, roving tabindex, aria-checked
    theme-toggle.ts (existing) — add aria-pressed
    palette.ts (existing) — add aria-live="polite" result-count region
  lib/
    graph-data.ts     # NEW — links.json → Cytoscape elements, in-degree sizing
public/
  manifest.webmanifest # NEW (vite-plugin-pwa generates)
  icons/192.png, 512.png, maskable.png
SECURITY.md            # NEW
THIRD-PARTY.md         # NEW
```

## Lazy chunking strategy

Main entry only imports `views/graph.ts` via `await import("./views/graph")`
gated by route handler. Cytoscape + fcose live in their own chunk; rollup
auto-splits on dynamic import. Add explicit `manualChunks` rule
`{ cyto: ["cytoscape", "cytoscape-fcose"] }` for clarity.

## PWA

`vite-plugin-pwa` with `registerType: "autoUpdate"`, `workbox.globPatterns:
["**/*.{js,css,html,json,svg,woff2}"]`, runtime caching for `/docs.json`,
`/tree.json`, `/links.json` = StaleWhileRevalidate. Install prompt
component listens for `beforeinstallprompt`, shows button, calls `prompt()`
on click.

## A11y hooks

- Theme toggle: button with `aria-pressed={theme==='dark'}`
- View-mode toggle: `<div role="radiogroup">` containing 3 buttons each with
  `role="radio"`, `aria-checked`, single tab stop (roving tabindex), arrow
  keys to navigate, Enter/Space to select.
- Hit area: enforce `min-height: 44px; min-width: 44px` on `.theme-toggle`,
  `.view-mode button`, hamburger on mobile via `@media (max-width: 768px)`.
- Search count: `<div role="status" aria-live="polite" id="palette-count">`
  updated when palette filters.

## Risk register

| Risk | Mitigation |
|---|---|
| Cytoscape balloons total chunk | Only ship `cytoscape` core + `cytoscape-fcose`. No extensions. |
| PWA SW caches stale fixtures in dev | `disable: process.env.NODE_ENV !== 'production'` |
| Graph theme rebuild flicker | Mirror memex pattern: `cy.style().fromJson().update()` |
| New lazy chunk inflates index.html preload | Explicitly do NOT preload graph chunk |

## Verification map → ACs

AC-1 graph perf → playwright timing test on `#/graph`
AC-2 navigation → click test
AC-3 theme restyle → dual screenshot or DOM probe
AC-4 main chunk size → build assertion in `scripts/check-budget.mjs`
AC-5 PWA installable → manifest.webmanifest fetch + parse
AC-6 offline → playwright `context.setOffline(true)` after first load
AC-7..AC-9 a11y → DOM attribute and bbox queries
AC-10 OSS files → `fs.existsSync` + JSON.parse(package.json).license
AC-11 persona → harness rerun
AC-12 regression → smoke.spec.ts unchanged passes
