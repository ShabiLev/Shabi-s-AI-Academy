import { test, expect, login } from "../fixtures/academy";
test("desktop sidebar navigates", async ({ page }) => {
  await login(page);
  await page.getByRole("link", { name: "שיעורים" }).first().click();
  await expect(page).toHaveURL(/lessons/);
});
test("mobile drawer opens, closes and route selection dismisses it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await page.getByRole("button", { name: "פתיחת תפריט הניווט" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "פתיחת תפריט הניווט" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "שיעורים" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "בית" })).toBeVisible();
  await page.getByRole("button", { name: "בית" }).click();
  await expect(page.getByRole("button", { name: "בית" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "חזרה" })).toHaveCount(0);
});
test("Back safely returns to Dashboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "/lessons");
  await page.getByRole("button", { name: "חזרה" }).click();
  await expect(page).toHaveURL(/\/$/);
});
