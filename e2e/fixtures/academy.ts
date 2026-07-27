import { test as base, expect, type Page } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, run) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      const timestamp = "2026-07-26T12:00:00.000Z";
      localStorage.setItem("shabis-ai-academy:guest-profile:v1", JSON.stringify({
        schemaVersion: 1,
        anonymousProfileId: "playwright-default",
        createdAt: timestamp,
        updatedAt: timestamp,
        lastSeenAt: timestamp,
      }));
      localStorage.setItem("shabis-ai-academy:walkthrough:v1:playwright-default", JSON.stringify({
        schemaVersion: 1,
        tourId: "first-visit-v1",
        tourVersion: "1.7",
        status: "completed",
        currentStep: 7,
        firstStartedAt: timestamp,
        updatedAt: timestamp,
        completedAt: timestamp,
        language: "he",
      }));
    });
    await page.goto("about:blank");
    await run(page);
    expect(errors, "unexpected browser errors").toEqual([]);
  },
});
export { expect };
export async function login(page: Page, path = "/dashboard") {
  await page.goto("/login");
  await page
    .getByRole("button", { name: /כניסה למצב הדגמה|Demo Login/ })
    .click();
  await page.waitForURL(/\/dashboard$/);
  const targetPath = path === "/" ? "/dashboard" : path;
  if (new URL(page.url()).pathname !== targetPath) await page.goto(targetPath);
}
export async function english(page: Page) {
  await page.goto("/settings");
  await page.getByRole("radio", { name: /English/ }).click();
}
export async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBeTruthy();
}
