/**
 * Shared Lighthouse thresholds for both the LHCI config files (lighthouserc*.cjs,
 * which audit the public /login route) and the custom authenticated User Flow
 * script (quality/scripts/lighthouse-authenticated-flow.mjs, which audits
 * Dashboard and QA Center). Keeping one copy avoids the two paths drifting apart.
 *
 * Measured baseline 2026-07-11 on this Windows dev machine, production build,
 * `vite preview`: Login desktop ~1.00 perf / 1.00 a11y / 0.96 best-practices /
 * 0.90 seo; Dashboard/QA Center (authenticated) desktop ~0.99-1.00 across the
 * board. Mobile throttling was not separately hardware-profiled here, so mobile
 * performance carries a lower, more conservative floor per Lighthouse's own
 * recommended defaults. CI hardware will differ from this machine — see
 * docs/performance-testing.md.
 */
module.exports = {
  desktop: {
    performance: 0.85,
    accessibility: 0.9,
    bestPractices: 0.9,
    seo: 0.8,
  },
  mobile: {
    performance: 0.75,
    accessibility: 0.9,
    bestPractices: 0.9,
    seo: 0.8,
  },
  metrics: {
    largestContentfulPaintMs: 3000,
    cumulativeLayoutShift: 0.1,
    totalBlockingTimeMs: 400,
  },
};
