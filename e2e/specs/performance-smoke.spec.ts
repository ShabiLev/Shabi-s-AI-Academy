import { test, expect, login } from "../fixtures/academy";

/**
 * Lightweight functional smoke checks that complement Lighthouse — not a Web
 * Vitals substitute. Lighthouse (quality/scripts + lighthouserc*.cjs) remains
 * the lab-performance gate; these checks catch broken requests, unhandled
 * errors, and stuck loading states with generous, non-flaky bounds.
 */
test("Login has no failed document/script requests", async ({ page }) => {
  const failed: string[] = [];
  page.on("requestfailed", (request) => {
    if (["document", "script", "stylesheet"].includes(request.resourceType())) {
      failed.push(`${request.resourceType()} ${request.url()}`);
    }
  });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "כניסה" })).toBeVisible();
  expect(failed).toEqual([]);
});

test("Dashboard becomes interactive within a generous bound and has no failed requests", async ({
  page,
}) => {
  const failed: string[] = [];
  page.on("requestfailed", (request) => {
    if (["document", "script", "stylesheet"].includes(request.resourceType())) {
      failed.push(`${request.resourceType()} ${request.url()}`);
    }
  });
  await login(page);
  await expect(
    page.getByRole("heading", { name: "ברוך שובך, שבי" }),
  ).toBeVisible({ timeout: 8000 });
  await expect(
    page.getByRole("button", { name: "כניסה למצב הדגמה" }),
  ).toHaveCount(0);
  expect(failed).toEqual([]);
});

test("Lessons, Prompt Builder, and QA Center load without a stuck loading state", async ({
  page,
}) => {
  await login(page, "/lessons");
  await expect(page.getByRole("heading", { name: "יסודות ה-AI" })).toBeVisible({
    timeout: 8000,
  });

  await page.goto("/prompts/new");
  await expect(page.getByLabel("שם הפרומפט")).toBeVisible({ timeout: 8000 });

  await page.goto("/qa");
  await expect(page.getByRole("heading", { name: "מרכז QA" })).toBeVisible({
    timeout: 8000,
  });

  await page.goto("/prompts");
  await expect(page.locator(".prompt-filters")).toBeVisible({ timeout: 8000 });
  await page.goto("/prompts/catalog");
  await expect(page.locator(".catalog-grid")).toBeVisible({ timeout: 8000 });
  await page.goto("/prompts/catalog/prompts-chat-sql-query-reviewer");
  await expect(page.locator(".catalog-prompt-text")).toBeVisible({
    timeout: 8000,
  });
});
