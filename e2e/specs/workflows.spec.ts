import { test, expect, english, login } from "../fixtures/academy";

test("Workflow is created with accessible controls, runs locally, and survives refresh", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/workflows");
  await page.getByRole("button", { name: "Prompt Review Pipeline" }).click();
  await expect(page.getByRole("heading", { name: "Workflow Builder" })).toBeVisible();
  await page.getByLabel("Step type").selectOption("transform");
  await page.getByRole("button", { name: "Add step" }).click();
  await expect(page.getByRole("list", { name: "Workflow steps" }).getByText("transform", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Mock Run" }).click();
  await expect(page.getByRole("status")).toContainText("Local run completed");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Workflow Builder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
});

test("Approval node pauses a Workflow", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/workflows");
  await page.getByRole("button", { name: "QA Release Review" }).click();
  await page.getByRole("button", { name: "Mock Run" }).click();
  await expect(page.getByRole("status")).toContainText("paused for explicit approval");
  await expect(page.getByText(/waitingForApproval/).first()).toBeVisible();
});
