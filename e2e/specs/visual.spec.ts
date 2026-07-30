import type { Page } from "@playwright/test";
import { test, expect, login, english } from "../fixtures/academy";
import { stabilize, dynamicMasks } from "../fixtures/visual";

async function startEnglish(page: Page) {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));
}

async function createPrompt(page: Page, title = "Visual QA Prompt") {
  await page.goto("/prompts/new");
  await page.getByLabel("שם הפרומפט").fill(title);
  await page
    .getByLabel("משימה")
    .fill("צור מקרי בדיקה מפורטים עבור תרחיש התחברות.");
  await page.getByRole("button", { name: "שמירה" }).click();
}

test.beforeEach(async ({ page }) => {
  // Visual retention and relative-date states must not drift with wall-clock time.
  await page.clock.setFixedTime(new Date("2026-07-26T12:00:00Z"));
});

async function createVisualEvaluation(page: Page, name: string): Promise<void> {
  await page.goto("/evaluations/new");
  await page.locator('input[maxlength="120"]').fill(name);
  await page.getByRole("button", { name: /Create experiment draft|יצירת טיוטת ניסוי/ }).click();
  await expect(page.getByTestId("evaluation-workspace")).toBeVisible();
}

async function completeVisualEvaluation(page: Page, name: string): Promise<string> {
  await createVisualEvaluation(page, name);
  const evaluationId = page.url().split("/").at(-1) ?? "";
  await page.getByRole("button", { name: /Start run|התחלת הרצה/ }).click();
  await page.getByRole("button", { name: /Complete deterministic evaluation|השלמת הערכה דטרמיניסטית/ }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  return evaluationId;
}

async function runVisualSuite(page: Page): Promise<void> {
  await page.goto("/evaluation-suites/react-accessibility");
  await page.getByRole("button", { name: /Create accessibility suite|יצירת סדרת נגישות/ }).click();
  await page.getByRole("button", { name: /Run all suite cases|הרצת כל מקרי הסדרה/ }).click();
  await expect(page.getByRole("table")).toBeVisible();
}

test.describe("visual — Version 1.9 Agent Lab", () => {
  test("Evaluation Arena Hebrew desktop", async ({ page }) => {
    await page.goto("/evaluations");
    await expect(page.getByTestId("evaluation-arena")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-arena-he-desktop.png", { fullPage: true });
  });

  test("Evaluation Arena English desktop", async ({ page }) => {
    await startEnglish(page);
    await page.goto("/evaluations");
    await expect(page.getByRole("heading", { name: "Evaluation arena" })).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-arena-en-desktop.png", { fullPage: true });
  });

  test("Evaluation Arena English mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startEnglish(page);
    await page.goto("/evaluations");
    await expect(page.getByTestId("evaluation-arena")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-arena-en-mobile.png", { fullPage: true });
  });

  test("Rubric Builder Hebrew desktop", async ({ page }) => {
    await page.goto("/evaluations/new");
    await expect(page.locator(".evaluation-rubric")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-rubric-builder-he-desktop.png", { fullPage: true });
  });

  test("Evaluation Builder English mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startEnglish(page);
    await page.goto("/evaluations/new");
    await page.locator('input[maxlength="120"]').fill("Mobile prompt comparison");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-builder-en-mobile.png", { fullPage: true });
  });

  test("Evaluation running English desktop", async ({ page }) => {
    await startEnglish(page);
    await createVisualEvaluation(page, "Accessible React controlled run");
    await page.getByRole("button", { name: "Start run" }).click();
    await expect(page.getByText("Running", { exact: true })).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-running-en-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Evaluation paused English desktop", async ({ page }) => {
    await startEnglish(page);
    await createVisualEvaluation(page, "Exact checkpoint comparison");
    await page.getByRole("button", { name: "Start run" }).click();
    await page.getByRole("button", { name: "Safe pause" }).click();
    await expect(page.getByText("Paused", { exact: true })).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-paused-en-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Evaluation completed results Hebrew desktop", async ({ page }) => {
    const evaluationId = await completeVisualEvaluation(page, "השוואת React מושלמת");
    await page.goto(`/evaluations/${evaluationId}/results`);
    await expect(page.getByTestId("evaluation-results")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-evaluation-results-he-desktop.png", { fullPage: true });
  });

  test("Evaluator disagreement English desktop", async ({ page }) => {
    await startEnglish(page);
    const evaluationId = await completeVisualEvaluation(page, "Evaluator disagreement review");
    await page.goto(`/evaluations/${evaluationId}/results`);
    const findings = page.locator(".evaluation-results-grid");
    await expect(findings.locator(".evaluation-finding").first()).toBeVisible();
    await stabilize(page);
    await expect(findings).toHaveScreenshot("v19-evaluator-disagreement-en-desktop.png");
  });

  test("Run Trace Viewer Hebrew desktop", async ({ page }) => {
    const evaluationId = await completeVisualEvaluation(page, "עקבות הערכה בטוחים");
    await page.goto(`/evaluations/${evaluationId}/trace`);
    await expect(page.getByTestId("evaluation-trace")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-run-trace-he-desktop.png", { fullPage: true });
  });

  test("Regression Suites English desktop", async ({ page }) => {
    await startEnglish(page);
    await page.goto("/evaluation-suites");
    await page.getByRole("button", { name: "Create controlled suite" }).click();
    await expect(page.getByRole("link", { name: "Open suite" })).toBeVisible();
    await expect(page.getByTestId("evaluation-suites")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-regression-suites-en-desktop.png", { fullPage: true });
  });

  test("Blocking regression version diff English desktop", async ({ page }) => {
    await startEnglish(page);
    await runVisualSuite(page);
    await expect(page.getByText("Publication blocked", { exact: true })).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-blocking-regression-version-diff-en-desktop.png", { fullPage: true });
  });

  test("Failure Case evidence English desktop", async ({ page }) => {
    await startEnglish(page);
    const evaluationId = await completeVisualEvaluation(page, "Failure evidence learning");
    await page.goto(`/evaluations/${evaluationId}/results`);
    await page.getByRole("button", { name: "Create failure case" }).click();
    await expect(page.getByRole("status")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-failure-case-en-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Connected preview and Codex export English desktop", async ({ page }) => {
    await startEnglish(page);
    const evaluationId = await completeVisualEvaluation(page, "Connected preview and Codex export");
    await page.goto(`/evaluations/${evaluationId}/results`);
    await page.getByRole("button", { name: "Generate Codex export" }).click();
    await expect(page.getByRole("button", { name: "Download TOML" })).toBeVisible();
    await expect(page.locator(".evaluation-preview")).toContainText("Unavailable");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v19-connected-preview-codex-export-en-desktop.png", { fullPage: true });
  });
});

test.describe("visual — Version 1.8 Agent Teams", () => {
  test("Mission Builder Hebrew desktop", async ({ page }) => {
    await page.goto("/missions/new");
    await page.getByLabel(/תיאור המשימה|Mission description/).fill("מסירת סביבת משימה נגישה עם ראיות רגרסיה מלאות");
    await expect(page.getByTestId("mission-builder")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-builder-he-desktop.png", { fullPage: true });
  });

  test("Mission Workspace paused Hebrew desktop", async ({ page }) => {
    await page.goto("/missions/new");
    await page.getByLabel(/תיאור המשימה|Mission description/).fill("בדיקת שחרור בטוחה עם צוות מומחים");
    await page.getByRole("button", { name: /יצירת משימה לבדיקה|Create mission for review/ }).click();
    await page.getByRole("button", { name: /אישור התכנית|Approve plan/ }).click();
    await page.getByRole("button", { name: /התחלה|Start/ }).click();
    await page.getByRole("button", { name: /השהיה|Pause/ }).click();
    await expect(page.locator(".mission-heading .mission-status")).toContainText(/מושהית|Paused/);
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-workspace-paused-he-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Team catalog English desktop", async ({ page }) => {
    await startEnglish(page);
    await page.goto("/team");
    await expect(page.getByTestId("team-page")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-team-catalog-en-desktop.png", { fullPage: true });
  });

  test("Mission Builder English mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await startEnglish(page);
    await page.goto("/missions/new");
    await page.getByLabel("Mission description").fill("Review mobile navigation and accessible focus states");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-builder-en-mobile.png", { fullPage: true });
  });

  test("Mission plan approval Hebrew desktop", async ({ page }) => {
    await page.goto("/missions/new");
    await page.getByLabel(/תיאור המשימה|Mission description/).fill("בדיקת תכנית, בעלות ושערי איכות לפני התחלה");
    await page.getByRole("button", { name: /יצירת משימה לבדיקה|Create mission for review/ }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-plan-approval-he-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Mission running English desktop", async ({ page }) => {
    await startEnglish(page);
    await page.goto("/missions/new");
    await page.getByLabel("Mission description").fill("Coordinate an accessible feature with visible handoffs");
    await page.getByRole("button", { name: "Create mission for review" }).click();
    await page.getByRole("button", { name: "Approve plan" }).click();
    await page.getByRole("button", { name: "Start" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-running-en-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Mission quality failure Hebrew desktop", async ({ page }) => {
    await page.goto("/missions/new");
    await page.getByLabel(/תיאור המשימה|Mission description/).fill("תרחיש תיקון לאחר כשל בשער איכות");
    await page.getByRole("button", { name: /יצירת משימה לבדיקה|Create mission for review/ }).click();
    await page.getByRole("button", { name: /אישור התכנית|Approve plan/ }).click();
    await page.getByRole("button", { name: /התחלה|Start/ }).click();
    await page.getByRole("button", { name: /סימון צורך בתיקון|Mark needs work/ }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-needs-work-he-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("Completed Mission and learning summary English desktop", async ({ page }) => {
    await startEnglish(page);
    await page.goto("/missions/new");
    await page.getByLabel("Mission description").fill("Complete a team learning mission with evidence");
    await page.getByRole("button", { name: "Create mission for review" }).click();
    await page.getByRole("button", { name: "Approve plan" }).click();
    await page.getByRole("button", { name: "Start" }).click();
    for (let phase = 0; phase < 4; phase += 1) await page.getByRole("button", { name: "Complete simulated phase" }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v18-mission-completed-en-desktop.png", { fullPage: true, mask: dynamicMasks(page) });
  });
});

test.describe("visual — current product scenarios", () => {
  test("Profile Recent Items", async ({ page }) => {
    await login(page, "/lessons");
    await page.goto("/profile");
    await expect(page.locator(".recent-items")).toBeVisible();
    await expect(page.locator(".recent-items time").first()).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("profile-recent-items-current.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("collapsed sidebar and local notifications", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /התראות|Notifications/ }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-notifications-open.png");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Radar timeline favorites and offline cache", async ({ page }) => {
    await login(page, "/radar");
    await expect(page.locator(".radar-card")).toHaveCount(3);
    await stabilize(page);
    await expect(page).toHaveScreenshot("radar-current-timeline.png", { fullPage: true });
    await page.locator(".radar-card").first().getByRole("button", { name: /שמירה|Save/ }).click();
    await page.getByRole("button", { name: /שמורים וקריאה מאוחרת|Saved & Read Later/ }).click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("radar-current-favorites.png", { fullPage: true });
    await page.evaluate(() => {
      const onlineFetch = window.fetch.bind(window);
      window.fetch = (...args) =>
        String(args[0]).includes("/generated/ai-radar-feed.json")
          ? Promise.reject(new TypeError("Network request unavailable"))
          : onlineFetch(...args);
    });
    await page.getByRole("button", { name: /ניסיון עדכון|Retry refresh/ }).click();
    await expect(page.locator(".radar-freshness")).toHaveAttribute("data-status", "offline");
    await stabilize(page);
    await expect(page).toHaveScreenshot("radar-current-offline.png", { fullPage: true });
  });
});

test.describe("visual — Version 1.7 public beta", () => {
  for (const language of ["he", "en"] as const) {
    test(`Radar ${language} desktop`, async ({ page }) => {
      if (language === "en") await startEnglish(page);
      await page.goto("/radar");
      await expect(page.locator(".radar-card").first()).toBeVisible();
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v17-radar-${language}-desktop.png`, { fullPage: true });
    });

    test(`Radar ${language} mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      if (language === "en") await startEnglish(page);
      await page.goto("/radar");
      await expect(page.locator(".radar-card").first()).toBeVisible();
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v17-radar-${language}-mobile.png`, { fullPage: true });
    });
  }
});

test.describe("visual - 1.2 profile menu", () => {
  test("AI Radar Hebrew desktop", async ({ page }) => {
    await login(page, "/radar");
    await stabilize(page);
    await expect(page).toHaveScreenshot("ai-radar-he.png", { fullPage: true });
  });

  test("Hebrew desktop profile menu open", async ({ page }) => {
    await login(page);
    await page.locator(".desktop-sidebar .profile-trigger").click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("profile-menu-he.png");
  });

  test("English desktop profile menu open", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/");
    await page.locator(".desktop-sidebar .profile-trigger").click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("profile-menu-en.png");
  });

  for (const mode of ["he", "en"] as const) {
    test(`${mode} mobile profile sheet open`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await login(page);
      if (mode === "en") await english(page);
      await page.goto("/");
      await page.locator(".menu-button").click();
      await page.locator(".mobile-drawer .profile-trigger").click();
      await stabilize(page);
      await expect(page).toHaveScreenshot(`mobile-profile-menu-${mode}.png`);
    });
  }
});

async function loadSampleIfAvailable(page: Page) {
  const button = page.getByRole("button", {
    name: /טעינת נתוני דוגמה|Load sample data/,
  });
  await button.click();
  // Loading the sample toggles content above the fold; reset scroll so the
  // screenshot always starts from the same top-of-page state (otherwise
  // narrow/short viewports can settle a few pixels apart between runs).
  await page.evaluate(() => window.scrollTo(0, 0));
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
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
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
    await expect(page.getByTestId("dashboard-content")).toBeVisible();
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
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
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
    await expect(page.getByTestId("dashboard-content")).toBeVisible();
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
    await expect(page.locator("h1")).toBeVisible();
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

  test("About page Commit/Build mask selector resolves to the row containers, not just the value", async ({ page }) => {
    await page.goto("/about");
    const rows = page.locator(".about-page .runtime-facts > div");
    await expect(rows.nth(1)).toContainText("Commit");
    await expect(rows.nth(2)).toContainText("Build");
    const masked = page.locator(".about-page .runtime-facts > div:nth-child(2), .about-page .runtime-facts > div:nth-child(3)");
    await expect(masked).toHaveCount(2);
    // Each masked locator must be the whole grid row (dt + dd), not the dd
    // alone — the row's box is fixed by the dl's grid-template-columns, so
    // its bounding rect never depends on the length of the commit SHA or
    // build timestamp text it contains this run.
    for (const row of await masked.all()) {
      await expect(row.locator("dt")).toHaveCount(1);
      await expect(row.locator("dd")).toHaveCount(1);
    }
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
    await expect(page.locator(".analytics-page table").first()).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("workspace-analytics.png", {
      mask: [page.locator(".analytics-metrics strong, .analytics-page tbody td:last-child")],
    });
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

test.describe("visual — 1.3 guided auth UX", () => {
  for (const language of ["he", "en"] as const) {
    test(`landing ${language} desktop`, async ({ page }) => {
      if (language === "en") await startEnglish(page);
      await page.goto("/");
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v13-landing-${language}-desktop.png`, { fullPage: true });
    });

    test(`landing ${language} mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      if (language === "en") await startEnglish(page);
      await page.goto("/");
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v13-landing-${language}-mobile.png`, { fullPage: true });
    });

    test(`onboarding ${language} desktop`, async ({ page }) => {
      if (language === "en") await startEnglish(page);
      await login(page, "/onboarding");
      await expect(page.locator(".onboarding-card")).toBeVisible();
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v13-onboarding-${language}-desktop.png`, { fullPage: true });
    });

    test(`onboarding ${language} mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      if (language === "en") await startEnglish(page);
      await login(page, "/onboarding");
      await expect(page.locator(".onboarding-card")).toBeVisible();
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v13-onboarding-${language}-mobile.png`, { fullPage: true });
    });

    test(`auth screens ${language}`, async ({ page }) => {
      if (language === "en") await startEnglish(page);
      await page.goto("/auth/login");
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v13-auth-login-${language}.png`, { fullPage: true });
      await page.goto("/auth/register");
      await stabilize(page);
      await expect(page).toHaveScreenshot(`v13-auth-register-${language}.png`, { fullPage: true });
    });
  }

  test("beginner and advanced dashboards", async ({ page }) => {
    await login(page, "/dashboard");
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-dashboard-beginner.png", { fullPage: true });
    await page.goto("/settings");
    await page.getByRole("radio", { name: /מצב מתקדם|Advanced Mode/ }).click();
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-content")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-dashboard-advanced.png", { fullPage: true });
  });

  test("Help Center WALK ME glossary and profile", async ({ page }) => {
    await page.goto("/help");
    await expect(page.locator(".help-center-grid article").first()).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-help-center-he-desktop.png", { fullPage: true, timeout: 15_000 });
    await page.evaluate(() => {
      const timestamp = "2026-07-26T12:00:00.000Z";
      localStorage.removeItem("shabis-ai-academy:walkthrough:v1:playwright-default");
      localStorage.setItem("shabis-ai-academy:onboarding:v1:anonymous", JSON.stringify({
        schemaVersion: 1,
        mainGoal: "learn",
        experienceLevel: "beginner",
        interests: [],
        completed: true,
        recommendationId: "foundations",
        updatedAt: timestamp,
      }));
    });
    await page.goto("/dashboard");
    const walkthrough = page.getByRole("dialog");
    const next = walkthrough.getByRole("button", { name: /^(הבא|Next)$/ });
    await expect(walkthrough).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-welcome-desktop.png");
    await walkthrough.getByRole("button", { name: /התחלת הסיור|Start tour/ }).click();
    await expect(walkthrough.getByRole("heading", { name: /ניווט ראשי|Main navigation/ })).toBeVisible();
    await expect(walkthrough.locator(".walkthrough-pointer")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-navigation-desktop.png");
    await next.click();
    await expect(walkthrough.getByRole("heading", { name: /מצב מתחילים ומצב מתקדם|Beginner and Advanced modes/ })).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-page-control-desktop.png");
    for (let step = 0; step < 3; step += 1) {
      await next.click();
    }
    await expect(walkthrough.getByRole("heading", { name: /רדאר AI|AI Radar/ })).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-radar-desktop.png");
    await page.evaluate(() => {
      const key = "shabis-ai-academy:walkthrough:v1:playwright-default";
      const record = JSON.parse(localStorage.getItem(key) ?? "{}");
      localStorage.setItem(key, JSON.stringify({
        ...record,
        status: "in-progress",
        currentStep: 7,
        updatedAt: "2026-07-26T12:00:00.000Z",
        completedAt: undefined,
      }));
    });
    await page.reload();
    await expect(walkthrough.getByRole("heading", { name: /עזרה והתחלה מחדש|Help and restart/ })).toBeVisible();
    await expect(walkthrough.locator(".walkthrough-pointer")).toBeVisible();
    await expect(page.locator('[data-walkthrough="replay"]')).toHaveCount(0);
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-final-help-desktop.png");
    await page.getByRole("button", { name: /הבנתי|Got it/ }).click();
    await expect(page.locator('[data-walkthrough="replay"]')).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-completed-replay-desktop.png");

    await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));
    await page.goto("/help");
    await expect(page.getByRole("heading", { level: 1, name: "Help Center" })).toBeVisible();
    await expect(page.locator(".help-filters")).toBeVisible();
    await expect(page.locator(".help-center-grid article").first()).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-help-center-en-desktop.png", { fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await expect(page.locator(".help-center-grid article").first()).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-help-center-en-mobile.png", { fullPage: true });
    await page.getByRole("button", { name: "Replay WALK ME" }).last().click();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v17-walk-me-mobile-bottom-sheet.png");
    await page.getByRole("button", { name: "Not now" }).click();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "he"));
    await page.goto("/glossary");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-glossary.png", { fullPage: true });
    await page.goto("/profile");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-profile.png", { fullPage: true, mask: dynamicMasks(page) });
  });

  test("account security and migration access gates", async ({ page }) => {
    await page.goto("/account/security");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-account-security-gate.png", { fullPage: true });
    await page.goto("/account/migration");
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-migration-gate.png", { fullPage: true });
  });

  test("admin denial desktop and mobile", async ({ page }) => {
    await login(page, "/dashboard");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-admin-denied-desktop.png", { fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await stabilize(page);
    await expect(page).toHaveScreenshot("v13-admin-denied-mobile.png", { fullPage: true });
  });
});
