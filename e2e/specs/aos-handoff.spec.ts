import { execSync } from "node:child_process";
import { test, expect, login } from "../fixtures/academy";
import { routeAosSnapshot } from "../fixtures/aosSnapshot";

test.beforeAll(() => {
  execSync("node scripts/generate-aos-snapshot.mjs", { stdio: "ignore" });
});

test.beforeEach(async ({ page }) => routeAosSnapshot(page));

test.describe("AOS handoffs", () => {
  test("shows the sanitized explicit handoff without fabricating or leaking paths", async ({ page }) => {
    await login(page, "/aos/handoffs");
    await expect(page.getByRole("heading", { level: 1, name: /מסירה פעילה|Active handoff/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toContainText(/inProgress|readyForReview/);
    await expect(page.getByRole("heading", { level: 2 })).not.toContainText(/\[object Object\]|[A-Z]:\\Users\\/);
  });

  test("explains the required handoff fields", async ({ page }) => {
    await login(page, "/aos/handoffs");
    await expect(page.getByText(/handoff-policy\.md/)).toBeVisible();
  });

  test("is reachable from the dashboard", async ({ page }) => {
    await login(page, "/aos");
    await page.locator("nav.aos-subnav").getByRole("link", { name: /מסירות|Handoffs/ }).click();
    await expect(page).toHaveURL(/\/aos\/handoffs/);
  });
});
