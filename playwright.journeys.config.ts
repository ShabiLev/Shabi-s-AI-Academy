import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/journeys",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/journeys", open: "never" }], ["json", { outputFile: "quality/generated/playwright-journeys-results.json" }]],
  use: { baseURL: "http://127.0.0.1:5173", screenshot: "on", trace: "on", video: "on", reducedMotion: "reduce" },
  webServer: { command: "npm run preview:test", url: "http://127.0.0.1:5173", reuseExistingServer: false, timeout: 120000 },
  projects: [{ name: "critical-journeys-chromium", use: { ...devices["Desktop Chrome"] } }],
});
