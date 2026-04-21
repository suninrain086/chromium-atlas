# Discuss — Decision (v1.0.2 run_1)

Three roles converged. Single round, batch-1 scope is mechanical CI plumbing
plus a 0.5 KB gz frontend indicator — no need for further deliberation.

## Locked plan

### New files
- `scripts/sync-chromium.mjs` (sparse clone, idempotent, writes sync-meta.json)
- `src/components/sync-health.ts` (header indicator, age-gated)
- `.github/workflows/sync-docs.yml` (cron + workflow_dispatch + concurrency)
- `.github/workflows/deploy.yml` (workflow_run → gh-pages)
- `test/e2e/v102.spec.ts` (5+ specs covering AC-5/8/9/10/12)

### Modified files
- `scripts/scan-docs.ts` — add `--source {real|mock}` CLI flag
- `src/main.ts` — mount sync-health in topbar
- `src/styles/app.css` — `.sync-health` muted small-text style
- `package.json` — `"sync:real": "node scripts/sync-chromium.mjs && tsx scripts/scan-docs.ts --source real"`
- `.gitignore` — add `dist-docs/`, `.cache/`, `public/sync-meta.json`
- `README.md` — add sync workflow badge + live URL placeholder

### CI defaults preserved
`npm test` continues to use mock fixtures (CI must not depend on
chromium.googlesource.com uptime). `--source real` is opt-in, used only
inside the GH Actions sync-docs workflow.

### Bundle ceilings (firm, unchanged)
- main ≤ 30 KB gz (currently 17.66; expected after F5: ~18.2)
- total ≤ 250 KB gz

### Acceptance criteria → AC-1..AC-12 (verbatim from PROJECT_BRIEF_v1.0.2.md)
All 12 ACs accepted; no scope changes. Quality tier: **delightful**.

### Test gating order
1. Bundle budget assert
2. v1.0.1 regression (26 tests must stay green)
3. v1.0.2 new specs (≥5 tests covering in-scope ACs)
4. actionlint on workflow YAMLs (AC-6/7)
