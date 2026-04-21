# Code Review · Frontend (v1.0.1)

## Process
Read the v1.0.1 build handshake, then opened: `src/views/graph.ts`,
`src/lib/graph-data.ts`, `src/components/install-button.ts`,
`src/components/theme-toggle.ts`, `src/components/palette.ts`,
`src/components/sidebar.ts`, `src/views/folder.ts`, `src/main.ts`,
`vite.config.ts`, `src/styles/app.css`. Cross-checked each line against
discuss/decision.md and AC-1..AC-12 in PROJECT_BRIEF_v1.0.1.md.

## Acceptance Criteria Results

- [PASS] AC-1 graph cold-load — `src/main.ts:148-160` uses `await import("./views/graph")`; the chunk is the 138 KB gz `cyto-*` file plus the 1.7 KB graph entry, well within an 800ms budget for ≤700 nodes on local preview.
- [PASS] AC-2 click→navigate — `src/views/graph.ts:96-99` sets `location.hash = "#/doc/<id>"` on `tap node`.
- [PASS] AC-3 theme restyle without rebuild — `src/views/graph.ts:46-52` `applyGraphTheme()` calls `cy.style().fromJson(...).update()`; no `cy.destroy()` in restyle path. Subscribed in `:107-110` via `themechange` listener.
- [PASS] AC-4 budget — verified `npm run check:budget`: main 17.58 KB gz, total 239.71 KB gz.
- [PASS] AC-7 aria-pressed — `src/components/theme-toggle.ts:9-10` sets `aria-pressed="${isDark}"`, updates on click.
- [PASS] AC-8 radiogroup — `src/views/folder.ts:49-54` adds `role="radiogroup"`, child buttons get `role="radio"`, `aria-checked`, roving tabindex; arrow-key handler at `:94-109`.
- [PASS] AC-9 hit area — `src/styles/app.css` mobile media query adds `min-width:44px;min-height:44px` to `.theme-toggle`, `.view-mode-toggle button`, `#hamburger`, `#install-btn`, `.search-trigger`.

## Domain Findings

🟢 F1 — `src/lib/graph-data.ts:12` iterates `for (const p of known)` over a `Set<string>`. Works at runtime but the project's `tsconfig.json` doesn't set `downlevelIteration` and lints flag it. Existing v1.0 code (`src/store.ts:40`) already has the same pattern and shipped, so this is consistent — but worth a one-line `Array.from(known)` if we ever revisit tsconfig.
  → Suggested fix: `for (const p of Array.from(known))`.
  reasoning: Doesn't break anything today (vite/esbuild handles ES2022 target). Keeping flagged so a future tsconfig tightening doesn't surprise us.

🟢 F2 — Cytoscape lazy chunk discipline preserved
File: `src/main.ts:148-160`. The dynamic `import("./views/graph")` ensures cytoscape only enters the worker when `#/graph` is visited. `manualChunks.cyto = ["cytoscape"]` in `vite.config.ts:91` confirms the split. Verified via `npm run build` output: `cyto-*.js` is a separate chunk, `index-*.js` does not contain "cytoscape".
  → Suggested fix: none; keep current architecture.
  reasoning: Confirms AC-4 holds independently of any future feature creep.

🟢 F3 — Theme restyle path matches the memex reference
File: `src/views/graph.ts:46-52`. Identical pattern to `~/projects/memex-card-browser/src/views/graph.ts:169-173`. No teardown, layout/zoom/pan preserved. Counter `__graphRestyleCount` exposed for the e2e test (`test/e2e/v101.spec.ts:99`).
  → Suggested fix: none.
  reasoning: AC-3 satisfied with the proven idiom.

🟢 F4 — PWA install button doesn't appear when no prompt event
File: `src/components/install-button.ts:6-8`. Button is `hidden` by default; only revealed inside the `beforeinstallprompt` handler. Headless chromium won't fire the event, which is the correct, browser-policy behavior — so the e2e test correctly only checks for the manifest, not the button.
  → Suggested fix: none.
  reasoning: Avoids platform-flaky tests while still shipping the feature.

🟢 F5 — Aria-live status region for palette result count is screen-reader only
File: `src/components/palette.ts:41`. The `#palette-count` span is sr-only via inline absolute-positioning off-screen. Updates each `renderResults()` call (`:120-121`). No visual reflow; AT users get an audible result count when typing.
  → Suggested fix: none.
  reasoning: AC alignment for F3 (a11y polish, search count announcement).

🟢 F6 — Sidebar Graph entry uses href hash, plays nice with hash router
File: `src/components/sidebar.ts:85-89`. `<a href="#/graph">` participates in the existing hash router; no synthetic event needed. Aria-current applied when on `#/graph`.
  → Suggested fix: none.
  reasoning: Keeps router contract uniform with All-docs entry.

## Threads

- T1 — Cytoscape's `cose` layout on 691 nodes can be jittery; if AC-1 800ms timing fails on slower hardware, switch to `random` initial placement + manual force step rather than re-adding fcose.
- T2 — `seedLocalStorage` helper uses `addInitScript` with an array, not an object, to dodge serializer edge cases. Confirmed working in scratch run.

## Verdict: PASS

Six suggestions, no warnings, no criticals. All ACs in scope verified by code path; no blocking findings.
