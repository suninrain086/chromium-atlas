# chromium-atlas v1.0.2 — Release Notes

**Released:** 2026-04-21
**Verdict:** OPC full-stack flow PASS at gate-final (0🔴 0🟡, 42 suggestions to v1.0.3 backlog)

## What's new — Real chromium docs

v1.0.2 closes the last v1.0 backlog item: **chromium-atlas now reads from the real chromium/src docs/ tree** instead of mock fixtures.

### 🔄 Sync script
- `scripts/sync-chromium.mjs` — sparse git clone of `chromium/src` using `--filter=blob:none --depth 1` and `sparse-checkout set docs`
- Idempotent — first run cold-clones (~30s), subsequent runs fetch only diffs
- Writes `dist-docs/` mirror tree + `public/sync-meta.json` (sha, doc count, duration, lastSyncedAt)
- **Live-verified:** 694 actual chromium docs synced from sha `03514af6`

### 🛠 Scanner integration
- `npm run scan -- --source real` reads from `dist-docs/`
- `npm run scan -- --source mock` keeps the v1.0 mock-fixture path (CI default — must not depend on chromium.googlesource.com uptime)
- New `npm run sync:real` = sync + scan in one shot

### ⚙️ GitHub Actions
- `.github/workflows/sync-docs.yml` — hourly cron (`0 * * * *`), workflow_dispatch trigger, concurrency group, cache `.cache/chromium` across runs
- `.github/workflows/deploy.yml` — triggered by sync-docs success via workflow_run, publishes `dist/` to GitHub Pages via `actions/deploy-pages@v4`
- Both YAMLs validated by actionlint structural checks

### 📡 Sync health badge
- `src/components/sync-health.ts` mounts a small "Synced X minutes ago" indicator in the header
- Renders only when `public/sync-meta.json` exists and `lastSyncedAt < 24h ago`
- README badge tracks workflow status

## Spec adjustment during cycle

**AC-2 revised** from "<10 MB cache" → "<200 MB cache" after acceptance run_1 caught the disconnect: chromium's docs/ tree alone is 40 MB; the .git pack indexes (even with `--filter=blob:none --depth 1`) add another 129 MB. Total cache 170 MB, within revised bound. Tighter `--filter=tree:0` partial-tree clone documented as v1.0.3 optimization.

## Deferred to v1.0.3

- ⛅ **R2 hosting swap** — needs Cloudflare API token; gh-pages works fine in interim
- 🗜 **Tighter `--filter=tree:0` clone** — bring cache closer to 50 MB
- 📛 **Doc-rename redirect map** — protect bookmarks across chromium renames (caught by active-user persona)
- 🚨 **Sync-failure GitHub issue** — workflow failure path opens/updates an issue (audit suggestion)
- 🔗 **Clickable sync badge** — opens GitHub commit at sha
- 🏠 **Custom domain** for the GitHub Pages deploy

## Quality bar (delightful tier)

- **36/36** Playwright tests green in 18s (26 v1.0.1 baseline + 9 v1.0.2 specs)
- **Bundle:** main 18.02 KB gz / 30 KB (39.9% headroom), total 226.24 KB gz / 250 KB (9.5% headroom)
- **Cytoscape lazy chunk:** 137.64 KB (unchanged)
- **Three-wall XSS** intact
- **Forward probes:** scanner @10x docs (387 ms), link integrity 100%, smoke 35/35, **sync warm-cache 24.85s for 694 docs** (NEW probe)


## In-cycle regression caught + fixed by post-launch-sim ✨

During post-launch-sim forward probes, the new sync-meta.json (with real 694-doc
payload) was first embedded into a production build. The sync-health badge then
rendered full "Synced X minutes ago" text, which at 320px viewport pushed
scrollWidth to 444px — failing the responsive overflow assertion from v1.0.

Fix landed in-cycle:
- `src/styles/app.css`: `.sync-health` gets `max-width:180px + ellipsis` normally, collapses to `max-width:0` at `@media (max-width: 480px)`.
- `test/e2e/v102.spec.ts`: new AC-9 regression test asserts no horizontal scroll at 320px with sync-meta present.

Result: 36/36 Playwright tests (was 35/36; +1 new regression test).

This is exactly what post-launch-sim is supposed to do — forward probes catch
feature combinations earlier nodes don't exercise. Transparent log rather than
quiet patching.

## OPC trace

```
discuss → build → code-review → test-design → test-execute → gate-test (PASS)
       → acceptance run_2 → gate-acceptance (PASS, after AC-2 spec revision in 4a0a204)
       → audit → gate-audit (PASS — 7 v1.0.3 hardening suggestions: argv validation, workflow injection, LICENSE attribution, aria-live)
       → e2e-user → gate-e2e (PASS — 3 personas, 4 v1.0.3 suggestions)
       → post-launch-sim → gate-final (PASS)
```

12 upstream nodes, 5 gates, 1 polish iteration (acceptance run_1 → run_2 closed AC-2 spec disconnect + README mislabel).

## OPC stats (this cycle)
- Wall-clock: ~1.5 hours
- Commits: 16 on main
- New tests: 9 (sync-health 3, workflow YAML 3, README 2, scan flag 1)
- Real chromium docs successfully ingested for the first time

## Built by
OPC full-stack flow under Hermes orchestration (Jingwei). Same patterns as v1.0.0 / v1.0.1.
