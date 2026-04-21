// Persona harness helpers. Use these via Playwright's `page` object.
import type { Page } from "@playwright/test";

export async function waitForRoute(page: Page, hashStartsWith: string, timeoutMs = 5000): Promise<void> {
  await page.waitForFunction(
    (prefix) => location.hash.startsWith(prefix),
    hashStartsWith,
    { timeout: timeoutMs }
  );
}

export async function waitForPaletteOpen(page: Page, timeoutMs = 3000): Promise<void> {
  await page.waitForSelector(".palette-overlay #palette-input", { state: "visible", timeout: timeoutMs });
}

export async function waitForRender(page: Page, selector: string, timeoutMs = 5000): Promise<void> {
  await page.waitForSelector(selector, { state: "attached", timeout: timeoutMs });
}

/**
 * Seed localStorage BEFORE first page.goto via addInitScript. Must be called
 * before the first navigation so that the values are available at boot time.
 */
export async function seedLocalStorage(page: Page, kv: Record<string, string>): Promise<void> {
  await page.addInitScript((entries) => {
    try {
      for (const [k, v] of entries) localStorage.setItem(k, v);
    } catch { /* ignore quota / private browsing */ }
  }, Object.entries(kv));
}
