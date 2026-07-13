import { test, expect, login } from "../fixtures/academy";
test("redirects, logs in, preserves route and session", async ({ page }) => {
  await page.goto("/lessons");
  await expect(page.getByRole("heading", { name: "כניסה" })).toBeVisible();
  await page.getByRole("button", { name: "כניסה למצב הדגמה" }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "שיעורים" })).toBeVisible();
});
test("authenticated login redirects and sign out returns to Login", async ({
  page,
}) => {
  await login(page);
  await page.goto("/login");
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("button", { name: "פתיחת תפריט הפרופיל" }).click();
  await page.getByRole("menuitem", { name: "התנתקות" }).click();
  await expect(page.getByRole("heading", { name: "כניסה" })).toBeVisible();
});
