# Round 1 — Tester

Role: tester. Scope: Playwright e2e for chromium-atlas v1.0.

## 1. Playwright config skeleton

`playwright.config.ts` at repo root:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/_report" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 800 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

`package.json` script: `"preview": "vite preview"`. Tests run via `npm run test:e2e`.

## 2. Outcome → spec mapping

| Outcome | Spec file | Key assertions |
|---|---|---|
| OUT-1 | `tests/sidebar.spec.ts` | `[role=tree]` exists; `>=6` top-level nodes; click chevron toggles `aria-expanded`; reload preserves `localStorage['atlas:sidebar:expanded']`; current doc has `.is-active` + accent bar pseudo via computed style. |
| OUT-2 | `tests/views.spec.ts` | Click each segmented button, assert `data-view="title|list|gallery"` on container; reload restores per-folder mode from `localStorage['atlas:view:<path>']`; latency <100ms (see §3). |
| OUT-3 | `tests/palette.spec.ts` | `Meta+K` opens `[role=dialog]`; type "accessibility"; first `[role=option]` visible <50ms (see §4); `ArrowDown` moves `aria-selected`; `Enter` navigates URL hash; `Escape` closes. |
| OUT-4 | `tests/theme.spec.ts` | Toggle flips `<html data-theme>`; reload persists `localStorage['atlas:theme']`; new context with `colorScheme:'dark'` defaults to dark; no theme flash (assert `data-theme` set in `<head>` inline script before `body`). |
| OUT-5 | `tests/doc-detail.spec.ts` | Breadcrumb segments equal path parts; TOC `li` count == h2+h3 count; scroll into section → that TOC item gains `.is-active` within 200ms; back-links list contains every fixture linking in (assert via known fixture set); copy button writes code to clipboard (`navigator.clipboard.readText()` after `context.grantPermissions(['clipboard-read','clipboard-write'])`). |
| OUT-6 | `tests/router.spec.ts` | New context cold-loads `#/`, `#/folder/accessibility`, `#/doc/accessibility/overview.md`, `#/doc/missing.md`; assert `[data-route]` value and visible heading; 404 shows "Go home" link. |
| OUT-7 | `tests/responsive.spec.ts` | For widths [320,375,768,1024,1440]: `documentElement.scrollWidth <= width`; hamburger visible <=768; loop interactive elements, assert bbox >=44 at <=768. |

## 3. Performance assertion technique

Inside `page.evaluate`:

```ts
const t = await page.evaluate(async () => {
  performance.mark("a");
  document.querySelector('[data-view="gallery"]')!.dispatchEvent(new Event("click"));
  await new Promise(requestAnimationFrame);
  performance.mark("b");
  return performance.measure("x","a","b").duration;
});
```

For palette: dispatch keydown, then poll `requestAnimationFrame` until first `[role=option]` exists, capture `performance.now()` delta. Avoid `await page.click` as it includes Playwright's own overhead.

## 4. 50ms latency without flake

- Warm up: open palette and close once before measuring (JIT + Fuse index priming).
- Run 5 trials, take **median**. Assert median < 50ms (per OUT-3) AND p100 < 100ms.
- If env is noisy CI, allow `process.env.CI` to relax to `<100ms` with a comment; locally enforce 50ms.
- Record all 5 samples in test annotation for debugging.

## 5. Fixtures the suite needs

Under `test/fixtures/docs/` (>=50 files, >=6 top-level folders):
- `accessibility/overview.md` — h2+h3 headings (>=6) for TOC test; linked TO by `accessibility/aria.md`, `accessibility/screen-reader.md`, `design/principles.md` (predictable back-links count = 3).
- `build/cpp-sample.md` — contains \`\`\`cpp block with known content for clipboard test.
- `scripting/python-sample.md` — \`\`\`python block.
- `ops/shell-sample.md` — \`\`\`sh block.
- Folders: `accessibility/`, `build/`, `design/`, `scripting/`, `ops/`, `security/` (>=6).
- A doc with zero back-links (`misc/orphan.md`) for empty-state assertion.
- A folder with one doc only for view-mode edge case.

Generated deterministically by the scanner; checked into `test/fixtures/docs/` so determinism test (byte-identical scanner output) is feasible.

## 6. Flaky-test risks + mitigations

1. **Webfont load race** — Inter Variable async loads can shift TOC offsets and break scroll-spy timing. Mitigate: in `beforeEach`, `await page.evaluate(() => document.fonts.ready)` before any layout-sensitive assertion.
2. **Scroll-spy timing** — IntersectionObserver fires async; scrolling via `element.scrollIntoView` may settle 1–2 frames later. Mitigate: after scroll, `await expect(tocItem).toHaveClass(/is-active/, { timeout: 500 })` (Playwright auto-retry) instead of fixed `waitForTimeout`. Also disable smooth scroll in tests via `await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' })`.

Bonus: clipboard tests need `context.grantPermissions(['clipboard-read','clipboard-write'], { origin: baseURL })` — easy to forget; bake into a shared fixture.
