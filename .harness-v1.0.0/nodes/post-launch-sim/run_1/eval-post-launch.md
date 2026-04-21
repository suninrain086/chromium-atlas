# post-launch-sim — Forward simulation (run_1)

## Probes executed

| Probe | Horizon | Method | Result | Verdict |
|---|---|---|---|---|
| Scanner perf @ 10x docs | T+30d (growth) | duplicated 691 fixtures → 6910, ran `npm run scan` | 472 ms | PASS |
| Link integrity | T+60d (rot) | parsed `outgoing_links` in `public/docs.json`, intersected with file set | 0/0 broken (0.0%) | PASS |
| Bundle drift | T+90d (feature creep) | gzip-measured `dist/assets/index-*.js` against 200 KB budget | 16.26 KB / 200 KB (91.9% headroom) | PASS |
| Smoke regression | T+0 (sanity) | replayed Playwright suite against current dist/ | 17 passed, 0 failed in 4.1s | PASS |

## Risk register (forward-looking)

- **T+30d** — chromium docs/ tree adds 50+ new files
  → scanner is O(N), 10x stress = 472ms — capacity to spare for 1y growth
- **T+60d** — link rot from chromium renames
  → v1.0.1 sync pipeline must emit doc-rename redirect map; current zero-broken baseline gives clean diff target
- **T+90d** — bundle creep when graph view + service worker land in v1.0.1
  → Cytoscape lazy chunk + workbox split; current 16.75 KB gz main = 9% of 200 KB budget, ~91% headroom
- **T+90d** — persona-harness ordering bugs (see e2e-user 3 misses)
  → backlog item: add waitFor primitives + localStorage seed helper before any v1.1 e2e expansion

## Findings

- 🔴 Critical: 0
- 🟡 Warning: 0
- 🟢 Suggestion: 0 (all surfaced suggestions belong to prior nodes)

## Verdict

**PASS** — All four probes green; risk register entered; no new blockers
surfaced beyond the v1.0.1 backlog already filed by audit/e2e-user.
