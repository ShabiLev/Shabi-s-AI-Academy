import { expect, test } from "../fixtures/academy";
import type { Page } from "@playwright/test";

const walkthroughKey = "shabis-ai-academy:walkthrough:v1:playwright-default";

async function completeOnboarding(page: Page) {
  await page.goto("/");
  await page.locator(".landing-actions .button-primary").click();
  await expect(page).toHaveURL(/\/onboarding$/);
  for (let step = 0; step < 4; step += 1) {
    await page.locator(".onboarding-actions .primary-button").click();
  }
  await page.locator(".onboarding-actions .primary-button").click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function completeWalkthrough(page: Page) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const start = dialog.locator(".button-primary");
  await expect(start).toBeEnabled();
  await start.click();
  for (let step = 1; step < 7; step += 1) {
    await expect(dialog.locator(".button-primary")).toBeEnabled();
    await dialog.locator(".button-primary").click();
  }
  await expect(dialog.locator(".button-primary")).toHaveText(/Got it|הבנתי/);
  await dialog.locator(".button-primary").click();
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

test("English first visit completes only through Got it and reveals replay", async ({ page }) => {
  await completeOnboarding(page);
  const dialog = page.getByRole("dialog", { name: "Welcome to the Academy" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(page.locator(".app-shell")).toHaveAttribute("inert", "");
  await expect(page.locator('[data-walkthrough="replay"]')).toHaveCount(0);
  await completeWalkthrough(page);
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Replay WALK ME" }).first()).toBeVisible();
  const record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), walkthroughKey);
  expect(record.status).toBe("completed");
  expect(record.completedAt).toBeTruthy();
});

test("Hebrew first visit is RTL and finishes with הבנתי", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "he"));
  await completeOnboarding(page);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("dialog")).toContainText("שלב 1 מתוך 8");
  await completeWalkthrough(page);
  await expect(page.getByRole("button", { name: "הפעלת WALK ME מחדש" }).first()).toBeVisible();
});

test("Not now and Escape keep progress and refresh resumes the same step", async ({ page }) => {
  await completeOnboarding(page);
  await page.getByRole("button", { name: "Start tour" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: "Beginner and Advanced modes" })).toBeVisible();
  await page.getByRole("button", { name: "Not now" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  let record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), walkthroughKey);
  expect(record).toMatchObject({ status: "in-progress", currentStep: 2 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Beginner and Advanced modes" })).toBeVisible();
  await page.keyboard.press("Escape");
  record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), walkthroughKey);
  expect(record).toMatchObject({ status: "in-progress", currentStep: 2 });
  expect(record.completedAt).toBeUndefined();
});

test("manual replay preserves completion and closing it does not auto-open", async ({ page }) => {
  await completeOnboarding(page);
  await completeWalkthrough(page);
  const completed = await page.evaluate((key) => localStorage.getItem(key), walkthroughKey);
  await page.getByRole("button", { name: "Replay WALK ME" }).first().click();
  await expect(page.getByRole("heading", { name: "Welcome to the Academy" })).toBeVisible();
  await page.getByRole("button", { name: "Not now" }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), walkthroughKey)).toBe(completed);
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("public Help works without login and localizes title, areas, and filters", async ({ page }) => {
  await page.goto("/help");
  await expect(page).toHaveURL(/\/help$/);
  await expect(page.getByRole("heading", { level: 1, name: "Help Center" })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator(".help-filters")).toBeVisible();
  await expect(page.locator(".help-center-grid article").first()).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Product area" })).toContainText("Workspace");
  await expect(page.locator(".help-center-grid .eyebrow").first()).not.toHaveText(/home|learn|build|workspace|more/);
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "he"));
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "מרכז עזרה" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "אזור מוצר" })).toContainText("סביבת עבודה");
  await expect(page.getByRole("combobox", { name: "רמה" })).toContainText("מתקדמים");
});

test("320px mobile walkthrough opens navigation without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await completeOnboarding(page);
  await page.getByRole("button", { name: "Start tour" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".mobile-drawer")).toBeVisible();
  await expect(page.locator('[data-walkthrough="experience-mode"]:visible')).toBeVisible();
  await expect(page.locator(".tour-spotlight")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("reset returns to not-started and removes replay from Help and navigation", async ({ page }) => {
  await completeOnboarding(page);
  await completeWalkthrough(page);
  await page.goto("/settings");
  await expect(page.getByRole("button", { name: "Replay WALK ME" }).last()).toBeVisible();
  await page.getByRole("button", { name: "Reset walkthrough state" }).click();
  await expect(page.getByRole("status")).toContainText("Only walkthrough state was reset.");
  await expect(page.getByRole("button", { name: "Replay WALK ME" })).toHaveCount(0);
  await page.goto("/help");
  await expect(page.getByRole("button", { name: "Replay WALK ME" })).toHaveCount(0);
});
