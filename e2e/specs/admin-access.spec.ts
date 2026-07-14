import { test, expect, login } from "../fixtures/academy";

test("guest is denied every admin route", async ({ page }) => {
  await login(page, "/dashboard");
  for (const route of ["/admin", "/admin/users", "/admin/content", "/admin/audit"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Admin/i })).toHaveCount(0);
  }
});

test("client-side role tampering does not grant admin access", async ({ page }) => {
  await login(page, "/dashboard");
  await page.evaluate(() => localStorage.setItem("role", "admin"));
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dashboard$/);
});
