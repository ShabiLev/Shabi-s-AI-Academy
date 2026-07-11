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
  await page.getByRole("button", { name: "פתיחת תפריט הפרופיל" }).click();
  const box = await page.getByRole("menu").boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
});
