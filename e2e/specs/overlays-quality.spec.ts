import { test, expect, login } from "../fixtures/academy";
import { writeQualityArtifact } from "../fixtures/qualityArtifacts";

test("profile overlay closes with Escape, restores focus, and stays in viewport", async ({ page }) => {
  await login(page); const trigger = page.getByRole("button", { name: /profile|account|פרופיל|חשבון/i }).first(); await trigger.focus(); await trigger.click();
  const overlay = page.locator('[role="menu"],[role="dialog"]').last(); await expect(overlay).toBeVisible(); const box = await overlay.boundingBox(); expect(box).not.toBeNull(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.keyboard.press("Escape"); await expect(overlay).toBeHidden(); await expect(trigger).toBeFocused(); writeQualityArtifact("overlay-coverage", { status: "passed", overlays: 1, findings: [] });
});
