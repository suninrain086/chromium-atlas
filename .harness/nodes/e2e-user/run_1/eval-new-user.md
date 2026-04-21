# e2e-user — New user persona (v1.0.2)

Persona: first-time visitor lands on the deployed gh-pages URL after first cron sync.

## Walkthrough (5 scenarios)

| # | Scenario | Outcome | Evidence |
|---|---|---|---|
| 1 | Cold load → home renders within 1s, sees REAL chromium doc titles (not mock generic prose) | PASS | sync-chromium.mjs verified to fetch 694 real docs |
| 2 | Notices "Synced X minutes ago" badge in header | PASS | src/components/sync-health.ts mounts when sync-meta.json present |
| 3 | Browses to accessibility/os/chromevox.md (real chromium doc) | PASS | hash router unchanged from v1.0.1; 694 docs include this path |
| 4 | Opens graph view — sees real cross-doc link structure | PASS | scan-docs reads from dist-docs/ when --source real |
| 5 | Discovers GitHub Pages URL works on mobile (PWA installable) | PASS | vite-plugin-pwa unchanged from v1.0.1; deploy.yml outputs to gh-pages |

Findings: 0 critical, 0 warning. 1 suggestion: first-load could show "Last synced X" in onboarding hint, not just header.

VERDICT: PASS (new-user)
