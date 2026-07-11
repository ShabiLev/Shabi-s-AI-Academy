import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: true,
  workers: process.env.CI ? 8 : 12,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    { name: "Desktop Chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Desktop Firefox", testMatch: /responsive\.spec\.ts/, grep: /login 320|dashboard desktop/, use: { ...devices["Desktop Firefox"] } },
    { name: "Desktop WebKit", testMatch: /responsive\.spec\.ts/, grep: /login 320|dashboard desktop/, use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chromium", testMatch: /responsive\.spec\.ts/, grep: /dashboard mobile|lesson mobile/, use: { ...devices["Pixel 7"] } },
    { name: "Mobile WebKit", testMatch: /responsive\.spec\.ts/, grep: /dashboard mobile|lesson mobile/, use: { ...devices["iPhone 14"] } },
  ],
});
