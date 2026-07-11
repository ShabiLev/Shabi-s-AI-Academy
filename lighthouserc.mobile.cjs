const thresholds = require("./quality/config/lighthouseThresholds.cjs");

/** Mobile-profile counterpart to lighthouserc.cjs — same public /login route, mobile thresholds. */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --port 4174 --host 127.0.0.1",
      startServerReadyPattern: "Local:",
      url: ["http://127.0.0.1:4174/login"],
      numberOfRuns: 1,
      settings: {
        formFactor: "mobile",
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 3, disabled: false },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: thresholds.mobile.performance }],
        "categories:accessibility": ["error", { minScore: thresholds.mobile.accessibility }],
        "categories:best-practices": ["error", { minScore: thresholds.mobile.bestPractices }],
        "categories:seo": ["warn", { minScore: thresholds.mobile.seo }],
        "largest-contentful-paint": ["warn", { maxNumericValue: thresholds.metrics.largestContentfulPaintMs }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: thresholds.metrics.cumulativeLayoutShift }],
        "total-blocking-time": ["warn", { maxNumericValue: thresholds.metrics.totalBlockingTimeMs }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./quality/generated/lighthouse/login-mobile",
    },
  },
};
