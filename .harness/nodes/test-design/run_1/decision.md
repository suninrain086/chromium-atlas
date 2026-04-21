# Test Design (v1.0.2 run_1)

## Strategy
Add a single new spec file `test/e2e/v102.spec.ts` covering 5 in-scope ACs.
Existing 26 v1.0.1 specs remain untouched as regression. New tests must be
hermetic: any write to `public/sync-meta.json` is done in `beforeAll` and
removed in `afterAll`.

## In-scope ACs (gate-test)
- AC-5: scan --source mock keeps fixture path
- AC-6: actionlint passes sync-docs.yml
- AC-7: actionlint passes deploy.yml
- AC-8: workflow YAML has schedule + workflow_dispatch + concurrency
- AC-9: sync-meta indicator render gating (3 cases: absent, fresh, stale)
- AC-10: README has sync badge + live URL placeholder
- AC-12: bundle budget script returns 0

## Out of scope (deferred to acceptance/audit/e2e)
- AC-1, AC-2, AC-3 require live network → acceptance node
- AC-4 requires real sync to count ≥500 docs → acceptance node
- AC-11 (regression count) is naturally satisfied by running full suite

## Tests planned

### Unit / static (node-level, run before playwright)
- T1 `scripts/sync-chromium.mjs` syntax-check via `node --check`
- T2 actionlint on both YAMLs (skip-if-not-installed; fall back to T3)
- T3 structural assertion: each YAML contains required top-level keys
  (`on.schedule.cron`, `on.workflow_dispatch`, `concurrency.group`)
- T4 README grep: `actions/workflows/sync-docs.yml/badge.svg` present
- T5 README grep: `Live site:` placeholder present
- T6 scan --source mock equivalence: invoke scanner with --source mock and
  separately with `DOCS_DIR=test/fixtures/docs`, compare docs.json byte-equal

### Playwright e2e (test/e2e/v102.spec.ts)
- E1 `sync-health hidden when sync-meta.json absent` — pre-test removes
  any `dist/sync-meta.json`; rebuilds; loads page; asserts
  `#sync-health[hidden]`.
- E2 `sync-health visible when meta is fresh` — pre-test writes
  `public/sync-meta.json` with `lastSyncedAt = now`, rebuilds, loads page;
  asserts `#sync-health` is visible AND text matches `/Synced .* (just now|minutes? ago|hours? ago)/`.
- E3 `sync-health hidden when meta is stale (48h)` — pre-test writes
  meta with `lastSyncedAt = now - 48h`, rebuilds, loads; asserts hidden.

E1/E2/E3 are mutually exclusive on disk. To avoid serialization complexity,
we'll combine them into ONE spec file using `test.describe.serial` and
shared `beforeAll/afterAll` hooks that clean `public/sync-meta.json`.

Alternative: use a single Playwright test that programmatically rewrites
the served file via a route interceptor (`page.route('**/sync-meta.json', ...)`).
This is cleaner — no rebuild, no FS state — and that's the path we'll take.

### Final spec design (route-interceptor approach)
```ts
test('sync-health hidden when meta missing', async ({ page }) => {
  await page.route('**/sync-meta.json', r => r.fulfill({ status: 404 }));
  await page.goto('/');
  await expect(page.locator('#sync-health')).toBeHidden();
});

test('sync-health visible when meta fresh', async ({ page }) => {
  await page.route('**/sync-meta.json', r => r.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      lastSyncedAt: new Date().toISOString(),
      sourceRef: 'main', sha: 'abc123def456', docCount: 600, syncDurationMs: 1500
    }),
  }));
  await page.goto('/');
  const el = page.locator('#sync-health');
  await expect(el).toBeVisible();
  await expect(el).toHaveText(/Synced .*(just now|minutes? ago|hours? ago|days? ago)/);
});

test('sync-health hidden when meta stale', async ({ page }) => {
  const stale = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  await page.route('**/sync-meta.json', r => r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ lastSyncedAt: stale, sourceRef: 'main', sha: 'x', docCount: 1, syncDurationMs: 1 }),
  }));
  await page.goto('/');
  await expect(page.locator('#sync-health')).toBeHidden();
});
```

Plus 4 static-assertion tests (T3, T4, T5, T6 above) implemented as
Playwright `test()` blocks that read files via `node:fs` (sync), keeping
them in the same `npm test` run.

## Coverage matrix

| AC | Test | Type |
|---|---|---|
| AC-5 | T6 (scan --source mock equivalence) | static |
| AC-6 | T2 actionlint sync-docs.yml + T3 structural | static |
| AC-7 | T2 actionlint deploy.yml + T3 structural | static |
| AC-8 | T3 (cron+dispatch+concurrency keys) | static |
| AC-9 | E1+E2+E3 (3 indicator gating cases) | playwright |
| AC-10 | T4+T5 (README grep) | static |
| AC-11 | full suite count ≥ 26 + 7 = 33 | regression |
| AC-12 | T-budget (existing check-budget.mjs) | build-time |

## Falsifiability checks
- Indicator visible with absent meta → bug
- Indicator visible with stale meta → age gate broken
- Workflow lacks `concurrency:` → AC-8 fail
- README missing badge → AC-10 fail
- Bundle main > 30 KB gz → AC-12 fail (build aborts)

## Verdict: PASS
Tests fully defined. Will be executed in test-execute node.
