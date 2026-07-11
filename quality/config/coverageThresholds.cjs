/**
 * Single source of truth for the Vitest coverage thresholds, imported by
 * vite.config.ts (enforced via Vitest's own `coverage.thresholds`) and by
 * quality/scripts/collect-quality-results.mjs (to judge coverage.json-summary
 * against the same numbers for the generated quality report).
 *
 * Measured baseline 2026-07-11: statements 95.5%, branches 85.46%, functions
 * 78.51%, lines 95.5% — comfortably above these targets. See docs/quality-gates.md.
 */
module.exports = {
  statements: 75,
  branches: 65,
  functions: 70,
  lines: 75,
};
