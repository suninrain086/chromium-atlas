# Discuss · Tester (v1.0.2 run_1)

## Test plan summary
12 ACs (AC-1..AC-12 in PROJECT_BRIEF_v1.0.2.md). For gate-test scope we need:
- AC-4 partial via mock surrogate (`--source mock` produces ≥17 fixture docs)
- AC-5 regression (mock path still works)
- AC-6/AC-7 via actionlint static check
- AC-8 via YAML grep for `concurrency:`, `workflow_dispatch:`, `schedule:`
- AC-9 sync-meta schema + Playwright header indicator render-when-fresh
- AC-10 README grep
- AC-11 26/26 v1.0.1 tests still green
- AC-12 budget script

## Out of scope for gate-test (deferred to acceptance/audit/e2e)
- AC-1,2,3 require live network → out of CI; will be run interactively, not on CI
- Real workflow execution (no push)

## Specs to add (test/e2e/v102.spec.ts)
1. `sync-meta indicator hidden when no meta` — start with no `public/sync-meta.json`
   present in `test/fixtures/docs/` build path → header has no visible #sync-health.
2. `sync-meta indicator visible with fresh meta` — write a fixture meta with
   `lastSyncedAt = now` to `public/sync-meta.json` before build, then expect
   header text matches `/Synced .* ago/`.
3. `sync-meta indicator hidden when stale (>24h)` — meta with `lastSyncedAt` of
   48h ago → element hidden.
4. `actionlint passes both workflow YAMLs` — node test that shells `actionlint`
   if available, otherwise a structural assertion (regex on required keys).
5. `README has sync badge + live URL placeholder` — grep test in a node script
   or simple Playwright fetch of README via static.
6. `--source mock equals legacy default` — node integration: run scan with
   `--source mock` and `DOCS_DIR=test/fixtures/docs`, compare `docs.json` outputs.

## Risk-of-flake controls
- Indicator tests build with predetermined `public/sync-meta.json` injected by a
  pre-test setup hook (NOT committed; written + cleaned in beforeAll/afterAll).
- Time-based assertions use Date.now() at write time to avoid clock drift.
- actionlint absence falls back to structural test so CI never hard-depends.

## Falsifiability
- If sync-health renders when meta absent → bug.
- If scan --source real reads from fixtures → CLI flag mapping broken.
- If workflow lacks any of {schedule, workflow_dispatch, concurrency} keys → AC-8 fails.
