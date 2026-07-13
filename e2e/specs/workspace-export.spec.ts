import { test, expect, english, login } from "../fixtures/academy";

test("Workspace export downloads and import previews conflicts before writing", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/projects/new");
  await page.getByLabel("Template").selectOption("qa-release");
  await page.getByRole("button", { name: "Save" }).click();
  await page.goto("/settings");
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON backup" }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/workspace-.*\.json$/);
  const path = await download.path();
  expect(path).toBeTruthy();
  await page.getByLabel("Choose import file").setInputFiles(path!);
  await expect(page.getByRole("heading", { name: "Preview and conflicts" })).toBeVisible();
  await expect(page.getByText("Preview ready. No data has been written.")).toBeVisible();
  await expect(page.locator(".backup-preview tbody tr")).not.toHaveCount(0);
  await expect(page.getByRole("button", { name: "Confirm import" })).toBeEnabled();
});

test("Workspace import rejects malformed and secret-bearing files", async ({ page }) => {
  await login(page);
  await english(page);
  await page.goto("/settings");
  await page.getByLabel("Choose import file").setInputFiles({
    name: "unsafe.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ schemaVersion: 1, apiKey: "sk-not-a-real-key" })),
  });
  await expect(page.getByText("Import file is invalid.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm import" })).toBeDisabled();
});
