# Code Review · Backend / Build (v1.0.1)

## Process
Read `vite.config.ts`, `scripts/check-budget.mjs`, `scripts/scan-docs.ts`
(unchanged), `package.json`, `SECURITY.md`, `THIRD-PARTY.md`,
`test/e2e-user/_helpers.ts`, `test/e2e/v101.spec.ts`, and the
`.harness/nodes/build/handshake.json` metrics block. Re-ran `npm run test:build`
and `node scripts/check-budget.mjs` locally to confirm artifacts.

## Acceptance Criteria Results

- [PASS] AC-4 budget — `scripts/check-budget.mjs` enforces 30 KB / 250 KB; live measurements in build handshake (main 17.58 / 30, total 239.71 / 250).
- [PASS] AC-5 PWA — `vite.config.ts:48-78` registers `VitePWA` with manifest + workbox precache + StaleWhileRevalidate for the three JSON indexes. Build emits `dist/manifest.webmanifest` (verified) + `dist/sw.js` + `dist/workbox-*.js`.
- [PASS] AC-10 OSS hygiene — `package.json:5` `"license":"MIT"`; `SECURITY.md` (1.3 KB) + `THIRD-PARTY.md` (1.5 KB) present; both list every runtime + dev dep with license.
- [PASS] AC-11 persona helpers — `test/e2e-user/_helpers.ts` exports `waitForRoute`, `waitForPaletteOpen`, `waitForRender`, `seedLocalStorage` (uses `addInitScript`, fires before first navigation).
- [PASS] AC-12 regression — old smoke/polish/responsive specs untouched; tested by manual diff, no fixture mutation.

## Domain Findings

🟢 B1 — `vite-plugin-pwa` brings 4 high-severity npm audit advisories
File: `package-lock.json` (transitive). `npm audit` after install reports 4 high. They're in `cookie@<0.7.0` via `workbox-build` → `glob` → ... — dev-only, never shipped to client (workbox-build runs at build time only). Acceptable for a static-site PWA; no production exposure.
  → Suggested fix: `npm audit fix --force` upgrades vite-plugin-pwa to a version that pins newer glob; do this in a follow-up housekeeping PR after v1.0.1 ships, not blocking now.
  reasoning: Audit noise on dev tooling shouldn't block a feature release; production bundle is unaffected.

🟢 B2 — fcose dropped to fit budget; the trade-off is documented
File: `src/views/graph.ts:1-3`. Comment explicitly notes "Uses built-in cose layout (no fcose) to keep the lazy chunk small." Initial build with fcose was 176 KB gz on the cyto chunk → 280 KB total (over budget). Switching to built-in `cose` brought cyto chunk to 138.62 KB gz / total 239.71 KB. The aesthetic delta on a 691-node fixture is real but acceptable for v1.0.1; can revisit by tree-shaking fcose in v1.1.
  → Suggested fix: none for v1.0.1; revisit if perceived layout quality complaints arise.
  reasoning: Ranks 'budget compliance' above 'layout aesthetics' per the explicit AC-4 hard ceiling.

🟢 B3 — Budget script is the single source of truth
File: `scripts/check-budget.mjs`. Classification (`/^index-.*\.js$/` for main, `/^graph-/` or `/cyto/` for lazy) matches what rollup actually emits. Exit code 1 on overage means CI / npm scripts can wire it as a hard gate.
  → Suggested fix: none.
  reasoning: Mechanical, deterministic enforcement.

🟢 B4 — SW caches only static assets + JSON indexes
File: `vite.config.ts:62-72`. `globPatterns` excludes `*.json` from precache (only catches `.{js,css,html,svg,woff2}`); the three index JSONs are runtime-cached SWR. This avoids stale-doc-list bugs during dev iteration but still gives offline reads after first hit.
  → Suggested fix: none.
  reasoning: Correct cache discipline for evolving content + immutable hashed assets.

🟢 B5 — Manifest icons reuse favicon.svg as both `any` and `maskable`
File: `vite.config.ts:56-58`. SVG covers both purposes since it's vector and the artwork already has safe padding. Saves shipping separate PNG icon files.
  → Suggested fix: none.
  reasoning: Keeps total chunk weight down and avoids icon-asset maintenance.

🟢 B6 — Persona helpers respect the addInitScript-before-goto invariant
File: `test/e2e-user/_helpers.ts:24-30`. `seedLocalStorage` is documented to be called before the first `page.goto()`; it uses `addInitScript` so values are set before the bootstrap script in `index.html` reads `localStorage.getItem("atlas:theme")` for FOUC prevention.
  → Suggested fix: none.
  reasoning: Eliminates the persona-harness flake from v1.0 (3/14 failures) caused by post-load seeding.

## Threads

- T1 — `npm audit fix --force` may bump vite-plugin-pwa to a major; rerunning the budget script post-upgrade is the gate for accepting the bump.
- T2 — The PWA precache includes ~1 MB of font woff2 files. If v1.0.2 starts doing real chromium-doc syncs, gate font precaching behind a `selfHostFonts: false` runtime CDN strategy.

## Verdict: PASS

Six suggestions, no warnings, no criticals. All build-pipeline ACs pass; production bundle is clean.
