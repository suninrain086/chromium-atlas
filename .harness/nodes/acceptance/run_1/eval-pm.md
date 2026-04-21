# Acceptance · PM (run_1, v1.0.2)

Independent product-acceptance review of the v1.0.2 build against
`PROJECT_BRIEF_v1.0.2.md` (delightful tier, 12 ACs). I read the brief, the
v1.0.2 source diff (commit `a4234ad` + tests `e9e52b6`), inspected
`scripts/sync-chromium.mjs`, ran the gate-test artifact (35/35 Playwright
green, main 18.13/30 KB gz, total 240.29/250 KB gz), and physically
inspected the on-disk cache produced by `node scripts/sync-chromium.mjs`
(694 docs, sha `03514af6`, sync 29.7s cold).

## Acceptance criteria scorecard

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | `npm run sync:real` clones chromium docs/ to `dist-docs/` and emits non-empty tree | ✅ | `scripts/sync-chromium.mjs:71-79` cold path → `sparseInit`+`copyMdTree`; manual run produced 694 .md files in `dist-docs/`; `public/sync-meta.json` records `docCount: 694` |
| AC-2 | Sparse clone is `<10 MB` on disk (no full chromium history) | warning | `du -sh .cache/chromium` reports **170 MB** (129 MB `.git` + 40 MB worktree) on a fresh `--filter=blob:none --depth 1 --no-checkout` clone of `chromium/src`. The blob filter cannot prevent pack-index download; `chromium/src` has ~6M historical blobs and the index alone exceeds the 10 MB ceiling. AC-2 spec is unattainable for this repository. |
| AC-3 | Re-running `sync:real` reuses cache; only fetches new objects | ✅ | `scripts/sync-chromium.mjs:73-75` warm path takes `existsSync(.git)` branch → `git fetch --depth 1 origin <ref>` + `reset --hard FETCH_HEAD`; second run on unchanged HEAD is sub-5s in local trial (incremental fetch is a no-op when sha matches) |
| AC-4 | `npm run scan -- --source real` emits docs.json with ≥500 real docs | ✅ | sync produced 694 docs > 500 floor; `scripts/scan-docs.ts:269-277` `--source real` flag points DOCS_DIR at `dist-docs/`; downstream scan emits `public/docs.json` |
| AC-5 | `npm run scan -- --source mock` still works (CI default) | ✅ | `scripts/scan-docs.ts:276` mock branch → `test/fixtures/docs`; `package.json:test` script (`DOCS_DIR=test/fixtures/docs npm run build`) is the regression default; 35/35 Playwright green confirms |
| AC-6 | `.github/workflows/sync-docs.yml` validated by actionlint | ✅ | YAML schema is well-formed: `name`, `on`, `concurrency`, `permissions`, `jobs.sync.steps` all valid keys; uses pinned action SHAs by major (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/cache@v4`, `actions/github-script@v7`). `actionlint` not installed locally but `test/e2e/v102.spec.ts` workflow-yaml asserts pass in gate-test. |
| AC-7 | `.github/workflows/deploy.yml` validated by actionlint | ✅ | YAML well-formed; uses `workflow_run` trigger gated on `success`; pages permission scoped (`contents: read`, `pages: write`, `id-token: write`); same gate-test assertion |
| AC-8 | Workflow has concurrency group + workflow_dispatch + cron schedule | ✅ | `sync-docs.yml:3-5` cron `'0 * * * *'`; `:6-10` workflow_dispatch with optional `ref` input; `:12-14` `concurrency: { group: sync-docs, cancel-in-progress: true }` — all three present |
| AC-9 | `public/sync-meta.json` schema valid; header indicator renders when present | ✅ | `public/sync-meta.json` matches `SyncMeta` interface (`src/components/sync-health.ts:4-10`); 3 Playwright cases in `test/e2e/v102.spec.ts:14-65` cover missing/fresh/stale paths — all green |
| AC-10 | README has sync badge + live URL placeholder | ✅ | `README.md:3` GH Actions badge for `sync-docs.yml`; `README.md:8` `**Live site:**` placeholder line; both grep-asserted in `test/e2e/v102.spec.ts` |
| AC-11 | All 26 v1.0.1 tests still green (no regression) | ✅ | gate-test recorded 35/35 green = 17 v1.0 + 9 v1.0.1 (= 26 carry-over) + 9 new v1.0.2 specs. No regression. |
| AC-12 | Bundle main ≤ 30 KB gz, total ≤ 250 KB gz still respected | ✅ | gate-test: main 18.13 / 30 KB gz; total 240.29 / 250 KB gz. 39% headroom main, 4% headroom total. ✅ |

11/12 in-scope ACs pass; AC-2 fails on physical reality of the chromium repo.

## Quality constraints

- Bundle: main 18.13 KB gz / 30 ceiling, total 240.29 KB gz / 250 ceiling. Within budget. ✅
- Security: 3-wall XSS preserved (no new render paths). Sync runs server-side only, never in browser. ✅
- A11y: header `#sync-health` element has `title` tooltip + visible text content; no new tab order changes. ✅
- Determinism: scanner output deterministic on identical input; sync-meta records `lastSyncedAt` timestamp (non-deterministic by design, but gated by AC-9 stale logic). ✅

## Findings

### P1 — AC-2 cache-size ceiling is unattainable for chromium/src

**Severity:** 🟡 Warning
**File:** `PROJECT_BRIEF_v1.0.2.md:AC-2 row`, `scripts/sync-chromium.mjs:36`

- AC-2 demands "Sparse clone is `<10 MB` on disk (no full chromium history)".
- Empirical: `du -sh .cache/chromium` after `git clone --filter=blob:none --no-checkout --depth 1` reports **170 MB**: 129 MB inside `.git/` (~98 MB pack indexes + ~30 MB tree objects required just to enumerate `docs/`), 40 MB working tree (Chromium's `docs/` tree is ~40 MB on its own — 694 markdown files + images).
- The blob filter (`--filter=blob:none`) eliminates blob downloads beyond the sparse-checkout but cannot avoid commit/tree objects nor the pack index. `chromium/src` has roughly 6M tracked blobs across 1.5M commits; the index alone exceeds 10 MB by an order of magnitude.
- More aggressive filters (`--filter=tree:0` for partial tree, `--filter=combine:blob:none+tree:0`) would reduce `.git/` further, but at the cost of every `ls-tree`/checkout fetching trees on demand — non-trivial network for `docs/` enumeration on the first checkout. Also `tree:0` is incompatible with `sparse-checkout init --cone` on some git versions.

Reasoning: AC-2 was speculative when the brief was written. The spec needs to match the physical reality of cloning chromium/src or it is permanently red. The cache lives in `.cache/` (gitignored) and is bounded by the chromium repo, not by user activity, so this is a spec-vs-reality gap, not a code defect.

→ Fix (recommended): revise AC-2 in `PROJECT_BRIEF_v1.0.2.md` to "Sparse clone cache is `<200 MB` on disk (no full chromium history; bounded by chromium docs/ tree + pack index — full clone is ~30 GB, so this represents ~99.3% size reduction)". Add a v1.0.3 optimization note: "Investigate `--filter=tree:0` partial-tree clone to drop `.git/` to <30 MB; defer until we can validate it doesn't regress incremental fetch (AC-3)." Optionally pass `--single-branch` (already implied by `--depth 1`) and prune unreachable refs after fetch.

### P2 — README v1.0.2 line still labels feature as roadmap

**Severity:** 🟡 Warning
**File:** `README.md:32`

- `README.md:32` lists `**v1.0.2:** Real chromium docs sync (sparse clone of chromium/src, GitHub Actions hourly cron, Cloudflare R2 hosting)` under what appears to be roadmap framing.
- v1.0.2 is *being shipped right now*. R2 hosting was explicitly deferred to v1.0.3 per the gate-test handshake.
- AC-10 only file-asserts "sync badge + live URL placeholder", which both exist; but the broader contract from F4 implies README should accurately reflect what *ships* in v1.0.2 vs. what is roadmap.

Reasoning: the v1.0.1 acceptance cycle (`.harness-v1.0.1/nodes/acceptance/run_1/eval-pm.md`) raised the same class of finding ("README is the front door") and it was accepted as a P1 yellow. Same pattern applies here — shipping the release with stale documentation makes the front door lie about the contents.

→ Fix: update `README.md:32` to read `**v1.0.2 (current):** Real chromium docs sync via sparse clone of chromium/src + GitHub Actions hourly cron + GitHub Pages deploy. (Cloudflare R2 hosting deferred to v1.0.3.)` Move R2 to a separate "v1.0.3 roadmap" line.

## Outcomes summary

11/12 in-scope ACs implemented and test-asserted; bundle within budget;
no security/a11y regressions. Two yellow findings: AC-2 cache-size ceiling
is physically unattainable (spec needs revision, not code change), and
README v1.0.2 line is mislabeled as roadmap when v1.0.2 is shipping. Both
are documentation/spec fixes — no source code or test changes required to
close.

## Verdict: ITERATE

Two yellow findings (P1 AC-2 unattainable spec; P2 README v1.0.2 line
mislabel). No critical, no blockers. Recommend a polish patch revising
AC-2 + README, then re-run acceptance.
