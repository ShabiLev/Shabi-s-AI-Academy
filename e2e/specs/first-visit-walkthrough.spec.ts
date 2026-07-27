import { expect, test } from "../fixtures/academy";
import type { Page } from "@playwright/test";

const walkthroughKey = "shabis-ai-academy:walkthrough:v1:playwright-default";

async function completeOnboarding(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start as Guest" }).click();
  for (let step = 0; step < 4; step += 1) {
    await page.getByRole("button", { name: "Next" }).click();
  }
  await page.getByRole("button", { name: "Open Dashboard" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem("shabis-ai-academy-language", "en");
    if (!sessionStorage.getItem("walkthrough-fresh-fixture")) {
      localStorage.removeItem(key);
      sessionStorage.setItem("walkthrough-fresh-fixture", "true");
    }
  }, walkthroughKey);
});

test("first visit starts after onboarding, resumes, completes once, and restarts from Help", async ({ page }) => {
  await completeOnboarding(page);
  const dialog = page.getByRole("dialog", { name: "Welcome to the Academy" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await dialog.getByRole("button", { name: "Start tour" }).click();
  await expect(page.getByRole("heading", { name: "Main navigation" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Beginner and Advanced modes" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Beginner and Advanced modes" })).toBeVisible();
  while (await page.getByRole("button", { name: "Next" }).count()) {
    await page.getByRole("button", { name: "Next" }).click();
  }
  await page.getByRole("button", { name: "Finish" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto("/help");
  await page.getByRole("button", { name: /Academy first-visit tour.*Completed.*Restart/ }).click();
  await expect(page.getByRole("heading", { name: "Welcome to the Academy" })).toBeVisible();
});

test("Not now suppresses automatic start and Settings can reset only walkthrough state", async ({ page }) => {
  await completeOnboarding(page);
  await page.getByRole("button", { name: "Not now" }).click();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/settings");
  await expect(page.getByText("Current status: Dismissed", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reset walkthrough state" }).click();
  await expect(page.getByRole("status")).toContainText("Only walkthrough state was reset.");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});

test("mobile tour opens navigation and keeps the highlighted target in view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await completeOnboarding(page);
  await page.getByRole("button", { name: "Start tour" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".mobile-drawer")).toBeVisible();
  await expect(page.locator('[data-walkthrough="experience-mode"]:visible')).toBeVisible();
  await expect(page.locator(".tour-spotlight")).toBeVisible();
});
