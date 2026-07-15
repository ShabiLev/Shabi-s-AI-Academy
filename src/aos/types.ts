export interface AosModuleSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  requiredFor: string[];
}

export interface AosModulesSection {
  total: number;
  byCategory: Record<string, number>;
  items: AosModuleSummary[];
}

export interface AosEvidenceSummary {
  available: boolean;
  runId?: string | null;
  profile?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  version?: string | null;
  branch?: string | null;
  startingCommit?: string | null;
  finalCommit?: string | null;
  gateCount?: number;
  passedCount?: number;
  failedCount?: number;
  notAvailableCount?: number;
  failedGates?: string[];
}

export interface AosResearchSummary {
  sources: number;
  claims: number;
  candidates: number;
  reviews: number;
  published: number;
}

export interface AosValidationCheck {
  name: string;
  errorCount: number;
  warningCount: number;
  errors: string[];
  warnings: string[];
}

export interface AosValidationSummary {
  totalErrors: number;
  totalChecks: number;
  checks: AosValidationCheck[];
}

export interface AosMemorySummary {
  currentTask: string | null;
  currentPhase: string | null;
  releaseState: string;
  completionPercent: number;
  requirements: { completed: number; partial: number; missing: number };
  blockers: string[];
  blockerCount: number;
  knownIssueCount: number;
  latestEvidenceRunId: string | null;
  testedCommit: string | null;
  evidenceCurrent: boolean;
  coverage: number | null;
  research: { sources: number; candidatesPendingReview: number; publishedItems: number };
  nextActions: Array<{ id: string; title: string; priority: string; requiredRole: string; status: string }>;
  nextAction: string | null;
  handoff: { status: string | null; summary: string | null; updatedAt: string | null };
  updatedAt: string | null;
}

export interface AosSnapshot {
  generatedAt: string;
  aosVersion: string;
  applicationVersion: string;
  schemaVersion: string;
  supportedAgents: string[];
  branch: string | null;
  commit: string | null;
  modules: AosModulesSection;
  taskTypes: string[];
  evidence: AosEvidenceSummary;
  research: AosResearchSummary;
  validation: AosValidationSummary;
  memory: AosMemorySummary;
  activeHandoff: unknown | null;
}

export type AosSnapshotLoadResult =
  | { kind: "loading" }
  | { kind: "ok"; snapshot: AosSnapshot }
  | { kind: "notGenerated" }
  | { kind: "error"; message: string };
