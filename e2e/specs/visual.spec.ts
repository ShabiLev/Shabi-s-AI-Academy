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
    await page
      .getByRole("button", { name: "Import to Library" })
      .first()
      .click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("imported-prompt-attribution-en.png", {
      mask: [page.getByText(/Imported:/).locator("..")],
    });
    await page.goto("/prompts/catalog");
    await page
      .getByRole("button", { name: "Import another copy" })
      .first()
      .click();
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

test.describe("visual — Runtime Engine", () => {
  test("empty and populated history Hebrew", async ({ page }) => {
    await login(page, "/runs");
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-history-empty.png");
    await page.getByRole("button", { name: "הרצת Mock מוצלחת" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-history-populated.png", {
      mask: dynamicMasks(page),
    });
  });
  test("run details Hebrew", async ({ page }) => {
    await login(page, "/runs");
    await page.getByRole("button", { name: "הרצת Mock מוצלחת" }).click();
    await page.getByRole("link", { name: /Runtime demo: success/ }).click();
    await expect(page).toHaveURL(/\/runs\//);
    await expect(page.locator("h1")).toContainText("Runtime demo: success");
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-details.png", {
      mask: dynamicMasks(page),
    });
  });
  test("approval state Hebrew", async ({ page }) => {
    await login(page, "/runs");
    await page.getByRole("button", { name: "Mock עם אישור" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-approval.png", {
      mask: dynamicMasks(page),
    });
  });
  test("Dry Run Hebrew", async ({ page }) => {
    await login(page, "/runs");
    await page.getByRole("button", { name: "Dry Run", exact: true }).click();
    await page
      .getByRole("link", { name: /Inspect this local Runtime/ })
      .click();
    await expect(page).toHaveURL(/\/runs\//);
    await expect(page.locator("h1")).toContainText("Inspect this local Runtime");
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-dry-run.png", {
      mask: dynamicMasks(page),
    });
  });
  test("details and Dry Run English", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Mock success" }).click();
    await page.getByRole("link", { name: /Runtime demo: success/ }).click();
    await expect(page).toHaveURL(/\/runs\//);
    await expect(page.locator("h1")).toContainText("Runtime demo: success");
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-details-en.png", {
      mask: dynamicMasks(page),
    });
    await page.goto("/runs");
    await page.getByRole("button", { name: "Dry Run", exact: true }).click();
    await page
      .getByRole("link", { name: /Inspect this local Runtime/ })
      .click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("runtime-dry-run-en.png", {
      mask: dynamicMasks(page),
    });
  });
});

test.describe("visual — Runtime mobile Hebrew", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("history and timeline", async ({ page }) => {
    await login(page, "/runs");
    await page.getByRole("button", { name: "הרצת Mock מוצלחת" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-runtime-history.png", {
      mask: dynamicMasks(page),
    });
    await page.getByRole("link", { name: /Runtime demo: success/ }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-runtime-timeline.png", {
      mask: dynamicMasks(page),
    });
  });
  test("approval dialog", async ({ page }) => {
    await login(page, "/runs");
    await page.getByRole("button", { name: "Mock עם אישור" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-runtime-approval.png", {
      mask: dynamicMasks(page),
    });
  });
});

test.describe("visual — complete beta", () => {
  test("public About Hebrew and English", async ({ page }) => {
    await page.goto("/about"); await expect(page.locator(".about-page h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("about-he.png", { fullPage: true, mask: dynamicMasks(page) });
    await login(page); await english(page); await page.goto("/about"); await expect(page.locator(".about-page h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("about-en.png", { fullPage: true, mask: dynamicMasks(page) });
  });
  test("Prompt and Agent Playgrounds", async ({ page }) => {
    await login(page, "/playground/prompts"); await expect(page.locator("h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("prompt-playground.png", { fullPage: true });
    await page.goto("/playground/agents"); await expect(page.locator("h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("agent-playground.png", { fullPage: true });
  });
  test("Projects and Knowledge Base", async ({ page }) => {
    await login(page, "/projects"); await expect(page.locator("h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("projects-empty.png", { fullPage: true });
    await page.goto("/knowledge"); await expect(page.locator("h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("knowledge-empty.png", { fullPage: true });
  });
  test("mobile About and Prompt Packs", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/about"); await expect(page.locator(".about-page h1")).toBeVisible(); await stabilize(page); await expect(page).toHaveScreenshot("mobile-about.png", { fullPage: true, mask: dynamicMasks(page) });
    await login(page, "/prompts/packs"); await expect(page.locator("h1")).toBeVisible(); await page.getByLabel(/חבילה|Pack/).selectOption("security-risk"); await stabilize(page); await expect(page).toHaveScreenshot("mobile-prompt-packs.png");
  });
});

test.describe("visual — AI Workspace", () => {
  test("Search, Assistant Chat, Workflow Builder, and Analytics", async ({ page }) => {
    await login(page);
    await page.goto("/search?q=איכות");
    await expect(page.locator(".search-page h1")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-search.png");
    await page.goto("/assistant");
    await expect(page.locator(".assistant-page h1")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-assistant-chat.png");
    await page.goto("/workflows");
    await page.locator(".workflow-templates button").nth(1).click();
    await expect(page.locator(".workflow-builder-page h1")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-workflow-builder.png");
    await page.goto("/analytics");
    await expect(page.locator(".analytics-page h1")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-analytics.png");
  });
  test("Command Palette and expanded Assistant", async ({ page }) => {
    await login(page);
    await page.keyboard.press("Control+k");
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-command-palette.png");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /הרחבת העוזר|Expand Assistant/ }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-assistant-expanded.png");
  });
  test("mobile Search and Command Palette", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, "/search?q=prompt");
    await expect(page.locator(".search-page h1")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-workspace-search.png", { fullPage: true });
    await page.keyboard.press("Control+k");
    await stabilize(page);
    await expect(page).toHaveScreenshot("mobile-workspace-command-palette.png");
  });
});
