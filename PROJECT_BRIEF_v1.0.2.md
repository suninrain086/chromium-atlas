# chromium-atlas v1.0.2 — Project Brief

**Cycle:** v1.0.2 (incremental release on top of v1.0.1)
**Tier:** delightful
**Wall-clock budget:** 3 hours
**Started from:** v1.0.1 commit `ef13c13` (gate-final PASS, 0🔴 0🟡)

## Why v1.0.2

v1.0.1 closed 5 of 6 v1.0 backlog items. The last one — **real chromium docs sync** — is this cycle's sole feature. Was deferred from v1.0.1 because it touches CI infra and would have collided with graph-view code paths. Now landing standalone.

## In scope (v1.0.2)

### F1 — Real chromium docs ingestion (`scripts/sync-chromium.mjs`)
- Sparse git clone of `chromium/src` using:
  - `git clone --filter=blob:none --no-checkout --depth 1 https://chromium.googlesource.com/chromium/src.git .cache/chromium`
  - `git -C .cache/chromium sparse-checkout init --cone`
  - `git -C .cache/chromium sparse-checkout set docs`
  - `git -C .cache/chromium checkout main`
- On subsequent runs: `git fetch --depth 1 + reset --hard origin/main` (no full re-clone)
- Output: a `dist-docs/` mirror tree of just `chromium/src/docs/`
- Configurable: `--ref <branch|sha>` (default `main`), `--dest <path>` (default `dist-docs/`)

### F2 — Incremental scanner integration
- `npm run scan -- --source real` reads from `dist-docs/` instead of `test/fixtures/docs/`
- `npm run scan -- --source mock` keeps the v1.0 path (CI default to avoid depending on chromium uptime in tests)
- New `npm run sync:real` = `sync-chromium.mjs && scan --source real`
- Diff awareness: if previous `dist-docs/` exists, log `git diff --name-only OLD..NEW` for visibility (full rebuild for now; incremental graph rebuild = v1.0.3)

### F3 — GitHub Actions hourly cron
- `.github/workflows/sync-docs.yml`:
  - Cron `0 * * * *` (every hour, on the hour)
  - Concurrency group `sync-docs` (cancel in-progress)
  - Steps: checkout repo → cache `.cache/chromium` keyed by ref → sync-chromium → scan --source real → vite build → upload `dist/` artifact
- Manual `workflow_dispatch` trigger for testing
- Failure path: open a GitHub issue tagged `sync-failure` (idempotent — append to existing open issue)

### F4 — gh-pages deploy (R2 deferred to v1.0.3)
- `.github/workflows/deploy.yml` triggered after sync-docs succeeds
- Uses `actions/deploy-pages@v4` to publish `dist/` to GitHub Pages
- Custom domain: not configured this cycle (chromium-atlas.<user>.github.io is fine)
- README updated with live URL once first deploy lands
- **Why not R2:** requires Cloudflare API token jacky hasn't provided. gh-pages is free + zero-config; swap path is `actions/deploy-pages → cloudflare/pages-action` later, no app code changes.

### F5 — Sync health badge + last-synced indicator
- After sync, write `public/sync-meta.json`: `{lastSyncedAt, sourceRef, sha, docCount, syncDurationMs}`
- Header shows small "Synced X minutes ago" indicator (only if `sync-meta.json` present and < 24h old)
- README badge: GitHub Actions sync workflow status

## Out of scope (deferred)

- ❌ R2 hosting — v1.0.3 (needs Cloudflare token)
- ❌ Incremental graph rebuild from `git diff` — v1.0.3
- ❌ User accounts / pinning / frequent-docs decay — v1.1
- ❌ Notifications on sync failure beyond GitHub issue — v1.1
- ❌ Custom domain — v1.0.3

## Acceptance criteria (delightful tier)

| AC | Description | Test |
|---|---|---|
| AC-1 | `npm run sync:real` clones chromium docs/ to `dist-docs/` and emits non-empty tree | unit/integration |
| AC-2 | Sparse clone cache is `<200 MB` on disk (no full chromium history; bounded by chromium docs/ tree + pack index — full clone is ~30 GB, so this is ~99.3% size reduction). v1.0.3 may explore `--filter=tree:0` partial-tree clone to drop `.git/` further. | size assertion |
| AC-3 | Re-running `sync:real` reuses cache; only fetches new objects | timing assertion |
| AC-4 | `npm run scan -- --source real` emits docs.json with ≥500 real docs | count assertion |
| AC-5 | `npm run scan -- --source mock` still works (CI default) | regression |
| AC-6 | `.github/workflows/sync-docs.yml` validated by actionlint | static check |
| AC-7 | `.github/workflows/deploy.yml` validated by actionlint | static check |
| AC-8 | Workflow has concurrency group + workflow_dispatch + cron schedule | YAML assertion |
| AC-9 | `public/sync-meta.json` schema valid; header indicator renders when present | Playwright |
| AC-10 | README has sync badge + live URL placeholder | grep assertion |
| AC-11 | All 26 v1.0.1 tests still green (no regression) | npm test |
| AC-12 | Bundle main ≤ 30 KB gz, total ≤ 250 KB gz still respected | build assertion |

## Hard constraints

1. Local main commits only; jacky pushes after gate-final
2. Sync runs server-side (Action) — no real clone in client bundle
3. Mock fixtures stay default for `npm test` (CI must not depend on chromium.googlesource.com uptime)
4. Bundle budgets unchanged from v1.0.1
5. Sanitize all rendered HTML (3-wall XSS pipeline intact)
6. Conventional commits

## OPC flow

`full-stack` template, delightful tier. Same 14 nodes. Verdict synthesis is mechanical via `opc-harness synthesize`.

**Note:** since AC-6/AC-7/AC-8 require GitHub Actions to actually run, and we cannot trigger them from the build node (no push), we'll validate them statically (actionlint + YAML schema) and treat the first real cron tick as v1.0.2 launch confirmation. acceptance/audit/e2e nodes will simulate the workflow path with a local `act` run if available, otherwise structured static analysis.

## Definition of done

- All 5 features (F1-F5) implemented
- All 12 ACs pass (AC-6/AC-7 via actionlint, AC-9 via Playwright)
- gate-final reached with PASS verdict
- `RELEASE_NOTES_v1.0.2.md` written
- v1.0.1 regression suite still green
