import { test, expect, login, noOverflow, english } from "../fixtures/academy";
async function create(
  page: import("@playwright/test").Page,
  title = "QA Regression Prompt",
) {
  await page.goto("/prompts/new");
  await page.getByLabel("שם הפרומפט").fill(title);
  await page
    .getByLabel("משימה")
    .fill("צור מקרי בדיקה מפורטים ליכולת התחברות בנייד ובמחשב.");
  await page
    .getByLabel("הקשר")
    .fill("כניסה באמצעות דוא״ל וסיסמה עם נעילה אחרי חמישה כישלונות.");
  await page.getByLabel("מגבלות").fill("אין להניח כניסה חברתית.");
  await page.getByLabel("פורמט פלט").fill("טבלה עם מזהה, צעדים ותוצאה צפויה.");
  await page.getByRole("button", { name: "שמירה" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}
test("empty Library opens Builder and validates required fields", async ({
  page,
}) => {
  await login(page, "/prompts");
  await expect(
    page.getByRole("heading", { name: "עדיין לא שמרת פרומפטים" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "יצירת הפרומפט הראשון" }).click();
  await page.getByRole("button", { name: "שמירה" }).click();
  await expect(page.getByRole("alert")).toHaveCount(2);
});
test("live Preview omits empty sections and quality updates", async ({
  page,
}) => {
  await login(page, "/prompts/new");
  await page
    .getByLabel("משימה")
    .fill("צור רשימה מפורטת של מקרי בדיקה עבור דרישת התחברות.");
  await expect(page.getByLabel("תצוגה מקדימה")).toContainText("משימה:");
  await expect(page.getByLabel("תצוגה מקדימה")).not.toContainText("הקשר:");
  await expect(page.getByLabel("איכות מבנית")).not.toContainText("0/100");
});
test("Hebrew prompt saves, survives refresh, edits version, duplicates and favorites", async ({
  page,
}) => {
  await login(page);
  await create(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "QA Regression Prompt" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "עריכה" }).click();
  await page.getByLabel("תיאור").fill("תיאור חדש");
  await page.getByRole("button", { name: "שמירה" }).click();
  await expect(page.getByLabel("גרסה 2")).toBeVisible();
  await page.getByRole("button", { name: "שכפול" }).click();
  await page.getByRole("button", { name: "שמירה" }).click();
  await page.getByRole("button", { name: "הוספה למועדפים" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "הסרה מהמועדפים" }),
  ).toBeVisible();
});
test("Library search, filters, clear, export and Dashboard metrics work", async ({
  page,
}) => {
  await login(page);
  await create(page, "Unique Jira Prompt");
  await page.goto("/prompts");
  await page.getByRole("searchbox", { name: "חיפוש בפרומפטים" }).fill("Unique");
  await expect(
    page.getByRole("heading", { name: "Unique Jira Prompt" }),
  ).toBeVisible();
  await page.getByLabel("קטגוריה").selectOption("sql");
  await expect(page.getByText("לא נמצאו פרומפטים")).toBeVisible();
  await page.getByRole("button", { name: "ניקוי מסננים" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "ייצוא" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.md$/);
  await page.goto("/dashboard");
  await expect(page.getByText(/1 פרומפטים/)).toBeVisible();
});
test("delete dialog supports Escape and explicit deletion; unknown route is handled", async ({
  page,
}) => {
  await login(page);
  await create(page);
  await page.goto("/prompts");
  await page.getByRole("button", { name: "מחיקה" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toBeHidden();
  await page.getByRole("button", { name: "מחיקה" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "מחיקה" })
    .click();
  await expect(
    page.getByRole("heading", { name: "עדיין לא שמרת פרומפטים" }),
  ).toBeVisible();
  await page.goto("/prompts/missing");
  await expect(
    page.getByRole("heading", { name: "הפרומפט לא נמצא" }),
  ).toBeVisible();
});
test("Lesson 2 prefills Workshop and reset/signout preserve prompts", async ({
  page,
}) => {
  await login(page, "/lessons/professional-prompt-anatomy");
  await page.getByRole("link", { name: "פתח בסדנת הפרומפטים" }).click();
  await expect(page.getByLabel("שם הפרומפט")).toHaveValue(
    "QA Test Case Generator",
  );
  await page.getByRole("button", { name: "שמירה" }).click();
  await page.goto("/settings");
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "איפוס התקדמות בקורס" }).click();
  await page.getByRole("button", { name: "פתיחת תפריט הפרופיל" }).click();
  await page.getByRole("menuitem", { name: "התנתקות" }).click();
  await page.getByRole("button", { name: "כניסה למצב הדגמה" }).click();
  await page.goto("/prompts");
  await expect(
    page.getByRole("heading", { name: "QA Test Case Generator" }),
  ).toBeVisible();
});
test("English and Hebrew Builder remain directional and overflow-free on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page, "/prompts/new");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await noOverflow(page);
  await english(page);
  await page.goto("/prompts/new");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await noOverflow(page);
  await page.getByLabel("Prompt Title").fill("Long ".repeat(80));
  await noOverflow(page);
});
