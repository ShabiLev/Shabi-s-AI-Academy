import { expect, type Page } from "@playwright/test";

export async function enterGuest(page: Page, path = "/dashboard") {
  await page.goto(path);
  const button = page.getByRole("button", { name: /Demo Login|כניסה למצב הדגמה/ });
  if (await button.isVisible().catch(() => false)) await button.click();
  await expect(page.locator("body")).not.toBeEmpty();
}

export async function visitJourney(page: Page, routes: string[]) {
  await enterGuest(page);
  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", /rtl|ltr/);
  }
}
