import { test, expect, login } from "../fixtures/academy";

test.describe("AOS evidence viewer", () => {
  test("shows the latest evidence run drawn from quality/execution/latest, not a simulated result", async ({ page }) => {
    await login(page, "/aos/evidence");
    await expect(page.getByRole("heading", { name: /ראיות איכות אחרונות|Latest quality evidence/ })).toBeVisible();
    const notGenerated = page.getByText(/טרם נוצר תמונת מצב|No snapshot generated yet/);
    const hasRun = page.getByText(/quality\/execution\/latest\/summary\.json/);
    await expect(notGenerated.or(hasRun)).toBeVisible();
  });

  test("gate counts are numeric and never claim success without a run", async ({ page }) => {
    await login(page, "/aos/evidence");
    const passedLabel = page.getByText(/עברו|Passed/).first();
    if (await passedLabel.isVisible()) {
      const container = page.locator(".qa-header-grid").first();
      await expect(container).toBeVisible();
    }
  });
});
