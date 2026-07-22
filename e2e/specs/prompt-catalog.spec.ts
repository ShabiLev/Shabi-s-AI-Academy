import { expect, test, login, english, noOverflow } from "../fixtures/academy";

test("Catalog search, filters, attribution, plain-text preview, and safe import", async ({
  page,
}) => {
  await login(page);
  await english(page);
  await page.goto("/prompts/catalog");
  await expect(
    page.getByRole("heading", { name: "Starter Prompt Catalog" }),
  ).toBeVisible();
  await expect(page.getByText(/CC0-1.0/).first()).toBeVisible();
  await expect(page.getByText(/not affiliated/i)).toBeVisible();
  await page
    .getByRole("searchbox", { name: "Search Catalog" })
    .fill("SQL Query Reviewer");
  await expect(
    page.getByRole("heading", { name: "SQL Query Reviewer" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Preview" }).click();
  await expect(page.locator("pre.catalog-prompt-text")).toContainText(
    "Review the supplied SQL query",
  );
  await expect(page.locator("pre.catalog-prompt-text script")).toHaveCount(0);
  await page.getByRole("button", { name: "Import to Library" }).click();
  await expect(
    page.getByRole("heading", { name: "SQL Query Reviewer" }),
  ).toBeVisible();
  await expect(page.getByText(/Source: prompts.chat/)).toBeVisible();
  await expect(
    page.getByText(/local copy and may have been edited/i),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Source: prompts.chat/)).toBeVisible();
  await page.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Description").fill("Edited local Catalog copy");
  await page.getByRole("button", { name: "Save Prompt" }).click();
  await expect(page.getByLabel("Version 2")).toBeVisible();
});

test("duplicate Catalog import requires an explicit choice", async ({
  page,
}) => {
  await login(page);
  await english(page);
  await page.goto("/prompts/catalog");
  await page.getByRole("button", { name: "Import to Library" }).first().click();
  await page.goto("/prompts/catalog");
  await page
    .getByRole("button", { name: "Import another copy" })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Prompt already imported" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toHaveCount(0);
  await page
    .getByRole("button", { name: "Import another copy" })
    .first()
    .click();
  await dialog.getByRole("button", { name: "Import another copy" }).click();
  await page.goto("/prompts");
  await expect(page.locator(".prompt-card")).toHaveCount(2);
});

test("Prompt Library and Catalog toolbar remain aligned without overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "/prompts");
  await expect(
    page
      .locator("header.prompt-page-header")
      .getByRole("link", { name: /פרומפט חדש/ }),
  ).toBeVisible();
  await expect(page.getByLabel(/מועדפים בלבד/)).toBeVisible();
  await noOverflow(page);
  await page.goto("/prompts/catalog");
  await noOverflow(page);
});

test("Prompt Library keeps personal and Catalog totals separate", async ({
  page,
}) => {
  await login(page);
  await english(page);
  await page.goto("/prompts");
  await expect(page.getByText(/0 prompts/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Starter Catalog \(24\)/ })).toBeVisible();
});
