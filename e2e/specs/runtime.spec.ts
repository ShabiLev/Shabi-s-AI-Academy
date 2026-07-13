import { expect, test, login, english, noOverflow } from "../fixtures/academy";

async function openEnglishRuntime(page: import("@playwright/test").Page) {
  await login(page);
  await english(page);
  await page.goto("/runs");
}
test("Run History is protected and starts empty", async ({ page }) => {
  await page.goto("/runs");
  await expect(page).toHaveURL(/login/);
  await page
    .getByRole("button", { name: /Demo Login|כניסה למצב הדגמה/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "היסטוריית הרצות" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "עדיין אין הרצות" }),
  ).toBeVisible();
});
test("Mock success persists and details show ordered simulated timeline", async ({
  page,
}) => {
  await openEnglishRuntime(page);
  const external: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith(new URL(page.url()).origin))
      external.push(request.url());
  });
  await page.getByRole("button", { name: "Mock success" }).click();
  await expect(
    page.locator(".runtime-card .runtime-status", { hasText: "Completed" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: /Runtime demo: success/ }).click();
  await expect(page.getByText(/Simulated Mock output/)).toBeVisible();
  const events = page.locator(".runtime-timeline li");
  await expect(events).toHaveCount(3);
  expect(
    await events.evaluateAll((items) => items.map((item) => item.textContent)),
  ).toEqual(
    expect.arrayContaining([
      expect.stringContaining("queued"),
      expect.stringContaining("started"),
      expect.stringContaining("completed"),
    ]),
  );
  expect(external).toEqual([]);
});
test("Dry Run is a local preview and Live is security-disabled", async ({
  page,
}) => {
  await openEnglishRuntime(page);
  await page.getByRole("button", { name: "Dry Run", exact: true }).click();
  await page
    .getByRole("link", { name: /Inspect this local Runtime request/ })
    .click();
  await expect(
    page.getByText(
      /Dry Run preview — no provider or external tool was executed/,
    ),
  ).toBeVisible();
  await expect(page.getByText(/not connected/)).toBeVisible();
  await page.goto("/runs");
  await expect(page.getByRole("button", { name: "Live Run" })).toBeDisabled();
  await expect(
    page.getByText("Live execution is not available in Version 1.1.0-beta.1."),
  ).toBeVisible();
  await expect(
    page.locator('input[name*="key" i], input[placeholder*="key" i]'),
  ).toHaveCount(0);
});
test("approval can resume or reject with keyboard-accessible focus", async ({
  page,
}) => {
  await openEnglishRuntime(page);
  await page.getByRole("button", { name: "Mock approval" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Approval Required" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toBeFocused();
  await dialog
    .getByRole("button", { name: "Approve local simulation" })
    .click();
  await expect(
    page
      .locator(".runtime-card .runtime-status", { hasText: "Completed" })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mock approval" }).click();
  await dialog.getByRole("button", { name: "Reject and cancel" }).click();
  await expect(
    page
      .locator(".runtime-card .runtime-status", { hasText: "Cancelled" })
      .first(),
  ).toBeVisible();
});
test("retry success, exhaustion, and cancellation are recorded", async ({
  page,
}) => {
  await openEnglishRuntime(page);
  await page.getByRole("button", { name: "Mock retry", exact: true }).click();
  await page.getByRole("link", { name: /retryThenSuccess/ }).click();
  await expect(
    page.locator(".runtime-facts dl > div", {
      has: page.getByText("Attempts", { exact: true }),
    }),
  ).toContainText("2");
  await expect(page.locator(".runtime-timeline")).toContainText("retry");
  await page.goto("/runs");
  await page.getByRole("button", { name: "Mock retry exhausted" }).click();
  await expect(
    page.locator(".runtime-card .runtime-status", { hasText: "Failed" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mock cancel" }).click();
  await expect(
    page
      .locator(".runtime-card .runtime-status", { hasText: "Cancelled" })
      .first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .locator(".runtime-card .runtime-status", { hasText: "Cancelled" })
      .first(),
  ).toBeVisible();
});
test("filters, delete, clear, persistence across login, and unknown IDs work", async ({
  page,
}) => {
  await openEnglishRuntime(page);
  await page.getByRole("button", { name: "Mock success" }).click();
  await page.getByRole("button", { name: "Dry Run", exact: true }).click();
  await page.getByLabel("Mode").selectOption("dryRun");
  await expect(page.locator(".runtime-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByLabel("Status").selectOption("completed");
  await expect(page.locator(".runtime-card")).toHaveCount(2);
  await page.getByLabel("Search").fill("success");
  await expect(page.locator(".runtime-card")).toHaveCount(1);
  await page.getByRole("link", { name: /success/ }).click();
  await page.getByRole("button", { name: "Delete run" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Confirm" })
    .click();
  await expect(page.locator(".runtime-card")).toHaveCount(1);
  await page.goto("/runs/unknown");
  await expect(
    page.getByRole("heading", { name: "Run not found" }),
  ).toBeVisible();
  await page.goto("/runs");
  await page.getByRole("button", { name: "Clear history" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Confirm" })
    .click();
  await expect(
    page.getByRole("heading", { name: "No runs yet" }),
  ).toBeVisible();
});
test("Hebrew RTL, English LTR, contextual help, and mobile layouts are safe", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await login(page, "/runs");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await noOverflow(page);
  await page.getByRole("button", { name: "הרצת Mock מוצלחת" }).click();
  await page.getByRole("link", { name: /Runtime demo: success/ }).click();
  await noOverflow(page);
  await page.getByRole("link", { name: "עזרה בנושא Runtime" }).click();
  await expect(page).toHaveURL(/how-to#run-details/);
  await expect(page.locator("#run-details")).toBeVisible();
  await english(page);
  await page.goto("/runs");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
test("sign out and unrelated course/prompt/agent data do not clear Runtime history", async ({
  page,
}) => {
  await openEnglishRuntime(page);
  await page.getByRole("button", { name: "Mock success" }).click();
  await page.evaluate(() => {
    localStorage.setItem("sentinel-course", "course");
    localStorage.setItem("sentinel-prompts", "prompts");
    localStorage.setItem("sentinel-agents", "agents");
  });
  await page.getByRole("button", { name: "Open profile menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.getByRole("button", { name: "Demo Login" }).click();
  await page.goto("/runs");
  await expect(page.locator(".runtime-card")).toHaveCount(1);
  expect(
    await page.evaluate(() => [
      localStorage.getItem("sentinel-course"),
      localStorage.getItem("sentinel-prompts"),
      localStorage.getItem("sentinel-agents"),
    ]),
  ).toEqual(["course", "prompts", "agents"]);
});
