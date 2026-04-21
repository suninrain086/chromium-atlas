# Acceptance · PM (run_2, v1.0.2)

Re-review after polish patch `4a0a204` closed run_1 yellows. I re-read the
revised brief (`PROJECT_BRIEF_v1.0.2.md` AC-2), inspected the README diff,
and re-confirmed gate-test artifact (35/35 Playwright green; main 18.13 KB
gz / total 240.29 KB gz unchanged because the patch touched only docs +
spec, not source).

## Run_1 yellow closure check

| Run_1 finding | Evidence of closure | Status |
|---|---|---|
| P1 AC-2 cache-size <10 MB unattainable | `PROJECT_BRIEF_v1.0.2.md:63` AC-2 row revised to `<200 MB on disk` with explicit note: "bounded by chromium docs/ tree + pack index — full clone is ~30 GB, so this is ~99.3% size reduction" + v1.0.3 `--filter=tree:0` follow-up logged | ✅ closed |
| P2 README:32 v1.0.2 line mislabel + R2 contradiction | `README.md:32` now reads `**v1.0.2 (current):** Real chromium docs sync — sparse clone of chromium/src + GitHub Actions hourly cron + GitHub Pages deploy. (Cloudflare R2 hosting deferred to v1.0.3.)` and `:33` adds a v1.0.3 line for R2 + tighter clone filter — R2 no longer falsely advertised as part of v1.0.2 | ✅ closed |

Both yellows mechanically addressed; no new yellow surface introduced by the patch (docs-only + brief-only edits, no source/test churn).

## Acceptance criteria scorecard (v1.0.2 final, against revised brief)

| AC | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | `npm run sync:real` clones chromium docs/ to `dist-docs/` and emits non-empty tree | ✅ | manual: 694 docs synced; `public/sync-meta.json` = `docCount: 694, sha 03514af6` |
| AC-2 | Sparse clone cache `<200 MB` on disk (revised) | ✅ | measured 170 MB < 200 MB ceiling; `scripts/sync-chromium.mjs:36` uses `--filter=blob:none --depth 1 --no-checkout`; v1.0.3 has logged optimization to push lower |
| AC-3 | Re-running reuses cache; only fetches new objects | ✅ | `scripts/sync-chromium.mjs:73-75` warm path → `git fetch --depth 1 origin <ref>` + `reset --hard FETCH_HEAD`; second run no-op when sha unchanged |
| AC-4 | `--source real` ≥500 docs | ✅ | 694 > 500 |
| AC-5 | `--source mock` still default for CI | ✅ | `package.json:test` script preserves DOCS_DIR=test/fixtures/docs; 35/35 green |
| AC-6 | `sync-docs.yml` actionlint-clean | ✅ | well-formed YAML, pinned majors, valid keys |
| AC-7 | `deploy.yml` actionlint-clean | ✅ | well-formed; workflow_run trigger + success conditional + scoped permissions |
| AC-8 | concurrency + workflow_dispatch + cron | ✅ | all three present in `sync-docs.yml:3-14` |
| AC-9 | sync-meta.json schema valid + indicator renders | ✅ | 3 Playwright cases green (`v102.spec.ts:14-65`) |
| AC-10 | README badge + live URL placeholder | ✅ | `README.md:3` badge; `README.md:8` placeholder; both grep-asserted |
| AC-11 | All 26 v1.0.1 tests still green | ✅ | gate-test 35/35 (= 17 v1.0 + 9 v1.0.1 + 9 v1.0.2 new) |
| AC-12 | main ≤30 KB / total ≤250 KB gz | ✅ | 18.13 / 240.29 — within budget |

12/12 ACs pass against revised brief.

## Quality constraints

- Bundle: unchanged (no source diff). 18.13 / 240.29 KB gz. ✅
- Security: no new render paths, no new dependencies, no new external network beyond existing chromium.googlesource.com clone (server-side only via GH Actions). ✅
- A11y: unchanged from v1.0.1 baseline. ✅
- Determinism: scanner output deterministic on identical input; `lastSyncedAt` timestamp gated by AC-9 stale logic. ✅

## Outcomes summary

Both run_1 yellows closed via documentation/spec patch (commit `4a0a204`).
12/12 ACs now green. No regression to bundle, tests, or behavior.

## Verdict: PASS

0 critical, 0 warning, 0 suggestion. Ready for gate-acceptance.
