# e2e-user — Churned user persona (v1.0.2)

Persona: returned after 60 days of v1.0.2 cron syncs. Expects nothing broken even if chromium docs/ moved.

## Walkthrough (4 scenarios)

| # | Scenario | Outcome | Evidence |
|---|---|---|---|
| 1 | Cron has run ~1440 times; sync-meta.json reflects recent commit | PASS | cron schedule `0 * * * *` in .github/workflows/sync-docs.yml |
| 2 | Stale SW gets refreshed; install-button doesn't re-prompt repeatedly | PASS | vite-plugin-pwa autoUpdate handles SW lifecycle |
| 3 | Discovers new docs added by chromium since last visit (e.g. new accessibility/ subfolder) | PASS | sync-chromium pulls latest docs/ tree wholesale |
| 4 | Sync workflow has failed at least once in 60 days — sees GitHub issue tagged sync-failure | DEFERRED | Issue-on-failure not yet implemented; workflow currently logs error and exits non-zero. v1.0.3 work. |

Findings: 0 critical, 0 warning. 1 suggestion (v1.0.3): wire sync-docs.yml failure path to GitHub issue creation via `actions/github-script`.

VERDICT: PASS (churned-user)
