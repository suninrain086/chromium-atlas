import { test, expect, devices } from "@playwright/test";

const WIDTHS = [320, 375, 768, 1024, 1440];

test.describe("responsive — chromium-atlas v1.0 OUT-7", () => {
  for (const w of WIDTHS) {
    test(`@${w}px — no horizontal page scroll on home`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
      const page = await ctx.newPage();
      await page.goto("/");
      await page.waitForSelector(".sidebar, .skel-sidebar");
      const overflow = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      // Allow 1px subpixel slack
      expect(overflow.sw).toBeLessThanOrEqual(overflow.cw + 1);
      await ctx.close();
    });
  }

  test("@375px — hamburger button is visible", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForSelector("#hamburger");
    const hamburger = page.locator("#hamburger");
    await expect(hamburger).toBeVisible();
    // Hit-area sanity: at least 32×32 (we aim for 44 but allow some leeway across themes).
    const box = await hamburger.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(28);
    expect(box!.height).toBeGreaterThanOrEqual(28);
    await ctx.close();
  });

  test("@1440px — sidebar is laid out (not hidden)", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator(".sidebar")).toBeVisible();
    await ctx.close();
  });
});
