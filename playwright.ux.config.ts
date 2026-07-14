import base from "./playwright.config";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  ...base,
  testDir: "./e2e/specs",
  testMatch: /(?:system-click-audit|route-crawler|forms-quality|overlays-quality|responsive-interactions|keyboard-journeys|copy-quality|error-recovery|auth-data-matrix)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/ux", open: "never" }], ["json", { outputFile: "quality/generated/playwright-ux-results.json" }]],
  use: { ...base.use, screenshot: "only-on-failure", trace: "retain-on-failure", video: "retain-on-failure" },
  projects: [{ name: "UX Chromium", use: { ...devices["Desktop Chrome"] } }],
});
