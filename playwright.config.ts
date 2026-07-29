import { defineConfig, devices } from "@playwright/test";
const fullMatrix = Boolean(process.env.PW_FULL);
const port = Number(process.env.PW_PORT || 5173);
const baseURL = `http://127.0.0.1:${port}`;
// Each suite type writes its own JSON report file (see package.json's PW_REPORT_NAME
// per script) so a later Playwright invocation never silently overwrites an earlier
// one's results before quality:collect reads them — see quality/scripts/collect-quality-results.mjs.
const reportName = process.env.PW_REPORT_NAME || "functional";
const version17Titles = /anonymous visitor|optional onboarding|Radar persists|briefing and what-changed|offline refresh|corrupted profile|guest export\/import|partial same-origin feed|structured feedback|mobile English Radar|empty filtered state|anonymous users cannot open administrative routes/;
const version18Titles = /mission journey|unavailable connected execution|Team catalog preserves attribution|English 320px mobile mission builder|quality failure|English Expert Dry Run|Audit Only|completed Mission/;
const fullDesktopTitles = new RegExp(
  `redirects, logs in|Hebrew defaults|catalog exposes all|Hebrew prompt saves|directional and overflow|public About|complete curriculum|prompt packs support|starter agents import|agent playground links|Prompt Playground runs|projects and Knowledge|platform centers|new beta workspaces|${version17Titles.source}|${version18Titles.source}`,
);
const crossBrowserTitles = new RegExp(`login 320|dashboard desktop|${version17Titles.source}|${version18Titles.source}`);
const mobileTitles = new RegExp(`dashboard mobile|lesson mobile|directional and overflow|${version17Titles.source}|${version18Titles.source}`);
export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: true,
  workers: Number(process.env.PW_WORKERS || 4),
  retries: process.env.CI ? 2 : 0,
  expect: {
    toHaveScreenshot: {
      // Keep screenshot comparisons strict while tolerating minor renderer noise.
      // Platform-specific baselines still protect Windows and Linux independently.
      maxDiffPixelRatio: 0.002,
    },
  },
  reporter: [["list"], ["html", { open: "never" }], ["json", { outputFile: `quality/generated/playwright-${reportName}-results.json` }]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npx vite preview --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [
    {
      name: "Desktop Chromium",
      grep: fullMatrix ? fullDesktopTitles : undefined,
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
      testMatch: /(?:responsive|version-1\.7-public-beta|version-1\.8-agent-teams)\.spec\.ts/,
      grep: crossBrowserTitles,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Desktop WebKit",
      testMatch: /(?:responsive|version-1\.7-public-beta|version-1\.8-agent-teams)\.spec\.ts/,
      grep: crossBrowserTitles,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chromium",
      testMatch: /(?:responsive|prompts|version-1\.7-public-beta|version-1\.8-agent-teams)\.spec\.ts/,
      grep: mobileTitles,
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Mobile WebKit",
      testMatch: /(?:responsive|prompts|version-1\.7-public-beta|version-1\.8-agent-teams)\.spec\.ts/,
      grep: mobileTitles,
      use: { ...devices["iPhone 14"] },
    },
  ],
});
