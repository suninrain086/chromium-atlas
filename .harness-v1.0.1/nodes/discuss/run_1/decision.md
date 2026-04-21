# Discuss — Decision (run_1, v1.0.1)

Three roles converged. Single-round synthesis to preserve wall-clock budget.

## Locked plan

### Stack additions
- `cytoscape@^3.30` + `cytoscape-fcose@^2.2` (lazy chunk only)
- `vite-plugin-pwa@^0.21` + workbox auto-bundled

### Code map
- New: `src/views/graph.ts`, `src/lib/graph-data.ts`,
  `src/components/install-button.ts`, `scripts/check-budget.mjs`,
  `test/e2e/v101.spec.ts`, `test/e2e-user/_helpers.ts`,
  `SECURITY.md`, `THIRD-PARTY.md`, `public/icons/*` (reuse favicon)
- Modified: `src/main.ts` (route, PWA register, install button mount),
  `src/components/theme-toggle.ts` (aria-pressed),
  `src/components/palette.ts` (aria-live count region),
  `src/views/folder.ts` (view-mode group → radiogroup with roving tabindex),
  `src/components/sidebar.ts` (Graph nav entry),
  `src/styles/app.css` (44px hit areas), `vite.config.ts` (PWA plugin,
  manualChunks `cyto`), `package.json` (license, deps), `README.md`
  (badges, privacy paragraph).

### Bundle ceilings (firm)
- Main chunk index-*.js gz ≤ 30 KB
- Total all chunks gz ≤ 250 KB
- Lazy graph chunk own line item; ≈ 160 KB gz expected

### Theme handling
graph.ts subscribes to `document` `themechange` event (already dispatched
by `setTheme`) and calls `applyGraphTheme()` which does
`cy.style().fromJson(buildStylesheet(readThemeTokens())).update()`. NO
teardown.

### A11y contracts (hard)
- `.theme-toggle[aria-pressed=true|false]`
- `.view-mode[role=radiogroup]` containing 3 `button[role=radio][aria-checked]`
- Hit area ≥ 44px enforced via CSS at all viewports
- `#palette-count[role=status][aria-live=polite]`

### Test gating order
1. Bundle budget assert (fast fail)
2. v1.0 regression smoke (17 tests)
3. v1.0.1 new specs (12 tests planned)
4. Persona harness 14 scenarios

### Acceptance criteria → AC-1..AC-12 (verbatim from PROJECT_BRIEF_v1.0.1.md)

All 12 ACs accepted; no scope changes. Quality tier: **delightful**.

## Implementer-ready: YES.
