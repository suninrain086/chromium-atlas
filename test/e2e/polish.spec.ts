import { test, expect } from "@playwright/test";

test.describe("polish — chromium-atlas v1.0 (acceptance fixes)", () => {
  test("onboarding hint appears on first visit and dismisses + persists", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/");
    // First-visit: hint visible
    const hint = page.locator("[data-onboarding]");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(/⌘K|Cmd|search/i);
    // Dismiss
    await page.locator("[data-onboarding] .dismiss").click();
    await expect(page.locator("[data-onboarding]")).toHaveCount(0);
    // Persistence: reload — hint stays gone
    await page.reload();
    await page.waitForSelector(".sidebar");
    await expect(page.locator("[data-onboarding]")).toHaveCount(0);
    await ctx.close();
  });

  test("view-mode switch toggles .swapping class (80ms fade)", async ({ page }) => {
    await page.goto("/#/folder/design");
    await page.waitForSelector(".view-mode-toggle");
    // Start in some mode, click a *different* mode button.
    const buttons = page.locator(".view-mode-toggle button[data-mode]");
    const current = await page.locator(".main-inner").getAttribute("data-mode");
    const targetBtn = buttons.locator(`:not([data-mode="${current}"])`).first();
    // Listen for the swapping class flip
    const observed = page.evaluate(() => new Promise<boolean>((resolve) => {
      const target = document.querySelector(".folder-content");
      if (!target) return resolve(false);
      const mo = new MutationObserver(() => {
        if (target.classList.contains("swapping")) {
          mo.disconnect();
          resolve(true);
        }
      });
      mo.observe(target, { attributes: true, attributeFilter: ["class"] });
      setTimeout(() => { mo.disconnect(); resolve(false); }, 1000);
    }));
    await targetBtn.click();
    expect(await observed).toBe(true);
  });
});
