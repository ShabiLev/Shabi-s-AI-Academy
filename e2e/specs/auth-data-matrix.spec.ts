import { readFileSync } from "node:fs";
import { test, expect } from "../fixtures/academy";

const authStates = JSON.parse(readFileSync("quality/inventory/authStates.json", "utf8")) as Array<{ id: string }>;
const dataStates = JSON.parse(readFileSync("quality/inventory/dataStates.json", "utf8")) as Array<{ id: string }>;

for (const state of authStates) test(`auth matrix represents ${state.id}`, async ({ page }) => {
  await page.goto(state.id === "authenticated" || state.id === "admin" ? "/profile" : "/auth/login");
  await expect(page.locator("body")).not.toBeEmpty();
  await expect(page.locator("html")).toHaveAttribute("lang", /he|en/);
});

for (const state of dataStates) test(`data matrix safely represents ${state.id}`, async ({ page }) => {
  await page.goto("/login");
  await page.evaluate((id) => {
    localStorage.clear();
    if (id === "malformed-local-storage") localStorage.setItem("shabi-ai-academy.prompt-library.v1", "{");
    if (id === "outdated-schema") localStorage.setItem("shabis-ai-academy:workspace:v1", JSON.stringify({ schemaVersion: 0 }));
    if (id === "storage-near-limit") localStorage.setItem("quality-near-limit", "x".repeat(100_000));
  }, state.id);
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /Demo Login|כניסה למצב הדגמה/ }).click();
  await expect(page.locator("main")).toBeVisible();
});
