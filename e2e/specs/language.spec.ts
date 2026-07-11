import { test, expect, login, english } from "../fixtures/academy";
test("Hebrew defaults to RTL with no header language control", async ({
  page,
}) => {
  await login(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "he");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("group", { name: "בחירת שפה" })).toHaveCount(0);
});
test("English persists and changes profile name and direction", async ({
  page,
}) => {
  await login(page);
  await english(page);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await expect(page.getByText("Shabi", { exact: true }).first()).toBeVisible();
});
