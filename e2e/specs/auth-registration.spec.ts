import { test, expect, noOverflow } from "../fixtures/academy";

test("registration is bilingual, validated, and degrades safely without configuration", async ({ page }) => {
  await page.goto("/auth/register");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "יצירת חשבון" })).toBeVisible();
  await expect(page.getByRole("button", { name: "יצירת חשבון" })).toBeDisabled();
  const email = page.getByLabel("דוא״ל");
  await email.fill("not-an-email");
  expect(await email.evaluate((input: HTMLInputElement) => input.checkValidity())).toBeFalsy();
  await noOverflow(page);
});

test("English registration exposes password and consent guidance", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));
  await page.goto("/auth/register");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByText(/At least 10 characters/)).toBeVisible();
  await expect(page.locator("form").getByRole("link", { name: "Terms" })).toBeVisible();
  await expect(page.getByText("I acknowledge the Privacy Notice")).toBeVisible();
});
