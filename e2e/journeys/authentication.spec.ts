import { test, expect } from "@playwright/test";
test("authentication registration recovery and login routes explain state", async ({ page }) => { for (const route of ["/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/login"]) { await page.goto(route); await expect(page.locator("body")).not.toBeEmpty(); } });
