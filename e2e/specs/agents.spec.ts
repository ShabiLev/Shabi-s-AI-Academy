import { expect, test, login, english } from "../fixtures/academy";

test("creates an Agent from a template, inspects it, and simulates locally", async ({
  page,
}) => {
  await login(page);
  await english(page);
  await page.goto("/agents/new");
  await page
    .getByRole("button", { name: /Use template: QA Release Analyst/i })
    .click();
  for (let step = 0; step < 11; step += 1)
    await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Save Agent" }).click();
  await expect(
    page.getByRole("heading", { name: "QA Release Analyst" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Simulate" }).click();
  await page.getByRole("button", { name: /Run simulation/ }).click();
  await expect(
    page.getByText(/no external call was made/i).first(),
  ).toBeVisible();
});

test("filters the Agent Library without leaving the browser", async ({
  page,
}) => {
  await login(page, "/agents");
  await expect(page.getByRole("heading", { name: /הסוכנים שלי/ })).toBeVisible();
  await page.getByRole("textbox").fill("does-not-exist");
  await expect(page.locator(".prompt-empty h2")).toBeVisible();
});
