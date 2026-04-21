# Discuss — Engineer (round 1, v1.0.1)

## Implementation order (single PR-equivalent commit per feature)

1. **F4 OSS hygiene** (5 min, zero risk) — add SECURITY.md, THIRD-PARTY.md,
   `"license": "MIT"` to package.json, README badges + privacy note. No code paths touched.

2. **F3 A11y polish** (15 min) — pure attribute/CSS edits. Add `aria-pressed` to
   theme-toggle.ts. Wrap view-mode-toggle with role=radiogroup (the
   `view-mode` group lives in `folder.ts` view header; needs refactor).
   Add aria-live count to palette.ts. Bump CSS min-height to 44px on
   `.theme-toggle, .view-mode button, #hamburger`.

3. **F1 Graph view** (45 min) — add cytoscape + cytoscape-fcose deps. Create
   `src/views/graph.ts` mirroring memex pattern (read theme tokens, build
   stylesheet, `cy.style().fromJson().update()` on theme change). Wire route
   `#/graph` in main.ts via dynamic import. Add sidebar entry "Graph". Listen
   on `themechange` event (already dispatched by setTheme) and call
   `applyGraphTheme()`. Add Tab/Enter keyboard support: focusable wrapper,
   first node `tabindex=0`, arrow keys cycle, Enter navigates.

4. **F2 PWA** (20 min) — `npm i -D vite-plugin-pwa`, add to vite.config.ts,
   create install-button component listening for `beforeinstallprompt`,
   write minimal `public/icons/*.svg` (or reuse favicon.svg upscaled).

5. **F5 Persona harness** (10 min) — add `_helpers.ts` with `waitForRoute`,
   `waitForPaletteOpen`, `waitForRender`, `seedLocalStorage` via
   `addInitScript`. Update existing scenarios to use them.

## Bundle math (target)

Current main.gz ≈ 16 KB (v1.0 release notes). Adding:
- aria attributes: +~0 (template strings)
- view-mode-toggle radiogroup: +~0.3 KB
- install-button (lazy): not in main
- graph route handler stub (dynamic import call): +~0.2 KB
- PWA registration shim (auto by plugin): +~1.5 KB
Estimated main = ~18 KB gz → well under 30 KB ceiling.

Lazy graph chunk: cytoscape core ~120 KB gz, fcose ~40 KB gz → ~160 KB gz.
Total = main + markdown + fuse + hljs + graph ≈ 16+30+12+16+160 ≈ 234 KB gz
→ under 250 ceiling but tight. If over, drop fcose for built-in `cose` layout
(saves 40 KB, less aesthetic).

## Open questions for tester

- Should "graph cold-load ≤800ms" be measured against fixture (691 docs) or
  smaller subset? **Decision: use full 691-doc fixture** (matches AC-1 wording).
- For AC-6 (offline), do we test true SW cache miss behavior or just first-load
  cached? **Decision: test cached-then-offline reload — true offline test.**
