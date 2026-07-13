import { test, expect, login, english, noOverflow } from "../fixtures/academy";
import type { Page } from "@playwright/test";

async function openDesktopProfile(page: Page) {
  await page.locator(".desktop-sidebar .profile-trigger").click();
  return page.getByRole("menu");
}

test.describe("profile menu desktop", () => {
  for (const mode of ["he", "en"] as const) {
    test(`${mode} uses logical anchoring and a viewport-safe portal`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await login(page);
      if (mode === "en") await english(page);
      await page.goto("/");
      const trigger = page.locator(".desktop-sidebar .profile-trigger");
      const menu = await openDesktopProfile(page);
      await expect(menu).toBeVisible();
      await expect(page.locator("[data-profile-layer='portal']")).toHaveCount(1);
      const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
      expect(triggerBox).not.toBeNull();
      expect(menuBox).not.toBeNull();
      if (mode === "he") expect(Math.abs((triggerBox!.x + triggerBox!.width) - (menuBox!.x + menuBox!.width))).toBeLessThanOrEqual(1);
      else expect(Math.abs(triggerBox!.x - menuBox!.x)).toBeLessThanOrEqual(1);
      expect(menuBox!.x).toBeGreaterThanOrEqual(0);
      expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(1440);
      await noOverflow(page);
    });
  }

  test("focus, Escape, outside activation, and scroll remain predictable", async ({ page }) => {
    await login(page);
    const trigger = page.locator(".desktop-sidebar .profile-trigger");
    let menu = await openDesktopProfile(page);
    await expect(menu.getByRole("menuitem").first()).toBeFocused();
    const before = await menu.boundingBox();
    await page.locator(".desktop-sidebar .main-nav").evaluate((node) => { node.scrollTop = node.scrollHeight; });
    const after = await menu.boundingBox();
    expect(after?.y).toBe(before?.y);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    menu = await openDesktopProfile(page);
    const url = page.url();
    await page.locator(".profile-backdrop").click({ position: { x: 500, y: 500 } });
    await expect(menu).toBeHidden();
    expect(page.url()).toBe(url);
  });

  test("long labels wrap without clipping", async ({ page }) => {
    await login(page);
    const menu = await openDesktopProfile(page);
    await menu.locator(".profile-summary strong").evaluate((node) => { node.textContent = "A very long profile label that must wrap safely without horizontal clipping"; });
    const summary = menu.locator(".profile-summary");
    expect(await summary.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await noOverflow(page);
  });
});

test.describe("profile menu mobile", () => {
  for (const mode of ["he", "en"] as const) {
    test(`${mode} uses a full-width sheet at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await login(page);
      if (mode === "en") await english(page);
      await page.goto("/");
      await page.locator(".menu-button").click();
      await page.locator(".mobile-drawer .profile-trigger").click();
      const sheet = page.getByRole("menu");
      await expect(sheet).toHaveClass(/profile-sheet/);
      const box = await sheet.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBe(0);
      expect(box!.width).toBe(320);
      expect(Math.abs(box!.y + box!.height - 568)).toBeLessThanOrEqual(1);
      await noOverflow(page);
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator(".mobile-drawer .profile-trigger")).toBeFocused();
    });
  }
});
