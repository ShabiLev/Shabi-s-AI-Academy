import { test, expect, english, login, noOverflow } from "../fixtures/academy";

async function ask(page: import("@playwright/test").Page, text: string) {
  await page.getByLabel("Request for the Local Assistant").fill(text);
  await page.getByRole("button", { name: "Send" }).click();
}

test("Local Assistant explains context, finds QA content, suggests an agent, and stays honest", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:5173")) externalRequests.push(request.url());
  });
  await login(page);
  await english(page);
  await page.goto("/prompts/new");
  await page.getByLabel("Prompt Title").fill("QA API Prompt");
  await page.getByLabel("Task").fill("Create detailed QA test cases for an API release.");
  await page.getByRole("button", { name: "Save Prompt" }).click();
  await page.goto("/assistant");
  await ask(page, "Explain this screen");
  await expect(page.getByText(/part of the Academy's local workspace/i).last()).toBeVisible();
  await ask(page, "Find QA prompt");
  await expect(page.getByRole("link", { name: "QA API Prompt" })).toBeVisible();
  await ask(page, "Which agent should I use for regression planning?");
  await expect(page.getByRole("link", { name: /QA Release Analyst/ })).toBeVisible();
  await ask(page, "Write a live provider response about tomorrow's weather");
  await expect(page.getByText(/requires a live AI provider/i)).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test("Assistant creates a Project only after confirmation", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/assistant");
  await ask(page, "Create a QA Evidence project");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
  await expect(page).toHaveURL(/\/assistant/);
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page).toHaveURL(/\/projects\//);
  await expect(page.getByRole("heading", { name: "a QA Evidence" })).toBeVisible();
});

test("Mobile Assistant launcher does not hide or overflow content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await english(page);
  await page.getByRole("button", { name: "Expand Assistant" }).click();
  await expect(page.getByLabel("Local Assistant")).toBeVisible();
  await noOverflow(page);
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Local Assistant")).toBeHidden();
  await expect(page.getByRole("button", { name: "Expand Assistant" })).toBeVisible();
});

test("Prompt Builder creates and deterministically tests an advanced prompt", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/prompts/new");
  await page.getByRole("button", { name: /1\. QA Test Case Generator/ }).click();
  await page.getByRole("button", { name: "Advanced" }).click();
  const cases = page.locator(".builder-test-cases");
  await cases.getByRole("button", { name: "Add test case" }).click();
  await cases.getByLabel("Input").fill("A login form must lock after five failures.");
  await cases.getByLabel("Expected characteristics").fill("Positive, negative, and lockout coverage");
  await cases.getByRole("button", { name: "Run local check" }).click();
  await expect(cases.getByRole("status")).toHaveText("passed");
  await page.getByRole("button", { name: "Save Prompt" }).click();
  await expect(page.getByRole("heading", { name: "QA Test Case Generator" })).toBeVisible();
});

test("Agent Builder rejects an unsafe high-risk tool without approval", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/agents/new");
  await page.getByRole("button", { name: /Use template: QA Release Analyst/i }).click();
  for (let step = 0; step < 4; step += 1) await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("checkbox", { name: /Email Draft Tool/ }).check();
  for (let step = 0; step < 7; step += 1) await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Save Agent" }).click();
  await expect(page.getByRole("alert")).toContainText("High-risk tool requires approval");
});
