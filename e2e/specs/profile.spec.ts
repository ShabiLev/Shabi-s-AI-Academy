import { test, expect, login } from "../fixtures/academy";

test("guest profile edits persist locally", async ({ page }) => {
  await login(page, "/profile");
  await page.getByLabel("שם פרטי").fill("שבי בדיקה");
  await page.getByLabel("מטרות למידה").fill("בניית סוכן בטוח");
  await page.getByRole("button", { name: "שמירה מקומית" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("שם פרטי")).toHaveValue("שבי בדיקה");
});

test("profile language and experience preferences apply immediately", async ({ page }) => {
  await login(page, "/profile");
  await page.getByLabel("שפה מועדפת").selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByLabel("Advanced").check();
  await expect(page.getByText("Advanced Mode.")).toHaveCount(0);
});
