import {
  QUALITY_SCHEMA_VERSION,
  type GateName,
  type QualityGates,
  type QualityReport,
} from "./types";

function passedGates(): QualityGates {
  const names: GateName[] = [
    "lint",
    "unitTests",
    "coverage",
    "build",
    "e2eFast",
    "e2eFull",
    "accessibility",
    "visual",
    "performance",
    "manualChecklist",
    "gitDiff",
  ];
  return Object.fromEntries(
    names.map((name) => [name, { status: "passed" }]),
  ) as QualityGates;
}

/** A fully-passing report, useful as a base that individual tests patch one field at a time. */
export function makeReport(
  overrides: Partial<QualityReport> = {},
): QualityReport {
  return {
    schemaVersion: QUALITY_SCHEMA_VERSION,
    applicationVersion: "1.4.0-beta.1",
    commitSha: "abc1234",
    branch: "main",
    environment: "test",
    generatedAt: "2026-07-11T12:00:00.000Z",
    overallStatus: "ready",
    gates: passedGates(),
    tests: {
      vitest: { total: 10, failed: 0, skipped: 0 },
      playwright: { total: 10, failed: 0, skipped: 0, browserProjects: 1 },
    },
    coverage: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
      thresholds: { statements: 75, branches: 65, functions: 70, lines: 75 },
      status: "passed",
    },
    accessibility: {
      scannedPages: 5,
      violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
      allowedIssues: [],
      manualReviewStatus: "complete",
      status: "passed",
    },
    visual: {
      baselineCount: 5,
      comparedCount: 5,
      mismatches: 0,
      baselineEnvironment: "visual-chromium",
      lastBaselineUpdate: "2026-07-11T12:00:00.000Z",
      status: "passed",
    },
    performance: {
      routes: [],
      thresholds: {
        desktop: {
          performance: 85,
          accessibility: 90,
          bestPractices: 90,
          seo: 80,
        },
        mobile: {
          performance: 75,
          accessibility: 90,
          bestPractices: 90,
          seo: 80,
        },
      },
      status: "passed",
    },
    knownIssues: {
      openCount: 0,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    },
    analyzerSummary: null,
    ...overrides,
  };
}
