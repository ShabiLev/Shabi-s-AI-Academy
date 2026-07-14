import { test, expect, login } from "../fixtures/academy";

test.describe("AOS handoffs", () => {
  test("shows no active handoff by default, honestly, not a fabricated one", async ({ page }) => {
    await login(page, "/aos/handoffs");
    await expect(page.getByRole("heading", { name: /מסירה פעילה|Active handoff/ })).toBeVisible();
    await expect(page.getByText(/אין מסירה פעילה כרגע|No handoff is currently active/)).toBeVisible();
  });

  test("explains the required handoff fields", async ({ page }) => {
    await login(page, "/aos/handoffs");
    await expect(page.getByText(/handoff-policy\.md/)).toBeVisible();
  });

  test("is reachable from the dashboard", async ({ page }) => {
    await login(page, "/aos");
    await page.getByRole("link", { name: /מסירות|Handoffs/ }).click();
    await expect(page).toHaveURL(/\/aos\/handoffs/);
  });
});
