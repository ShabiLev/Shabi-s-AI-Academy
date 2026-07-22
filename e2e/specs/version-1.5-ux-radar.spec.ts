import { expect, login, test } from "../fixtures/academy";

test("simplified Dashboard has no workspace summaries or Recent Items", async ({ page }) => {
  await login(page);
  await page.goto("/settings");
  await page.getByRole("radio", { name: "English" }).click();
  await page.goto("/dashboard");
  await expect(page.getByText("Workspace overview", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Workspace status", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Recent items", { exact: true })).toHaveCount(0);
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
