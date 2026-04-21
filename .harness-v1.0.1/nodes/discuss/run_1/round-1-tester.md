# Discuss — Tester (round 1, v1.0.1)

## P0 test plan additions (test/e2e/v101.spec.ts)

| ID | AC | Test |
|---|---|---|
| T1 | AC-1 | Navigate `#/graph`; assert `cy` global exposed and `nodes().length > 0` within 800ms |
| T2 | AC-2 | Click first node in graph; URL updates to `#/doc/<path>` |
| T3 | AC-3 | On graph view, toggle theme; assert no `cy.destroy` called (probe via marker) and stylesheet updated |
| T4 | AC-4 | Read `dist/assets/index-*.js.gz`; assert ≤ 30 KB |
| T5 | AC-4b| Sum all `dist/assets/*.js.gz` + `*.css.gz`; assert ≤ 250 KB |
| T6 | AC-5 | Fetch `/manifest.webmanifest`; parse, assert name+icons+start_url |
| T7 | AC-6 | Cold-load home, set context offline, reload; home renders |
| T8 | AC-7 | Theme button has `aria-pressed` matching state |
| T9 | AC-8 | View-mode group: arrow keys move focus among radios |
| T10| AC-9 | At 375px viewport, all toggles bbox.height >= 44 and width >= 44 |
| T11| AC-10| Files exist + package.json.license === "MIT" |
| T12| AC-12| Run existing smoke.spec.ts (17 tests) — all pass |

## Bundle assertion script

`scripts/check-budget.mjs`: enumerate `dist/assets/*.js`, gzip with
`zlib.gzipSync`, find chunk whose name starts with `index-` → main; sum all
others. Print table; exit 1 on overage.

## Persona harness verification

After F5, rerun all 14 personas. Target 14/14 raw (was 11/14). Acceptance =
all green or remaining flake annotated as "v1.0 backlog still" with reason.

## Regression scope

Existing 17 v1.0 specs (smoke + polish + responsive) must still pass exactly
as-is. No fixture mutation. If view-mode radiogroup refactor changes selectors,
update existing specs to use stable `data-test` attributes or `role=radio`.

## Risk

- Graph perf 800ms on 691 nodes is tight with fcose `proof` quality. Use
  `default` quality + `randomize: false` first paint; only "proof" when small.
- PWA install button is platform-flaky in Playwright (no `beforeinstallprompt`
  in headless chromium). Test only that the button is hidden by default.
