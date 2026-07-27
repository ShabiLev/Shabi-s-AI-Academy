import { test, expect, login } from "../fixtures/academy";

test("Help Center search, filters, and glossary are reachable", async ({ page }) => {
  await page.goto("/help");
  await expect(page.getByRole("heading", { level: 1, name: /Help Center|מרכז עזרה/ })).toBeVisible();
  await page.getByLabel(/חיפוש|Search/).fill("agent");
  await expect(page.locator(".help-center-grid article")).not.toHaveCount(0);
  await page.locator("#main-content").getByRole("link", { name: /מילון מונחים|Glossary/ }).click();
  await expect(page).toHaveURL(/\/glossary$/);
});

test("context help opens the relevant Help Center article", async ({ page }) => {
  await login(page, "/dashboard");
  const helpGroup = page.locator("details").filter({ has: page.locator('a[href="/help"]') });
  await helpGroup.locator("summary").click();
  await page.getByRole("link", { name: /Help|עזרה/ }).first().click();
  await expect(page).toHaveURL(/\/help/);
  await expect(page.locator(".help-center-page")).toBeVisible();
});

test("a completed tour can be restarted from Help Center", async ({ page }) => {
  await page.goto("/help");
  await page.getByRole("button", { name: /Replay WALK ME|הפעלת WALK ME מחדש/ }).last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: /Not now|לא עכשיו/ }).last().click();
  await page.goto("/help");
  await page.getByRole("button", { name: /Replay WALK ME|הפעלת WALK ME מחדש/ }).last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
