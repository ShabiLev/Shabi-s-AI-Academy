import { defineConfig, devices } from "@playwright/test";
const fullMatrix = Boolean(process.env.PW_FULL);
// Each suite type writes its own JSON report file (see package.json's PW_REPORT_NAME
// per script) so a later Playwright invocation never silently overwrites an earlier
// one's results before quality:collect reads them — see quality/scripts/collect-quality-results.mjs.
const reportName = process.env.PW_REPORT_NAME || "functional";
export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: true,
  workers: process.env.CI ? 8 : 12,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }], ["json", { outputFile: `quality/generated/playwright-${reportName}-results.json` }]],
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
    {
      name: "Desktop Chromium",
      grep: fullMatrix ? /redirects, logs in|Hebrew defaults|catalog exposes all|Hebrew prompt saves|directional and overflow|public About|complete curriculum|prompt packs support|starter agents import|agent playground links|Prompt Playground runs|projects and Knowledge|platform centers|new beta workspaces/ : undefined,
      testIgnore: /(?:accessibility|visual|pages-deployment)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Accessibility",
      testMatch: /accessibility\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Canonical visual-regression project: fixed viewport/locale/timezone/color-scheme/
    // reduced-motion for determinism. snapshotPathTemplate keeps the {platform} token so
    // Windows-generated baselines (…-win32.png) never silently satisfy a Linux CI
    // comparison (…-linux.png) — see docs/visual-regression.md.
    {
      name: "visual-chromium",
      testMatch: /visual\.spec\.ts/,
      snapshotPathTemplate: "e2e/specs/__screenshots__/{projectName}/{testFilePath}/{arg}-{platform}{ext}",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 900 },
        locale: "he-IL",
        timezoneId: "Asia/Jerusalem",
        colorScheme: "dark",
        reducedMotion: "reduce",
      },
    },
    {
      name: "Desktop Firefox",
      testMatch: /responsive\.spec\.ts/,
      grep: /login 320|dashboard desktop/,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Desktop WebKit",
      testMatch: /responsive\.spec\.ts/,
      grep: /login 320|dashboard desktop/,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chromium",
      testMatch: /(?:responsive|prompts)\.spec\.ts/,
      grep: /dashboard mobile|lesson mobile|directional and overflow/,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Mobile WebKit",
      testMatch: /(?:responsive|prompts)\.spec\.ts/,
      grep: /dashboard mobile|lesson mobile|directional and overflow/,
      use: { ...devices["iPhone 14"] },
    },
  ],
});
