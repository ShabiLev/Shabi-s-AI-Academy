import { test, expect, english, login, noOverflow } from "../fixtures/academy";

test("Search finds lessons, prompts, agents, and projects in English and Hebrew", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:5173")) externalRequests.push(request.url());
  });
  await login(page);
  await english(page);
  await page.goto("/projects/new");
  await page.getByLabel("Template").selectOption("qa-release");
  await page.getByRole("button", { name: "Save" }).click();

  await page.goto("/search");
  const query = page.getByLabel("What are you looking for?");
  await query.fill("Prompt Quality Review");
  await expect(page.getByRole("heading", { name: "Lessons" })).toBeVisible();
  await query.fill("SQL Query Reviewer");
  await expect(page.getByRole("heading", { name: "Agents" })).toBeVisible();
  await query.fill("SQL query");
  await expect(page.getByRole("heading", { name: "Prompts" })).toBeVisible();
  await query.fill("QA Release Project");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

  await page.goto("/settings");
  await page.getByRole("radio", { name: /עברית/ }).click();
  await page.goto("/search");
  await page.getByRole("textbox", { name: /מה לחפש/ }).fill("איכות פרומפט");
  await expect(page.locator(".search-results li").first()).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(externalRequests).toEqual([]);
});

test("Search filters stack without overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page);
  await english(page);
  await page.goto("/search?q=prompt");
  await expect(page.getByRole("heading", { name: /Search the entire workspace/ })).toBeVisible();
  await expect(page.getByLabel("Entity type")).toBeVisible();
  await expect(page.getByLabel("Category")).toBeVisible();
  await expect(page.getByLabel("Language")).toBeVisible();
  await page.getByLabel("Availability").selectOption("available");
  await noOverflow(page);
});
