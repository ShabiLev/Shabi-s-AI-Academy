import type { Page } from "@playwright/test";
import { test, expect, login, english } from "../fixtures/academy";
import { stabilize, dynamicMasks } from "../fixtures/visual";

async function createPrompt(page: Page, title = "Visual QA Prompt") {
  await page.goto("/prompts/new");
  await page.getByLabel("שם הפרומפט").fill(title);
  await page
    .getByLabel("משימה")
    .fill("צור מקרי בדיקה מפורטים עבור תרחיש התחברות.");
  await page.getByRole("button", { name: "שמירה" }).click();
}

async function loadSampleIfAvailable(page: Page) {
  const button = page.getByRole("button", {
    name: /טעינת נתוני דוגמה|Load sample data/,
  });
  await button.click();
}

async function useStableQaSample(page: Page) {
  await page.route("**/generated/latest-quality-report.json", (route) =>
    route.fulfill({ json: null }),
  );
}

test.describe("visual — desktop Hebrew", () => {
  test("Login", async ({ page }) => {
    await page.goto("/login");
    await stabilize(page);
    await expect(page).toHaveScreenshot("login.png");
  });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("dashboard.png");
  });

  test("Lessons catalog", async ({ page }) => {
    await login(page, "/lessons");
    await stabilize(page);
    await expect(page).toHaveScreenshot("lessons-catalog.png");
  });

  test("Lesson details", async ({ page }) => {
    await login(page, "/lessons/ai-llm-agent");
    await stabilize(page);
    await expect(page).toHaveScreenshot("lesson-details.png");
  });

  test("Prompt Library populated", async ({ page }) => {
    await login(page);
    await createPrompt(page);
    await page.goto("/prompts");
    await stabilize(page);
    await expect(page).toHaveScreenshot("prompt-library-populated.png");
  });

  test("Starter Catalog", async ({ page }) => {
    await login(page, "/prompts/catalog");
    await stabilize(page);
    await expect(page).toHaveScreenshot("starter-catalog.png");
  });

  test("Catalog Prompt Details", async ({ page }) => {
    await login(page, "/prompts/catalog/prompts-chat-sql-query-reviewer");
    await stabilize(page);
    await expect(page).toHaveScreenshot("catalog-prompt-details.png");
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page, "/prompts/new");
    await stabilize(page);
    await expect(page).toHaveScreenshot("prompt-builder.png");
  });

  test("Prompt Details", async ({ page }) => {
    await login(page);
    await createPrompt(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("prompt-details.png");
  });

  test("Settings", async ({ page }) => {
    await login(page, "/settings");
    await stabilize(page);
    await expect(page).toHaveScreenshot("settings.png");
  });

  test("QA Center", async ({ page }) => {
    await useStableQaSample(page);
    await login(page, "/qa");
    await loadSampleIfAvailable(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("qa-center.png", {
      mask: dynamicMasks(page),
    });
  });
});

test.describe("visual — desktop English", () => {
  test("Dashboard", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/");
    await stabilize(page);
    await expect(page).toHaveScreenshot("dashboard-en.png");
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts/new");
    await stabilize(page);
    await expect(page).toHaveScreenshot("prompt-builder-en.png");
  });

  test("Prompt Library and Starter Catalog", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts");
    await stabilize(page);
    await expect(page).toHaveScreenshot("prompt-library-en.png");
    await page.goto("/prompts/catalog");
    await stabilize(page);
    await expect(page).toHaveScreenshot("starter-catalog-en.png");
  });

  test("Imported Prompt attribution and duplicate dialog", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts/catalog");
    await page.getByRole("button", { name: "Import to Library" }).first().click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("imported-prompt-attribution-en.png", { mask: [page.getByText(/Imported:/).locator("..")] });
    await page.goto("/prompts/catalog");
    await page.getByRole("button", { name: "Import another copy" }).first().click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("catalog-duplicate-dialog-en.png");
  });

  test("QA Center", async ({ page }) => {
    await useStableQaSample(page);
    await login(page);
    await english(page);
    await page.goto("/qa");
    await loadSampleIfAvailable(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("qa-center-en.png", {
      mask: dynamicMasks(page),
    });
  });
});

test.describe("visual — mobile Hebrew", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Login", async ({ page }) => {
    await page.goto("/login");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-login.png");
  });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-dashboard.png");
  });

  test("open navigation drawer", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "פתיחת תפריט הניווט" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-drawer-open.png");
  });

  test("Lesson details", async ({ page }) => {
    await login(page, "/lessons/ai-llm-agent");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-lesson-details.png");
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page, "/prompts/new");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-prompt-builder.png");
  });

  test("Starter Catalog", async ({ page }) => {
    await login(page, "/prompts/catalog");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-starter-catalog.png");
  });

  test("delete dialog", async ({ page }) => {
    await login(page);
    await createPrompt(page, "Visual Delete Prompt");
    await page.getByRole("button", { name: "מחיקה" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-delete-dialog.png");
  });

  test("QA Center", async ({ page }) => {
    await useStableQaSample(page);
    await login(page, "/qa");
    await loadSampleIfAvailable(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-qa-center.png", {
      mask: dynamicMasks(page),
    });
  });
});

test.describe("visual — mobile English", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-dashboard-en.png");
  });

  test("Prompt Library", async ({ page }) => {
    await login(page);
    await createPrompt(page, "Visual Library Prompt En");
    await english(page);
    await page.goto("/prompts");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-prompt-library-en.png");
  });

  test("QA Center", async ({ page }) => {
    await useStableQaSample(page);
    await login(page);
    await english(page);
    await page.goto("/qa");
    await loadSampleIfAvailable(page);
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-qa-center-en.png", {
      mask: dynamicMasks(page),
    });
  });
});
