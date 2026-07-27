import { test, expect, login } from "../fixtures/academy";

test("beginner and advanced modes progressively disclose navigation", async ({ page }) => {
  await login(page, "/settings");
  await page.getByRole("radio", { name: /English/ }).click();
  await expect(page.getByRole("link", { name: "QA Center" })).toHaveCount(0);
  await page.getByRole("radio", { name: /Advanced Mode/ }).click();
  await expect(page.getByRole("link", { name: "QA Center" })).toBeVisible();
});

test("breadcrumbs return to the parent collection", async ({ page }) => {
  await login(page, "/agents/new");
  const parent = page.locator(".breadcrumbs").getByRole("link", { name: /My Agents|הסוכנים שלי/ });
  await parent.click();
  await expect(page).toHaveURL(/\/agents$/);
});

test("module pages do not render walkthrough banners or local tour CTAs", async ({ page }) => {
  await login(page, "/lessons");
  await expect(page.locator(".guidance-hint")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Guided tour|סיור מודרך/ })).toHaveCount(0);
  await page.goto("/prompts");
  await expect(page.locator(".guidance-hint")).toHaveCount(0);
});
