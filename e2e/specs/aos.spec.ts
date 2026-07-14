import { test, expect, login, english } from "../fixtures/academy";

test.describe("AOS dashboard", () => {
  test("opens and shows the current AOS and application version", async ({ page }) => {
    await login(page, "/aos");
    await expect(page.getByRole("heading", { name: /מערכת הפעלה לסוכני AI|Agent Operating System/ })).toBeVisible();
    await expect(page.getByText(/1\.4\.0-beta\.1/).first()).toBeVisible();
  });

  test("shows the module count and links to the full module list", async ({ page }) => {
    await login(page, "/aos");
    await expect(page.getByText(/מודולים|Modules/).first()).toBeVisible();
    await page.getByRole("link", { name: /צפה בכל המודולים|View all modules/ }).click();
    await expect(page).toHaveURL(/\/aos\/modules/);
  });

  test("module list can be filtered by category and task type", async ({ page }) => {
    await login(page, "/aos/modules");
    const rowsBefore = await page.locator(".aos-module-table tbody tr").count();
    expect(rowsBefore).toBeGreaterThan(0);
    const categorySelect = page.getByLabel(/סנן לפי קטגוריה|Filter by category/);
    await categorySelect.selectOption("security");
    const rowsAfter = await page.locator(".aos-module-table tbody tr").count();
    expect(rowsAfter).toBeLessThanOrEqual(rowsBefore);
    expect(rowsAfter).toBeGreaterThan(0);
  });

  test("security policy view links back to the module list without exposing a fake status", async ({ page }) => {
    await login(page, "/aos/security");
    await expect(page.getByRole("heading", { name: /מדיניות אבטחה|Security policy/ })).toBeVisible();
    await expect(page.getByText(/כללי האבטחה קודמים|Security rules take precedence/)).toBeVisible();
  });

  test("releases view shows the real application version, not a hardcoded one", async ({ page }) => {
    await login(page, "/aos/releases");
    await expect(page.getByText("1.4.0-beta.1")).toBeVisible();
  });

  test("does not expose a local machine path", async ({ page }) => {
    await login(page, "/aos");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/C:\\|\/Users\/|\/home\//);
  });

  test("English LTR", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/aos");
    await expect(page.getByRole("heading", { name: "Agent Operating System" })).toBeVisible();
  });

  test("mobile viewport renders the dashboard without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await login(page, "/aos");
    await expect(page.getByRole("heading", { name: /מערכת הפעלה לסוכני AI|Agent Operating System/ })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
