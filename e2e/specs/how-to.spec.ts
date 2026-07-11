import { expect, test, login, english } from "../fixtures/academy";

test("searches the bilingual guide and resolves contextual anchors", async ({
  page,
}) => {
  await login(page);
  await english(page);
  await page.goto("/how-to#agent-builder");
  await expect(page.locator("#agent-builder")).toBeVisible();
  await page.getByRole("searchbox").fill("Agent Simulation");
  await expect(page.locator("#agent-simulation")).toBeVisible();
  await expect(page.locator("#agent-builder")).toHaveCount(0);
});
