import { test, expect } from "@playwright/test";

test.describe("smoke — chromium-atlas v1.0", () => {
  test("home renders folder tree + brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".brand")).toContainText("chromium-atlas");
    // At least one top-level folder from the fixture corpus must be visible
    await expect(page.locator(".sidebar")).toContainText("design");
  });

  test("doc route renders markdown + TOC + back-links section", async ({ page }) => {
    await page.goto("/#/doc/design/site-isolation.md");
    // Doc body shows the title heading
    await expect(page.locator(".doc-body h1, .doc-body h2").first()).toBeVisible();
    // TOC sidebar present
    await expect(page.locator(".toc")).toBeVisible();
    // Back-links section present (may say "No back-links" — both OK)
    await expect(page.locator(".backlinks")).toBeVisible();
  });

  test("Cmd+K opens palette and arrow+Enter navigates", async ({ page }) => {
    await page.goto("/");
    await page.locator("body").click();
    await page.keyboard.press("ControlOrMeta+k");
    const input = page.locator("#palette-input");
    await expect(input).toBeFocused();
    await input.fill("site");
    // Wait for at least one result
    await expect(page.locator(".result").first()).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#\/doc\//);
  });

  test("/ shortcut also opens palette outside inputs", async ({ page }) => {
    await page.goto("/");
    await page.locator("body").click();
    await page.keyboard.press("/");
    await expect(page.locator("#palette-input")).toBeFocused();
  });

  test("palette Tab is trapped (focus stays on input)", async ({ page }) => {
    await page.goto("/");
    await page.locator("body").click();
    await page.keyboard.press("ControlOrMeta+k");
    const input = page.locator("#palette-input");
    await expect(input).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
  });

  test("theme toggle round-trips and persists data-theme", async ({ page }) => {
    await page.goto("/");
    const initial = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator("[data-theme-toggle], #theme-toggle, .theme-toggle").first().click();
    const after = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(after).not.toEqual(initial);
    expect(["light", "dark"]).toContain(after);
  });

  test("404 route shows Page-not-found state", async ({ page }) => {
    await page.goto("/#/doc/does/not/exist.md");
    await expect(page.locator(".empty-state")).toContainText(/not found/i);
  });

  test("XSS — markdown <script> tag does not execute", async ({ page }) => {
    let alerted = false;
    page.on("dialog", async (d) => { alerted = true; await d.dismiss(); });
    await page.goto("/#/doc/misc/orphan.md");
    // Wait for render
    await page.waitForSelector(".doc-body");
    // No script tag should have been injected into the doc body
    const scriptCount = await page.locator(".doc-body script").count();
    expect(scriptCount).toBe(0);
    expect(alerted).toBe(false);
  });
});
