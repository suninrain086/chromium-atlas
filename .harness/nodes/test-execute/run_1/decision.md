# Test Execute (v1.0.2 run_1)

## Run
`npm test` (Playwright, single chromium project, against `vite preview --port 4179`).
Mock fixtures path used (`DOCS_DIR=test/fixtures/docs`).

## Result: **35/35 PASS** in 18.8 s

### Composition
- 17 v1.0 regression specs (smoke, polish, responsive)
- 9 v1.0.1 specs (graph, PWA, a11y polish, bundle assertion, etc.)
- 9 v1.0.2 specs (3 sync-health gating + 3 workflow YAML + 2 README + 1 scan --source)

Total = 35 = 26 v1.0.1 baseline + 9 new v1.0.2 ACs ✅

### Test → AC mapping (v1.0.2 only)

| Spec | AC |
|---|---|
| sync-health hidden when sync-meta.json missing | AC-9 (a) |
| sync-health visible with fresh meta (now) | AC-9 (b) |
| sync-health hidden when meta is stale (>24h) | AC-9 (c) |
| sync-docs.yml has cron + workflow_dispatch + concurrency | AC-8 |
| deploy.yml has workflow_run + deploy-pages | AC-7 |
| actionlint passes both YAMLs if available | AC-6/AC-7 (graceful skip if absent) |
| README has sync-docs workflow badge | AC-10 (a) |
| README has live URL placeholder | AC-10 (b) |
| scan --source mock equivalent to DOCS_DIR=test/fixtures/docs | AC-5 |

AC-11 satisfied: 17+9 = 26 v1.0.1 backlog tests still green (no regression).
AC-12 satisfied: bundle main 18.13 KB / 30 KB; total 240.29 KB / 250 KB.

### actionlint
Not installed locally (`which actionlint` → 1). The spec emits an annotation
and falls back to the structural assertion (which DID run and passed).
This matches the test-design plan; CI will install actionlint via the
sync-docs workflow itself if/when desired.

### Bug fixed mid-execution
First run of AC-5 spec failed because the inline tsx harness was placed in
`.cache/`, breaking the relative `import "./scripts/scan-docs.ts"` path.
Fixed: harness now written to repo root and removed in a `finally` block;
also added a direct `--source mock` CLI invocation as a second-layer check.

## Bundle metrics (re-confirmed)
| Item | gz | Budget | Headroom |
|---|---|---|---|
| main `index-Chmte1Kw.js` | 18.13 KB | 30 KB | 39.6 % |
| graph chunk `cyto-CigD6eQO.js` | 138.62 KB | (own line) | — |
| total all chunks | 240.29 KB | 250 KB | 3.9 % |

🟢 Within budget.

## Verdict: PASS

Zero failures, zero flakes, all in-scope ACs covered.
