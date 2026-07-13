import { test, expect, english, login } from "../fixtures/academy";

test("Analytics remains local, can be cleared, and survives refresh", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/search?q=quality");
  await page.goto("/analytics");
  await expect(page.getByRole("heading", { name: "Usage analytics" })).toBeVisible();
  await expect(page.getByText(/Browser-local analytics/)).toBeVisible();
  await expect(page.getByText("Route viewed", { exact: true })).toBeVisible();
  await page.getByLabel("From date").fill("2099-01-01");
  await expect(page.getByText("No events in the selected range.")).toBeVisible();
  await page.getByRole("button", { name: "Clear date range" }).click();
  await expect(page.getByText("Route viewed", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Usage analytics" })).toBeVisible();
  await page.getByRole("button", { name: "Clear analytics" }).click();
  await expect(page.getByText("No events in the selected range.")).toBeVisible();
});

test("Workflow completion creates an actionable local notification", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/workflows");
  await page.getByRole("button", { name: "Prompt Review Pipeline" }).click();
  await page.getByRole("button", { name: "Mock Run" }).click();
  await page.getByRole("button", { name: /Notifications, 1 unread/ }).click();
  await expect(page.getByRole("heading", { name: "Local notifications" })).toBeVisible();
  await expect(page.getByText("Workflow run completed")).toBeVisible();
  await page.getByRole("button", { name: "Mark all read" }).click();
  await expect(page.getByRole("button", { name: /Notifications, 0 unread/ })).toBeVisible();
});
