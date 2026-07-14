import { test, expect } from "../fixtures/academy";

test("guest mode remains local and sends no authentication request", async ({ page }) => {
  const authRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname.includes("supabase") || /\/auth\/v1/i.test(url.pathname)) authRequests.push(request.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "התחלה כאורח" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  expect(authRequests).toEqual([]);
});

test("public auth pages do not erase pre-existing local data", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("local-project-proof", "kept"));
  await page.goto("/auth/login");
  await page.getByRole("button", { name: /המשך כאורח|Continue as Guest/ }).click();
  expect(await page.evaluate(() => localStorage.getItem("local-project-proof"))).toBe("kept");
});
