import { test, expect, login } from "../fixtures/academy";

test("guest cannot enter migration and local records remain untouched", async ({ page }) => {
  await login(page, "/dashboard");
  await page.evaluate(() => localStorage.setItem("migration-proof", JSON.stringify({ id: "local" })));
  await page.goto("/account/migration");
  await expect(page).toHaveURL(/\/auth\/login\?from=/);
  expect(await page.evaluate(() => localStorage.getItem("migration-proof"))).toContain("local");
});

test("migration route never exposes controls to an unauthenticated visitor", async ({ page }) => {
  await page.goto("/account/migration");
  await expect(page).toHaveURL(/\/login\?from=/);
  await expect(page.getByText(/MIGRATE/)).toHaveCount(0);
});
