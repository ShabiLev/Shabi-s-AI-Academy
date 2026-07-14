import { test, expect, login } from "../fixtures/academy";

test("beginner and advanced modes progressively disclose navigation", async ({ page }) => {
  await login(page, "/settings");
  await page.getByRole("radio", { name: /English/ }).click();
  await expect(page.getByRole("link", { name: "QA Center" })).toHaveCount(0);
  await page.getByRole("radio", { name: /Advanced Mode/ }).click();
  await page.locator(".main-nav summary").filter({ hasText: "More" }).click();
  await expect(page.getByRole("link", { name: "QA Center" })).toBeVisible();
});

test("breadcrumbs return to the parent collection", async ({ page }) => {
  await login(page, "/agents/new");
  const parent = page.locator(".breadcrumbs").getByRole("link", { name: /My Agents|הסוכנים שלי/ });
  await parent.click();
  await expect(page).toHaveURL(/\/agents$/);
});

test("guided tour completes with keyboard-operable controls", async ({ page }) => {
  await login(page, "/dashboard");
  await page.getByRole("button", { name: /Guided tour|סיור מודרך/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  while (await dialog.getByRole("button", { name: /Next|הבא/ }).count()) {
    await dialog.getByRole("button", { name: /Next|הבא/ }).click();
  }
  await dialog.getByRole("button", { name: /Finish|סיום/ }).click();
  await expect(dialog).toHaveCount(0);
});
