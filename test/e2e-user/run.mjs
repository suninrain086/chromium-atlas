// Standalone Playwright runner for e2e-user persona scenarios.
// Run with: node test/e2e-user/run.mjs
// Captures evidence (text + screenshots) into .harness/nodes/e2e-user/run_1/
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE || "http://127.0.0.1:4181";
const OUT = ".harness/nodes/e2e-user/run_1";
mkdirSync(OUT, { recursive: true });

const log = [];
function step(persona, name, status, detail = "") {
  const line = `[${persona}] ${status === "PASS" ? "✓" : "✗"} ${name}${detail ? "  — " + detail : ""}`;
  console.log(line);
  log.push(line);
}

const browser = await chromium.launch();

// ── PERSONA 1: new-user ─────────────────────────────────────────
{
  const persona = "new-user";
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  // Cold-load home, expect onboarding hint
  await page.goto(BASE);
  await page.waitForSelector(".sidebar");
  const hintVisible = await page.locator("[data-onboarding]").isVisible();
  step(persona, "Onboarding hint visible on first visit", hintVisible ? "PASS" : "FAIL");

  // Try the keyboard hint — press / and search for "sandbox"
  await page.locator("body").click();
  await page.keyboard.press("/");
  await page.waitForSelector("#palette-input:focus");
  await page.keyboard.type("sandbox");
  await page.waitForTimeout(180);
  const resultsCount = await page.locator(".result").count();
  step(persona, "/ shortcut + type yields results", resultsCount > 0 ? "PASS" : "FAIL", `${resultsCount} results`);

  // Select first result then Enter
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForURL(/#\/doc\//, { timeout: 5000 });
  const docVisible = await page.locator(".doc-body").isVisible();
  step(persona, "Enter navigates to doc", docVisible ? "PASS" : "FAIL");
  await page.screenshot({ path: join(OUT, "new-user-01-doc.png"), fullPage: false });

  // Dismiss onboarding, reload — gone
  await page.goto(BASE);
  await page.waitForSelector("[data-onboarding]");
  await page.locator("[data-onboarding] .dismiss").click();
  await page.reload();
  await page.waitForSelector(".sidebar");
  const stillGone = await page.locator("[data-onboarding]").count();
  step(persona, "Onboarding dismissal persists", stillGone === 0 ? "PASS" : "FAIL");

  await ctx.close();
}

// ── PERSONA 2: active-user ─────────────────────────────────────
{
  const persona = "active-user";
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  // Warm: pretend they've onboarded; theme set to dark.
  // Pattern: navigate first, set localStorage, reload — addInitScript can race on
  // some Playwright versions; this is rock-solid.
  await page.goto(BASE);
  await page.waitForSelector(".sidebar");
  await page.evaluate(() => {
    localStorage.setItem("atlas:onboarded", "1");
    localStorage.setItem("atlas:theme", "dark");
  });
  await page.reload();
  await page.waitForSelector(".sidebar");
  const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme);
  step(persona, "Persisted dark theme applied", themeAttr === "dark" ? "PASS" : "FAIL", `data-theme=${themeAttr}`);

  // Use Cmd+K, search, navigate
  await page.keyboard.press("ControlOrMeta+k");
  await page.waitForSelector("#palette-input:focus");
  await page.fill("#palette-input", "design");
  await page.waitForTimeout(120);
  const resultCount = await page.locator(".result").count();
  step(persona, "Cmd+K + 'design' returns results", resultCount > 0 ? "PASS" : "FAIL", `${resultCount} results`);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForURL(/#\/doc\//);
  await page.waitForSelector(".doc-body");

  // TOC + scroll-spy (some docs have no h2/h3 — try a doc known to have headings)
  let tocCount = await page.locator(".toc a[data-toc-id]").count();
  if (tocCount === 0) {
    // Fall back: navigate to a doc that definitely has headings (sandbox.md is rich)
    await page.goto(BASE + "/#/doc/design/sandbox.md");
    await page.waitForSelector(".doc-body");
    tocCount = await page.locator(".toc a[data-toc-id]").count();
  }
  step(persona, "TOC populated for a real doc", tocCount > 0 ? "PASS" : "FAIL", `${tocCount} entries`);

  // Switch view modes on a folder
  await page.goto(BASE + "/#/folder/design");
  await page.waitForSelector(".view-mode-toggle");
  const modes = ["title-list", "list", "gallery"];
  let allModesOk = true;
  for (const m of modes) {
    await page.locator(`.view-mode-toggle button[data-mode="${m}"]`).click();
    await page.waitForTimeout(120);
    const dataMode = await page.locator(".main-inner").getAttribute("data-mode");
    if (dataMode !== m) allModesOk = false;
  }
  step(persona, "All 3 view modes activate", allModesOk ? "PASS" : "FAIL");

  // Switch latency from window.__lastViewSwitchMs
  const lastMs = await page.evaluate(() => (window).__lastViewSwitchMs);
  step(persona, "View-switch latency <100ms", lastMs < 100 ? "PASS" : "FAIL", `${Math.round(lastMs)}ms`);

  // Theme toggle round-trip
  await page.locator("[data-theme-toggle], .theme-toggle, #theme-toggle").first().click();
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  step(persona, "Theme toggle flips", after === "light" ? "PASS" : "FAIL", `now=${after}`);

  await page.screenshot({ path: join(OUT, "active-user-01-folder.png"), fullPage: false });
  await ctx.close();
}

// ── PERSONA 3: churned-user ─────────────────────────────────────
{
  // Returning user with stale localStorage from a previous session.
  // Simulates someone who used the app weeks ago.
  const persona = "churned-user";
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  // Same pattern as active-user: navigate, set storage, reload.
  await page.goto(BASE);
  await page.waitForSelector(".sidebar");
  await page.evaluate(() => {
    localStorage.setItem("atlas:onboarded", "1");
    localStorage.setItem("atlas:theme", "light");
    localStorage.setItem("atlas:viewmode", JSON.stringify({ design: "gallery", "ui/views": "list" }));
    localStorage.setItem("atlas:sidebar:expanded", JSON.stringify(["design", "ui"]));
  });

  // Cold-load a deep link they had bookmarked
  await page.goto(BASE + "/#/doc/design/sandbox.md");
  await page.waitForSelector(".doc-body");
  const docTitle = await page.title();
  step(persona, "Deep link cold-loads from bookmark", docTitle.includes("sandbox") ? "PASS" : "FAIL", docTitle);

  // Their previous folder modes are restored
  await page.goto(BASE + "/#/folder/design");
  await page.waitForSelector(".main-inner");
  const restoredMode = await page.locator(".main-inner").getAttribute("data-mode");
  step(persona, "Per-folder view mode restored (design=gallery)", restoredMode === "gallery" ? "PASS" : "FAIL", `mode=${restoredMode}`);

  // Sidebar expansion restored — design folder should be expanded
  const designExpanded = await page.locator('.sidebar [data-path="design"]').getAttribute("aria-expanded");
  step(persona, "Sidebar expansion state restored", designExpanded === "true" ? "PASS" : "FAIL", `aria-expanded=${designExpanded}`);

  // 404 on a stale link
  await page.goto(BASE + "/#/doc/old/removed-doc.md");
  await page.waitForSelector(".empty-state");
  const has404 = await page.locator(".empty-state").textContent();
  step(persona, "Stale bookmark shows 404 (not blank)", /not found/i.test(has404 || "") ? "PASS" : "FAIL");

  await page.screenshot({ path: join(OUT, "churned-user-01-404.png"), fullPage: false });
  await ctx.close();
}

await browser.close();

// Write evidence transcript
const passCount = log.filter(l => l.includes("✓")).length;
const failCount = log.filter(l => l.includes("✗")).length;
const summary = `e2e-user persona scenarios — ${passCount} pass / ${failCount} fail\n` +
  `Personas: new-user (4), active-user (6), churned-user (4) = 14 scenarios total\n\n` +
  log.join("\n") + "\n";
writeFileSync(join(OUT, "transcript.txt"), summary);
console.log("\n" + summary);
process.exit(failCount === 0 ? 0 : 1);
