import { test, expect, english, login, noOverflow } from "../fixtures/academy";

test("Command Palette opens by keyboard, explains disabled state, and navigates", async ({ page }) => {
  await login(page);
  await english(page);
  const trigger = page.getByRole("button", { name: /Command Palette/ });
  await trigger.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Command Palette" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Search commands").fill("favorite current");
  await expect(dialog.getByRole("button", { name: /Favorite current entity/ })).toHaveAttribute("aria-disabled", "true");
  await expect(dialog.getByText("No supported entity is open")).toBeVisible();
  await dialog.getByLabel("Search commands").fill("create project");
  await expect(dialog.getByRole("button", { name: /^Create Project/ })).toBeVisible();
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/new/);
});

test("Palette traps focus, restores focus, and fits mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page);
  await english(page);
  const trigger = page.getByRole("button", { name: /Command Palette/ });
  await trigger.focus();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "Command Palette" })).toBeVisible();
  await noOverflow(page);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("?");
  await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
});
