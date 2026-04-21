# Test design — chromium-atlas v1.0 (run_1)

Author: tester role. Independent of build/code-review roles. Test cases derived
from PROJECT_BRIEF.md §3 (F1–F12) intersected with the delightful-tier baseline
(`opc-harness tier-baseline --tier delightful`) and reviewer findings from
code-review/run_1 (F1, F2, S1).

## Tier mapping

| Tier P0 case | Atlas mapping | Plan |
|---|---|---|
| TC-TIER-01 typography hierarchy | Inter Variable + JetBrains Mono | Visual inspection at audit; smoke checks fonts load |
| TC-TIER-02 dark/light theme | F4 theme toggle | Smoke: `theme-roundtrip` |
| TC-TIER-03 keyboard nav | F3 palette + sidebar buttons | Smoke: palette open, Tab trap, `/` |
| TC-TIER-04 empty/error states | Doc-not-found, 404 route | Smoke: `404-route` |
| TC-TIER-05 a11y baseline (axe) | Deferred to audit node | — |
| (others) | covered by feature-specific cases below | — |

## Feature acceptance criteria (P0 = must pass before gate-test)

| ID | Brief feature | Test | Priority |
|---|---|---|---|
| AC-1 | F1 sidebar tree | `home-renders-folder-tree` | P0 |
| AC-2 | F5 doc detail render | `doc-route-renders-markdown` | P0 |
| AC-3 | F6 right-side TOC | embedded in AC-2 | P0 |
| AC-4 | F7 back-links panel | embedded in AC-2 | P0 |
| AC-5 | F3 Cmd+K palette | `palette-cmdk-open-and-enter` | P0 |
| AC-6 | F3 `/` shortcut (closes F2 from review) | `palette-slash-shortcut` | P0 |
| AC-7 | Palette focus trap (closes F1 from review) | `palette-tab-trapped` | P0 |
| AC-8 | F4 theme toggle | `theme-roundtrip` | P0 |
| AC-9 | F9 deep-link routing | embedded in AC-2 (via goto + reload) | P0 |
| AC-10 | 404 route | `404-route-shows-empty-state` | P0 |
| AC-11 | XSS hardening (Walls 1+2 from security review) | `xss-script-tag-no-execute` | P0 |
| AC-12 | F2 three-mode folder view | deferred to acceptance node (visual) | P1 |
| AC-13 | F8 graph view | deferred (stub in v1.0) | P2 |
| AC-14 | F10 PWA / offline | deferred to acceptance | P1 |

## Test harness

- Playwright 1.59 chromium-only project
- `webServer` block boots `vite preview --port 4173 --strictPort` against the
  fixture-built `dist/` (ensures we are testing the production bundle, not dev)
- Single worker, no retries — flake = real failure
- npm script: `npm test` already chains `npm run test:build && playwright test`
  (see `package.json:13`)

## Test files emitted

- `playwright.config.ts` (root) — chromium project, port 4173, webServer wired
- `test/e2e/smoke.spec.ts` — 8 P0 cases mapped from AC-1..AC-11

## Coverage table (P0 only)

| AC | Spec file path | Test name |
|---|---|---|
| AC-1 | test/e2e/smoke.spec.ts | "home renders folder tree + brand" |
| AC-2,3,4,9 | test/e2e/smoke.spec.ts | "doc route renders markdown + TOC + back-links section" |
| AC-5 | test/e2e/smoke.spec.ts | "Cmd+K opens palette and arrow+Enter navigates" |
| AC-6 | test/e2e/smoke.spec.ts | "/ shortcut also opens palette outside inputs" |
| AC-7 | test/e2e/smoke.spec.ts | "palette Tab is trapped (focus stays on input)" |
| AC-8 | test/e2e/smoke.spec.ts | "theme toggle round-trips and persists data-theme" |
| AC-10 | test/e2e/smoke.spec.ts | "404 route shows Page-not-found state" |
| AC-11 | test/e2e/smoke.spec.ts | "XSS — markdown <script> tag does not execute" |

8 P0 tests, all mapped 1:1 to acceptance criteria. test-execute will run them
against the fixture-built bundle.

## Verdict: PASS (test design phase)
