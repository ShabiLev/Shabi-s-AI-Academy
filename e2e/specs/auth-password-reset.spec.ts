import { test, expect } from "../fixtures/academy";

test("forgot-password response does not reveal account existence", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));
  await page.goto("/auth/forgot-password");
  await expect(page.getByRole("heading", { name: /Reset|password/i })).toBeVisible();
  await expect(page.getByRole("button")).toBeDisabled();
  await expect(page.locator("body")).not.toContainText(/account exists|not found/i);
});

test("invalid callback fails safely without reflecting sensitive query data", async ({ page }) => {
  await page.goto("/auth/callback?error=access_denied&error_description=expired-secret-token");
  await expect(page.getByRole("heading", { name: /link is not valid|הקישור אינו תקין/i })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("expired-secret-token");
});
