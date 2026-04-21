# post-launch-sim — Forward simulation (run_1) — v1.0.1

## Probes executed

| Probe | Method | Result | Verdict |
|---|---|---|---|
| Scanner perf @ 10x docs | duplicated 691 fixtures → 6910, ran `npm run scan` | 423 ms | PASS |
| Link integrity | parsed `outgoing_links` in docs.json | 0/0 broken (0.0%) | PASS |
| Bundle drift | gzip-measured dist/assets/*.js | main 17.66/30 KB (41.1% headroom), cyto-lazy 137.64 KB, total 225.88/250 KB (9.6% headroom) | PASS |
| Smoke regression | replayed Playwright suite | 26 pass, 0 fail in 16.7s | PASS |

## Risk register (forward-looking)

- **T+30d** — Cytoscape 4.x major bump or layout regression
  → lazy chunk isolated; pin in package-lock; smoke includes graph render assertion (v101.spec.ts:80)
- **T+60d** — Service worker stale cache after deploy
  → vite-plugin-pwa autoUpdate + per-build hash; churned-user persona scenario covers this
- **T+60d** — Real chromium docs/ tree growth pushes link.json over reasonable size
  → v1.0.2 sync pipeline must enforce per-doc link cap or paginate; current scanner O(N) handles 6910 files in 472ms
- **T+90d** — Total bundle creep when v1.0.2 sync adds GH Actions tooling
  → sync runs server-side via Action, not in client bundle; keep total JS ≤ 250 KB by treating CI tools as separate workspace

## Findings: 0 critical, 0 warning, 0 suggestion (above suggestions belong to prior nodes).

## Verdict
PASS — All four probes green. Risk register entered. No new blockers; v1.0.2 backlog already absorbs the deferred sync work.
