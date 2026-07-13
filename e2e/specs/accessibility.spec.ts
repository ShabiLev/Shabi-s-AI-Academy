import { test, login, english } from "../fixtures/academy";
import { runAxeScan } from "../fixtures/a11y";

test.describe("accessibility — Hebrew RTL", () => {
  test("Login", async ({ page }) => {
    await page.goto("/login");
    await runAxeScan(page, test.info());
  });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await runAxeScan(page, test.info());
  });

  test("Lessons catalog", async ({ page }) => {
    await login(page, "/lessons");
    await runAxeScan(page, test.info());
  });

  test("Lesson details", async ({ page }) => {
    await login(page, "/lessons/ai-llm-agent");
    await runAxeScan(page, test.info());
  });

  test("Settings", async ({ page }) => {
    await login(page, "/settings");
    await runAxeScan(page, test.info());
  });

  test("Prompt Library", async ({ page }) => {
    await login(page, "/prompts");
    await runAxeScan(page, test.info());
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page, "/prompts/new");
    await runAxeScan(page, test.info());
  });

  test("Starter Catalog", async ({ page }) => {
    await login(page, "/prompts/catalog");
    await runAxeScan(page, test.info());
  });

  test("Catalog Prompt Details", async ({ page }) => {
    await login(page, "/prompts/catalog/prompts-chat-sql-query-reviewer");
    await runAxeScan(page, test.info());
  });

  test("Agent Library", async ({ page }) => {
    await login(page, "/agents");
    await runAxeScan(page, test.info());
  });

  test("Agent Builder", async ({ page }) => {
    await login(page, "/agents/new");
    await runAxeScan(page, test.info());
  });

  test("How To guide", async ({ page }) => {
    await login(page, "/how-to");
    await runAxeScan(page, test.info());
  });

  test("Prompt Details", async ({ page }) => {
    await login(page, "/prompts/new");
    await page.getByLabel("שם הפרומפט").fill("A11y check prompt");
    await page.getByLabel("משימה").fill("בדיקת נגישות עבור עמוד פרטי הפרומפט.");
    await page.getByRole("button", { name: "שמירה" }).click();
    await runAxeScan(page, test.info());
  });

  test("QA Center", async ({ page }) => {
    await login(page, "/qa");
    await runAxeScan(page, test.info(), { label: "qa-center-empty" });
    const sample = page.getByRole("button", { name: "טעינת נתוני דוגמה" });
    if (await sample.isVisible()) {
      await sample.click();
      await runAxeScan(page, test.info(), { label: "qa-center-sample" });
    }
  });

  test("Starter Catalog and duplicate dialog", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts/catalog");
    await runAxeScan(page, test.info(), { label: "catalog-en" });
    await page
      .getByRole("button", { name: "Import to Library" })
      .first()
      .click();
    await page.goto("/prompts/catalog");
    await page
      .getByRole("button", { name: "Import another copy" })
      .first()
      .click();
    await runAxeScan(page, test.info(), { label: "catalog-duplicate-dialog" });
  });

  test("mobile navigation drawer open", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await login(page);
    await page.getByRole("button", { name: "פתיחת תפריט הניווט" }).click();
    await runAxeScan(page, test.info());
  });

  test("profile menu open", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "פתיחת תפריט הפרופיל" }).click();
    await runAxeScan(page, test.info());
  });

  test("delete confirmation dialog", async ({ page }) => {
    await login(page, "/prompts/new");
    await page.getByLabel("שם הפרומפט").fill("A11y delete check");
    await page
      .getByLabel("משימה")
      .fill("בדיקת נגישות עבור תיבת דו-שיח אישור מחיקה.");
    await page.getByRole("button", { name: "שמירה" }).click();
    await page.getByRole("button", { name: "מחיקה" }).click();
    await runAxeScan(page, test.info());
  });

  test("quiz interaction state after submit", async ({ page }) => {
    await login(page, "/lessons/ai-llm-agent");
    await page.getByRole("radio", { name: "הקשר" }).check();
    await page.getByRole("radio", { name: "נכון", exact: true }).check();
    await page
      .getByRole("radio", { name: "אימות אנושי ותוצר שניתן לסקור" })
      .check();
    await page.getByRole("button", { name: "בדיקת תשובות" }).click();
    await runAxeScan(page, test.info());
  });
});

test.describe("accessibility — complete beta", () => {
  test("public About Hebrew and English", async ({ page }) => { await page.goto("/about"); await runAxeScan(page, test.info(), { label: "about-he" }); await login(page); await english(page); await page.goto("/about"); await runAxeScan(page, test.info(), { label: "about-en" }); });
  for (const [name, route] of [["Prompt Packs", "/prompts/packs"], ["Starter Agents", "/agents/catalog"], ["Prompt Playground", "/playground/prompts"], ["Agent Playground", "/playground/agents"], ["Projects", "/projects"], ["Knowledge Base", "/knowledge"], ["Learning Journey", "/journey"], ["Release Center", "/release"]] as const) {
    test(name, async ({ page }) => { await login(page, route); await runAxeScan(page, test.info(), { label: name.toLowerCase().replaceAll(" ", "-") }); });
  }
});

test.describe("accessibility — English LTR", () => {
  test("Login", async ({ page }) => {
    await page.goto("/login");
    await runAxeScan(page, test.info());
  });

  test("Dashboard", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/");
    await runAxeScan(page, test.info());
  });

  test("Prompt Builder", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/prompts/new");
    await runAxeScan(page, test.info());
  });

  test("QA Center", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/qa");
    await runAxeScan(page, test.info());
  });
});

test.describe("accessibility — Runtime Engine", () => {
  test("Run History Hebrew and mobile filters", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, "/runs");
    await runAxeScan(page, test.info(), { label: "runtime-history-he-mobile" });
  });
  test("Run History English", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await runAxeScan(page, test.info(), { label: "runtime-history-en" });
  });
  test("Run Details and retry state", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Mock retry", exact: true }).click();
    await page.getByRole("link", { name: /retryThenSuccess/ }).click();
    await runAxeScan(page, test.info(), { label: "runtime-details-retry" });
  });
  test("Dry Run preview", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Dry Run", exact: true }).click();
    await page
      .getByRole("link", { name: /Inspect this local Runtime/ })
      .click();
    await runAxeScan(page, test.info(), { label: "runtime-dry-run" });
  });
  test("Approval dialog", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/runs");
    await page.getByRole("button", { name: "Mock approval" }).click();
    await runAxeScan(page, test.info(), { label: "runtime-approval-dialog" });
  });
});
