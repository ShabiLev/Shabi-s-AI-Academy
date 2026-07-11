export const QUALITY_SCHEMA_VERSION = 1;

export type GateStatus =
  "passed" | "failed" | "warning" | "notRun" | "notAvailable";

export type GateName =
  | "lint"
  | "unitTests"
  | "coverage"
  | "build"
  | "e2eFast"
  | "e2eFull"
  | "accessibility"
  | "visual"
  | "performance"
  | "manualChecklist"
  | "gitDiff";

export const gateNames: GateName[] = [
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

export interface QualityGateResult {
  status: GateStatus;
  durationMs?: number;
  message?: string;
}

export type QualityGates = Record<GateName, QualityGateResult>;

export interface VitestSummary {
  total: number;
  failed: number;
  skipped: number;
  durationMs?: number;
}

export interface PlaywrightSummary {
  total: number;
  failed: number;
  skipped: number;
  browserProjects: number;
  durationMs?: number;
}

export interface TestSummary {
  vitest: VitestSummary | null;
  playwright: PlaywrightSummary | null;
}

export interface CoverageThresholds {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface CoverageSummary {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  thresholds: CoverageThresholds;
  status: GateStatus;
}

export type AccessibilitySeverity =
  "critical" | "serious" | "moderate" | "minor";

export interface AccessibilityAllowedIssue {
  ruleId: string;
  selector: string;
  reason: string;
  owner: string;
  createdAt: string;
  targetRemovalVersion: string;
}

export interface AccessibilitySummary {
  scannedPages: number;
  violationsBySeverity: Record<AccessibilitySeverity, number>;
  allowedIssues: AccessibilityAllowedIssue[];
  manualReviewStatus: "complete" | "incomplete" | "notStarted";
  status: GateStatus;
}

export interface VisualSummary {
  baselineCount: number;
  comparedCount: number;
  mismatches: number;
  baselineEnvironment: string;
  lastBaselineUpdate: string | null;
  status: GateStatus;
}

export type DeviceProfile = "desktop" | "mobile";

export interface LighthouseMetrics {
  largestContentfulPaintMs?: number;
  cumulativeLayoutShift?: number;
  totalBlockingTimeMs?: number;
}

export interface LighthouseRouteResult {
  route: string;
  device: DeviceProfile;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  metrics: LighthouseMetrics;
}

export interface PerformanceThresholds {
  desktop: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  mobile: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

export interface PerformanceSummary {
  routes: LighthouseRouteResult[];
  thresholds: PerformanceThresholds;
  status: GateStatus;
}

export type IssueType =
  | "bug"
  | "accessibility"
  | "performance"
  | "visual"
  | "automation"
  | "technicalDebt";
export type IssueSeverity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "inProgress" | "resolved" | "acceptedRisk";

export interface QaIssue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  severity: IssueSeverity;
  status: IssueStatus;
  owner: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  targetVersion?: string;
  relatedRoute?: string;
  relatedTest?: string;
  notes?: string;
}

export interface KnownIssuesSummary {
  openCount: number;
  bySeverity: Record<IssueSeverity, number>;
}

export type ReleaseStatus =
  "ready" | "readyWithWarnings" | "blocked" | "notEvaluated";

export interface BilingualText {
  he: string;
  en: string;
}

export interface AnalyzerSummary {
  overallStatus: ReleaseStatus;
  summaryHe: string;
  summaryEn: string;
  failedGates: GateName[];
  warningGates: GateName[];
  recommendedActions: BilingualText[];
  likelyAffectedAreas: BilingualText[];
}

export interface QualityReport {
  schemaVersion: number;
  applicationVersion: string;
  commitSha: string | null;
  branch: string | null;
  environment: string;
  generatedAt: string;
  overallStatus: ReleaseStatus;
  gates: QualityGates;
  tests: TestSummary;
  coverage: CoverageSummary | null;
  accessibility: AccessibilitySummary | null;
  visual: VisualSummary | null;
  performance: PerformanceSummary | null;
  knownIssues: KnownIssuesSummary | null;
  analyzerSummary: AnalyzerSummary | null;
}

/** Result of loading/parsing a quality report from an unknown JSON source. */
export type QualityReportLoadResult =
  | { kind: "ok"; report: QualityReport }
  | { kind: "empty" }
  | { kind: "invalid"; reason: string }
  | { kind: "unsupportedSchema"; foundVersion: unknown };

export interface ReleaseChecklistState {
  applicationVersion: string;
  manualChecks: Record<string, boolean>;
  updatedAt: string;
}
