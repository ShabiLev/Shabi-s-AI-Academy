import { test, expect, login, noOverflow } from "../fixtures/academy";
for (const item of [
  { name: "login 320", path: "/login", width: 320, height: 568, auth: false },
  { name: "dashboard mobile", path: "/", width: 390, height: 844, auth: true },
  {
    name: "lessons tablet",
    path: "/lessons",
    width: 768,
    height: 1024,
    auth: true,
  },
  {
    name: "dashboard desktop",
    path: "/",
    width: 1440,
    height: 900,
    auth: true,
  },
  {
    name: "lesson mobile",
    path: "/lessons/ai-llm-agent",
    width: 320,
    height: 568,
    auth: true,
  },
])
  test(item.name + " has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: item.width, height: item.height });
    if (item.auth) await login(page, item.path);
    else await page.goto(item.path);
    await noOverflow(page);
  });
test("profile menu remains within viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page);
  await page.getByRole("button", { name: "פתיחת תפריט הניווט" }).click();
  await page.getByRole("button", { name: "פתיחת תפריט הפרופיל" }).click();
  const box = await page.getByRole("menu").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
});

test("new beta workspaces support the required viewport matrix", async ({ page }) => {
  const matrix = [
    { width: 320, height: 568, route: "/search?q=prompt" },
    { width: 360, height: 800, route: "/assistant" },
    { width: 390, height: 844, route: "/" },
    { width: 768, height: 1024, route: "/workflows" },
    { width: 1024, height: 768, route: "/analytics" },
    { width: 1440, height: 900, route: "/search?q=quality" },
    { width: 1920, height: 1080, route: "/workflows" },
  ];
  await login(page);
  for (const item of matrix) {
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(item.route);
    await expect(page.locator("h1")).toBeVisible();
    if (item.width === 390) {
      await page.keyboard.press("Control+k");
      await expect(page.getByRole("dialog")).toBeVisible();
      await noOverflow(page);
      await page.keyboard.press("Escape");
    }
    await noOverflow(page);
  }
});
