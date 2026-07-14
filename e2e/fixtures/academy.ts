import { test as base, expect, type Page } from "@playwright/test";
export const test = base.extend({
  page: async ({ page }, run) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto("about:blank");
    await run(page);
    expect(errors, "unexpected browser errors").toEqual([]);
  },
});
export { expect };
export async function login(page: Page, path = "/dashboard") {
  await page.goto(path === "/" ? "/dashboard" : path);
  await page
    .getByRole("button", { name: /כניסה למצב הדגמה|Demo Login/ })
    .click();
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
