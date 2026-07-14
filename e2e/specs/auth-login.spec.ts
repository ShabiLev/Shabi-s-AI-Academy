import { test, expect, login } from "../fixtures/academy";

test("guest login preserves the requested route", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));
  await page.goto("/auth/login?from=/lessons");
  await page.getByRole("button", { name: "Continue as Guest" }).click();
  await expect(page).toHaveURL(/\/lessons$/);
});

test("guest session restores without a protected-route login flash", async ({ page }) => {
  await login(page, "/dashboard");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /כניסה|Sign in/ })).toHaveCount(0);
});

test("sign out preserves unrelated local work", async ({ page }) => {
  await login(page, "/dashboard");
  await page.evaluate(() => localStorage.setItem("academy-test-work", "preserve-me"));
  await page.locator(".profile-trigger").click();
  await page.getByRole("menuitem", { name: /התנתקות|Sign out/ }).click();
  expect(await page.evaluate(() => localStorage.getItem("academy-test-work"))).toBe("preserve-me");
});
