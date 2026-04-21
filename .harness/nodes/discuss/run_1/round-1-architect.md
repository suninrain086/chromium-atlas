# Discuss · Architect (v1.0.2 run_1)

## Position
v1.0.2 ships ONE feature in 5 sub-parts: real-docs sync. CI infra change with zero
client-bundle impact. The split is clean; each sub-part has an independent file
boundary which lets us reason locally without re-touching graph/PWA code.

## Architecture
- `scripts/sync-chromium.mjs` — Node ESM, shell-out to git via `child_process.spawnSync`.
  Idempotent: if `.cache/chromium/.git` exists, do `git fetch --depth 1 origin <ref>`
  + `git reset --hard FETCH_HEAD`; else full sparse clone. After checkout, mirror
  `docs/` into `dist-docs/` with `cp -R` (or rsync if available). Write
  `dist-docs/sync-meta.json` AND `public/sync-meta.json` so both consumers see it.
- `scripts/scan-docs.ts` already honors `DOCS_DIR`. Add a `--source {real|mock}`
  flag that maps to `dist-docs/` or `test/fixtures/docs/`. Backward compatible:
  no flag = legacy DOCS_DIR / fixtures path.
- `.github/workflows/sync-docs.yml` — cron `0 * * * *`, `workflow_dispatch`,
  `concurrency: { group: sync-docs, cancel-in-progress: true }`. Steps:
  checkout → setup-node@v4 (node 20) → cache `.cache/chromium` keyed by
  `inputs.ref || main` → `node scripts/sync-chromium.mjs --ref ${{ ... }}`
  → `npm ci` → `npm run scan -- --source real` → `npm run build` → upload-artifact.
- `.github/workflows/deploy.yml` — `workflow_run` trigger on sync-docs success.
  Permissions: `pages: write`, `id-token: write`. Uses `actions/configure-pages@v5`,
  `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`.
- Sync health indicator in src/main.ts header — fetch `/sync-meta.json`
  non-blocking; if `lastSyncedAt` < 24h ago, render small `<span class="sync-health">`
  in topbar. Pure DOM, no new deps. Bundle impact ≤ 0.5 KB gz.

## Risks
- R1: Sparse clone availability of `chromium.googlesource.com` — mock fixtures
  remain CI default to insulate `npm test`.
- R2: `dist-docs/` size could blow git if accidentally committed → .gitignore.
- R3: Re-running scan on real docs could break determinism if fixtures and real
  docs collide names — they don't (separate roots).

## File:line anchors I expect to write
- scripts/sync-chromium.mjs:1-150 (new)
- scripts/scan-docs.ts:267-275 (CLI flag parse)
- src/main.ts:42-50 (sync-health host) + small render fn
- .github/workflows/sync-docs.yml:1-end (new)
- .github/workflows/deploy.yml:1-end (new)
- .gitignore: append `dist-docs/`, `.cache/`, `public/sync-meta.json`
- package.json: scripts `sync:real`, `scan` accepts forwarded args (already does via npm)

## Tests planned (test-design will refine)
- unit: sync-meta schema validity, --source flag mapping
- integration: actionlint on both YAML files
- regression: 26/26 v1.0.1 specs still green
- new: sync-health indicator render gated on meta presence + age
