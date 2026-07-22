import { test, expect, noOverflow } from "../fixtures/academy";
import type { Page } from "@playwright/test";

const english = (page: Page) =>
  page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));

test("new visitor completes personalized guest onboarding", async ({ page }) => {
  await english(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Learn AI through guided practice" })).toBeVisible();
  await page.getByRole("button", { name: "Start as Guest" }).click();
  await expect(page.getByText("Step 1 of 7")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Build an agent").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Advanced").check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("QA and testing").check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Recommended starting path" })).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Continue as Guest" }).click();
  await page.getByRole("button", { name: "Open my Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/settings");
  await expect(page.getByRole("radio", { name: "Advanced Mode" })).toHaveAttribute("aria-checked", "true");
});

test("onboarding fits a 320px Hebrew viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await page.getByRole("button", { name: "התחלה כאורח" }).click();
  await noOverflow(page);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});
