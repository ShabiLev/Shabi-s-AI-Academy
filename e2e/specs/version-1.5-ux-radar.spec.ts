import type { Page } from "@playwright/test";
import { english, expect, login, test } from "../fixtures/academy";

async function expectPopulatedDashboard(page: Page) {
  const dashboard = page.getByTestId("dashboard-page");
  const content = page.getByTestId("dashboard-content");
  await expect(dashboard).toBeVisible();
  await expect(content).toBeVisible();
  await expect(content.getByRole("link")).not.toHaveCount(0);
  await expect(dashboard.getByText(/^Workspace Overview$/i)).toHaveCount(0);
  await expect(dashboard.getByText(/^Workspace Status$/i)).toHaveCount(0);
  await expect(dashboard.getByText(/^Recent Items$/i)).toHaveCount(0);
}

test("Dashboard root and primary actions render in Hebrew and English", async ({ page }) => {
  await login(page);
  await expectPopulatedDashboard(page);
  await english(page);
  await page.goto("/dashboard");
  await expectPopulatedDashboard(page);
});

test("Dashboard root and primary actions render on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expectPopulatedDashboard(page);
});

test("Dashboard root and primary actions render in Beginner and Advanced modes", async ({ page }) => {
  await login(page);
  await expectPopulatedDashboard(page);
  await page.goto("/settings");
  await page.getByRole("radio", { name: /מצב מתקדם|Advanced Mode/ }).click();
  await page.goto("/dashboard");
  await expectPopulatedDashboard(page);
  await expect(page.getByRole("heading", { name: /איכות ואבחון|Quality and diagnostics/ })).toBeVisible();
});

test("Recent Items is canonical under Profile and sidebar reveals only the current group", async ({ page }) => {
  await login(page, "/radar");
  const groups = page.locator(".desktop-sidebar nav details");
  await expect(groups.filter({ has: page.getByRole("link", { name: /רדאר|Radar/ }) })).toHaveAttribute("open", "");
  await expect(groups.filter({ has: page.locator('.nav-link[href="/agents"]') })).not.toHaveAttribute("open", "");
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: /^(פריטים אחרונים|Recent Items)$/ })).toBeVisible();
});

test("local notifications dismiss with every non-destructive mechanism", async ({ page }) => {
  await login(page);
  const trigger = page.getByRole("button", { name: /התראות|Notifications/ });
  await trigger.click();
  await expect(page.getByRole("dialog", { name: /התראות מקומיות|Local notifications/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: /סגירת ההתראות|Close notifications/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Radar supports source filters, compact view, and persistent favorites", async ({ page }) => {
  await login(page, "/radar");
  const cards = page.locator(".radar-card");
  await expect(cards).toHaveCount(3);
  await page.getByRole("button", { name: /^(שמורים|Favorites)$/ }).click();
  await expect(cards).toHaveCount(0);
  await page.getByRole("button", { name: /ציר זמן|Timeline/ }).click();
  await cards.first().getByRole("button", { name: /שמירה|Save/ }).click();
  await page.reload();
  await page.getByRole("button", { name: /^(שמורים|Favorites)$/ }).click();
  await expect(cards).toHaveCount(1);
});

test("Radar offline refresh keeps cached data and never exposes browser exceptions", async ({ page }) => {
  await page.addInitScript(() => {
    const onlineFetch = window.fetch.bind(window);
    window.fetch = (...args) => String(args[0]).includes("/generated/ai-radar-feed.json")
      ? Promise.reject(new TypeError("Network request unavailable"))
      : onlineFetch(...args);
  });
  await login(page, "/radar");
  await expect(page.locator(".radar-card")).toHaveCount(3);
  await page.getByRole("button", { name: "בדיקת עדכון" }).click();
  await expect(page.getByRole("status")).toContainText("מוצגים הנתונים האחרונים שנשמרו");
  await expect(page.locator("body")).not.toContainText("Illegal invocation");
  await expect(page.locator("body")).not.toContainText("Failed to execute 'fetch'");
  await english(page);
  await page.goto("/radar");
  await page.getByRole("button", { name: "Check for update" }).click();
  await expect(page.getByRole("status")).toContainText("latest cached information is shown");
  await expect(page.locator(".radar-card")).toHaveCount(3);
});

test("Profile renders translated interest labels instead of canonical identifiers", async ({ page }) => {
  await login(page, "/profile");
  await expect(page.getByText("הנדסת פרומפטים", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("promptEngineering");
  await english(page);
  await page.goto("/profile");
  await expect(page.getByText("Prompt Engineering", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("promptEngineering");
});
