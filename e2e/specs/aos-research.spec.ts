import { execSync } from "node:child_process";
import { test, expect, login, english } from "../fixtures/academy";
import { routeAosSnapshot } from "../fixtures/aosSnapshot";

test.beforeAll(() => {
  execSync("node scripts/generate-aos-snapshot.mjs", { stdio: "ignore" });
});

test.beforeEach(async ({ page }) => routeAosSnapshot(page));

test.describe("AOS research pipeline", () => {
  test("shows real source/claim/candidate counts, not a fabricated number", async ({ page }) => {
    await login(page, "/aos/research");
    await expect(page.getByRole("heading", { name: /צינור המחקר|Research pipeline/ }).first()).toBeVisible();
    await expect(page.getByText(/מקורות|Sources/).first()).toBeVisible();
    await expect(page.getByText(/פורסמו|Published/).first()).toBeVisible();
  });

  test("states research sources are supplied explicitly, not crawled", async ({ page }) => {
    await login(page);
    await english(page);
    await page.goto("/aos/research");
    await expect(
      page.getByText(/Sources are supplied explicitly, never by autonomous crawling/),
    ).toBeVisible();
  });

  test("links back to the full module list", async ({ page }) => {
    await login(page, "/aos/research");
    await page.getByRole("link", { name: /צפה בכל המודולים|View all modules/ }).click();
    await expect(page).toHaveURL(/\/aos\/modules/);
  });
});
