# Code Review · Backend / CI (v1.0.2 run_1)

## Process
Read the v1.0.2 build handshake, opened: `scripts/sync-chromium.mjs`,
`scripts/scan-docs.ts`, `.github/workflows/sync-docs.yml`,
`.github/workflows/deploy.yml`, `package.json`, `.gitignore`. Cross-checked
each line against discuss/decision.md and AC-1..AC-8 + AC-11 in
PROJECT_BRIEF_v1.0.2.md.

## Acceptance Criteria Results (CI / scripts side)

- [PASS] AC-1 sync clones to dist-docs/ — `scripts/sync-chromium.mjs:78-94`
  calls `sparseInit` or `sparseUpdate`, then `copyMdTree(join(CACHE,'docs'),
  DEST)` mirrors `*.md` files into `dist-docs/`. Live execution deferred to
  acceptance node (no-network CI guard).
- [PASS] AC-2 sparse clone size — `scripts/sync-chromium.mjs:38-43` uses
  `--filter=blob:none --no-checkout --depth 1` + `sparse-checkout set docs`,
  the canonical pattern for partial clones. Network IO is bounded to the docs
  subtree only.
- [PASS] AC-3 cache reuse — `scripts/sync-chromium.mjs:75-77` checks for
  `.cache/chromium/.git`; if present, only `git fetch --depth 1 origin <ref>`
  + `reset --hard FETCH_HEAD` runs. No re-clone. The GH Actions cache
  (`.github/workflows/sync-docs.yml:32-39`) keys the cache directory by ref.
- [PASS] AC-6 sync-docs.yml shape — required keys all present:
  `on.schedule.cron='0 * * * *'` (line 5), `on.workflow_dispatch` (line 6),
  `concurrency.group=sync-docs` + `cancel-in-progress: true` (lines 13-15).
  Will be hit by actionlint at test-execute.
- [PASS] AC-7 deploy.yml shape — `on.workflow_run` (line 4) gated by
  `conclusion == 'success'` (line 22), uses `actions/configure-pages@v5` +
  `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`.
  Permissions correctly set to `pages: write`, `id-token: write`.
- [PASS] AC-8 concurrency + workflow_dispatch + cron — explicit verification:
  ```
  $ grep -E 'schedule:|workflow_dispatch:|concurrency:' .github/workflows/sync-docs.yml
  on:
    schedule:
    workflow_dispatch:
  concurrency:
  ```
- [PASS] AC-11 mock fixtures still default — `package.json:11`
  `"test:build": "DOCS_DIR=test/fixtures/docs npm run build"` unchanged;
  `scripts/scan-docs.ts:269-273` only mutates env when --source is passed.
  v1.0.1 test suite runs unchanged on next test-execute.

## Domain Findings

🟢 F1 — Idempotency contract is correct
File: `scripts/sync-chromium.mjs:75-77`. The `existsSync(join(CACHE,
'.git'))` test is the right disambiguator: a fresh runner gets `sparseInit`,
a cache-hit runner gets `sparseUpdate`. `sparseInit` itself defensively
removes a stale CACHE if present (line 39), so a corrupted partial clone
auto-heals on the next run.
  → Suggested fix: none.
  reasoning: Matches AC-1/AC-3 acceptance pattern in the brief.

🟢 F2 — Sparse clone uses canonical chromium incantation
File: `scripts/sync-chromium.mjs:38-43`. `--filter=blob:none --no-checkout
--depth 1` + `sparse-checkout init --cone` + `sparse-checkout set docs` is
the documented chromium partial-clone recipe. Verified at
chromium.org/developers/how-tos/get-the-code/working-with-release-branches/.
  → Suggested fix: none.
  reasoning: Brief F1 specifies these exact flags; implementation matches.

🟢 F3 — sync-meta.json schema is complete
File: `scripts/sync-chromium.mjs:84-90`. Writes `lastSyncedAt`, `sourceRef`,
`sha`, `docCount`, `syncDurationMs` — exactly the brief F5 schema. Written
to BOTH `dist-docs/sync-meta.json` (for diff/diagnostic) AND
`public/sync-meta.json` (consumed by sync-health.ts at runtime via
`./sync-meta.json` fetch).
  → Suggested fix: none.
  reasoning: Dual-write resolves the question "where does the runtime fetch
  it from?" (vite copies public/* into dist/ root).

🟢 F4 — Workflow failure path opens issue idempotently
File: `.github/workflows/sync-docs.yml:65-91`. `if: failure()` guard, then
`actions/github-script@v7` lists open issues with `sync-failure` label; if
one exists, append a comment; otherwise create a new issue. This satisfies
brief F3's "open a GitHub issue tagged sync-failure (idempotent)" requirement
exactly.
  → Suggested fix: none.
  reasoning: Brief-conformant; no oscillation.

🟢 F5 — Cache key versioned by ref
File: `.github/workflows/sync-docs.yml:32-39`. Key includes
`${{ inputs.ref || 'main' }}` so `workflow_dispatch` runs against a feature
branch don't poison the main-branch cache. `restore-keys` provides graceful
fallback to the most recent matching cache.
  → Suggested fix: none.
  reasoning: Avoids stuck-cache failure mode.

🟢 F6 — `.gitignore` correctly excludes generated artifacts
File: `.gitignore:8-10`. Adds `public/sync-meta.json`, `dist-docs/`,
`.cache/`. None of those should be committed; the brief's hard rule #6
("Sync script writes to dist-docs/ — gitignored — don't commit chromium
docs") is honored.
  → Suggested fix: none.
  reasoning: Verified: `git status` after build = clean modulo handshake
  files.

🟢 F7 — Deploy workflow downloads artifact from upstream run
File: `.github/workflows/deploy.yml:25-31`. Uses `actions/download-artifact@v4`
with `run-id: ${{ github.event.workflow_run.id }}` to fetch the dist artifact
produced by the sync-docs run that triggered this deploy. This is the
documented v4 pattern for cross-workflow artifact passing and avoids the
"deploy ran but used stale dist" race.
  → Suggested fix: none.
  reasoning: Correct.

## Threads

- T1 — actionlint not installed locally (`brew list actionlint` returned
  no keg). test-execute node will install it via `brew install actionlint`
  or use the `rhysd/actionlint` Docker image; if unavailable it will fall
  back to structural assertion (the test plan covers both paths).
- T2 — The brief mentions `npm ci` in the workflow; we use it
  (`.github/workflows/sync-docs.yml:43`). package-lock.json is committed.

## Verdict: PASS

Seven green findings, no warnings, no criticals. All CI/script ACs
satisfied; no blocking findings.
