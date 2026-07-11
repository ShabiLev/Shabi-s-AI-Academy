const thresholds = require("./quality/config/lighthouseThresholds.cjs");

/**
 * Lighthouse CI config for the public routes only (desktop profile). Audits
 * against a production build served by `vite preview`, never the Vite dev
 * server. Authenticated routes (Dashboard, QA Center) are not audited here —
 * see quality/scripts/lighthouse-authenticated-flow.mjs and
 * docs/performance-testing.md for why LHCI's puppeteerScript hook cannot carry
 * our sessionStorage-based Demo Login into its audit tab.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --port 4173 --host 127.0.0.1",
      startServerReadyPattern: "Local:",
      url: ["http://127.0.0.1:4173/login"],
      numberOfRuns: 1,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: thresholds.desktop.performance }],
        "categories:accessibility": ["error", { minScore: thresholds.desktop.accessibility }],
        "categories:best-practices": ["error", { minScore: thresholds.desktop.bestPractices }],
        "categories:seo": ["warn", { minScore: thresholds.desktop.seo }],
        "largest-contentful-paint": ["warn", { maxNumericValue: thresholds.metrics.largestContentfulPaintMs }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: thresholds.metrics.cumulativeLayoutShift }],
        "total-blocking-time": ["warn", { maxNumericValue: thresholds.metrics.totalBlockingTimeMs }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./quality/generated/lighthouse/login-desktop",
    },
  },
};
