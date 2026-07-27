import { defineConfig, devices } from "@playwright/test";

const port = Number.parseInt(process.env.PW_PORT ?? "5173", 10);
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e/journeys",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report/journeys", open: "never" }], ["json", { outputFile: "quality/generated/playwright-journeys-results.json" }]],
  use: { baseURL, screenshot: "on", trace: "on", video: "on", reducedMotion: "reduce" },
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [{ name: "critical-journeys-chromium", use: { ...devices["Desktop Chrome"] } }],
});
