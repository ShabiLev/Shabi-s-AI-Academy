import { QUALITY_SCHEMA_VERSION, type QualityReport } from "./types";

export const IMPORTED_REPORT_STORAGE_KEY =
  "shabi-ai-academy.qa-report-import.v1";

/**
 * A hand-authored example so the QA Center has something to render before any
 * real report has been generated. Always surfaced in the UI labeled "Sample data" —
 * never mistaken for a real validation result.
 */
export const sampleQualityReport: QualityReport = {
  schemaVersion: QUALITY_SCHEMA_VERSION,
  applicationVersion: "1.3.0-beta.1",
  commitSha: "sample01",
  branch: "main",
  environment: "sample",
  generatedAt: "2026-07-11T12:00:00.000Z",
  overallStatus: "ready",
  gates: {
    lint: { status: "passed" },
    unitTests: { status: "passed", durationMs: 4200 },
    coverage: { status: "passed" },
    build: { status: "passed", durationMs: 18000 },
    e2eFast: { status: "passed", durationMs: 32000 },
    e2eFull: { status: "passed", durationMs: 140000 },
    accessibility: { status: "passed" },
    visual: { status: "passed" },
    performance: { status: "passed" },
    manualChecklist: {
      status: "notRun",
      message: "Complete the checklist in QA Center.",
    },
    gitDiff: { status: "passed" },
  },
  tests: {
    vitest: { total: 49, failed: 0, skipped: 0, durationMs: 3800 },
    playwright: {
      total: 42,
      failed: 0,
      skipped: 0,
      browserProjects: 5,
      durationMs: 138000,
    },
  },
  coverage: {
    statements: 95.5,
    branches: 85.46,
    functions: 78.51,
    lines: 95.5,
    thresholds: { statements: 75, branches: 65, functions: 70, lines: 75 },
    status: "passed",
  },
  accessibility: {
    scannedPages: 15,
    violationsBySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
    allowedIssues: [],
    manualReviewStatus: "complete",
    status: "passed",
  },
  visual: {
    baselineCount: 20,
    comparedCount: 20,
    mismatches: 0,
    baselineEnvironment:
      "visual-chromium (Windows, pending Linux CI regeneration)",
    lastBaselineUpdate: "2026-07-11T12:00:00.000Z",
    status: "passed",
  },
  performance: {
    routes: [
      {
        route: "/login",
        device: "desktop",
        performance: 92,
        accessibility: 96,
        bestPractices: 96,
        seo: 90,
        metrics: {
          largestContentfulPaintMs: 1200,
          cumulativeLayoutShift: 0.01,
          totalBlockingTimeMs: 60,
        },
      },
      {
        route: "/",
        device: "mobile",
        performance: 80,
        accessibility: 96,
        bestPractices: 96,
        seo: 90,
        metrics: {
          largestContentfulPaintMs: 2200,
          cumulativeLayoutShift: 0.02,
          totalBlockingTimeMs: 140,
        },
      },
    ],
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
};

export function loadImportedReportJsonText(): string | null {
  try {
    return localStorage.getItem(IMPORTED_REPORT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveImportedReportJsonText(raw: string): void {
  try {
    localStorage.setItem(IMPORTED_REPORT_STORAGE_KEY, raw);
  } catch {
    /* storage unavailable; the imported report stays in memory for this session */
  }
}

export function clearImportedReportJsonText(): void {
  try {
    localStorage.removeItem(IMPORTED_REPORT_STORAGE_KEY);
  } catch {
    /* no-op */
  }
}

export interface ReportStaleness {
  versionMismatch: boolean;
  commitMismatch: boolean;
  old: boolean;
}

const DEFAULT_STALE_AFTER_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

/** Pure function so staleness rules are unit-testable without depending on the real clock. */
export function computeReportStaleness(
  report: QualityReport,
  currentAppVersion: string,
  currentCommitSha: string | null,
  nowIso: string,
  staleAfterMs: number = DEFAULT_STALE_AFTER_MS,
): ReportStaleness {
  const ageMs = Date.parse(nowIso) - Date.parse(report.generatedAt);
  return {
    versionMismatch: report.applicationVersion !== currentAppVersion,
    commitMismatch: Boolean(
      currentCommitSha &&
      report.commitSha &&
      report.commitSha !== currentCommitSha,
    ),
    old: Number.isFinite(ageMs) && ageMs > staleAfterMs,
  };
}
