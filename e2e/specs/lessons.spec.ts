import { test, expect, login, english, noOverflow } from "../fixtures/academy";
test("catalog exposes all 45 beta lessons without forced locks", async ({
  page,
}) => {
  await login(page, "/lessons");
  await expect(page.getByRole("heading", { level: 1, name: "שיעורים" })).toBeVisible();
  await expect(page.getByRole("link", { name: "התחלת שיעור" })).toHaveCount(45);
  await expect(page.getByRole("button", { name: "בקרוב" })).toHaveCount(0);
});
test("lessons open, unknown is Not Found, and next/previous work", async ({
  page,
}) => {
  await login(page, "/lessons/ai-llm-agent");
  await expect(
    page.getByRole("heading", { name: /AI, מודל שפה/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: /השיעור הבא/ }).click();
  await expect(
    page.getByRole("heading", { name: "יסודות מודלי שפה" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /השיעור הקודם/ }).click();
  await page.goto("/lessons/missing");
  await expect(
    page.getByRole("heading", { name: "השיעור לא נמצא" }),
  ).toBeVisible();
});
test("opening marks progress and completion survives refresh", async ({
  page,
}) => {
  await login(page, "/lessons/ai-llm-agent");
  await page.getByRole("button", { name: "סימון השיעור כהושלם" }).click();
  await page.reload();
  await page.goto("/lessons");
  await expect(page.getByRole("link", { name: "צפייה חוזרת" })).toHaveCount(1);
});
test("quiz hides feedback, scores, and retries", async ({ page }) => {
  await login(page, "/lessons/ai-llm-agent");
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("radio", { name: "הקשר" }).check();
  await page.getByRole("radio", { name: "נכון", exact: true }).check();
  await page
    .getByRole("radio", { name: "אימות אנושי ותוצר שניתן לסקור" })
    .check();
  await page.getByRole("button", { name: "בדיקת תשובות" }).click();
  await expect(page.getByText(/הציון שלך/)).toBeVisible();
  await page.getByRole("button", { name: "ניסיון נוסף" }).click();
  await expect(
    page.getByRole("button", { name: "בדיקת תשובות" }),
  ).toBeVisible();
});
test("draft persists and reset preserves auth and language", async ({
  page,
}) => {
  await login(page, "/lessons/professional-prompt-anatomy");
  await page.getByLabel("טיוטת הפרומפט שלך").fill("QA prompt draft");
  await page.reload();
  await expect(page.getByLabel("טיוטת הפרומפט שלך")).toHaveValue(
    "QA prompt draft",
  );
  await english(page);
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset Course Progress" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("button", { name: "Open profile menu" }),
  ).toBeVisible();
});
test("Hebrew and English lessons use correct direction and mobile content remains usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page, "/lessons/ai-llm-agent");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await noOverflow(page);
  await expect(page.getByRole("radio").first()).toBeVisible();
  await english(page);
  await page.goto("/lessons/ai-llm-agent");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Mini-project" })).toBeVisible();
  await noOverflow(page);
});
