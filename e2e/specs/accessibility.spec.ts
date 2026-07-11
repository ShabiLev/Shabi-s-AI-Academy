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
