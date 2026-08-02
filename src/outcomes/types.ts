export const REALITY_MODES = [
  "live",
  "local",
  "simulated",
  "blueprint-only",
  "manual-action-required",
  "not-connected",
] as const;

export type RealityMode = (typeof REALITY_MODES)[number];

export const OUTCOME_STATUSES = [
  "draft",
  "ready",
  "simulated",
  "needs-evidence",
  "verified",
  "completed",
  "blocked",
  "archived",
] as const;

export type OutcomeStatus = (typeof OUTCOME_STATUSES)[number];
export type OutcomeVerificationState = "unverified" | "needs-evidence" | "verified" | "failed";
export type OutcomeSourceModule = "prompt" | "agent" | "team" | "mission" | "project" | "workflow" | "knowledge" | "lesson";

export interface OutcomeNextAction {
  id: string;
  label: string;
  route?: string;
}

export interface SimulationAcknowledgement {
  acknowledgedAt: string;
  acknowledgedBy: string;
  statement: string;
}

export interface Deliverable {
  schemaVersion: 2;
  id: string;
  actorId: string;
  outcomeId: string;
  title: string;
  resultType: string;
  location: string;
  usageInstructions: string;
  sourceEntityId?: string;
  sourceEntityVersion?: number;
  contentHash?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  [key: string]: unknown;
}

export interface OutcomeEvidence {
  schemaVersion: 2;
  id: string;
  actorId: string;
  outcomeId: string;
  deliverableId?: string;
  evidenceType: string;
  summary: string;
  sourceEntityId: string;
  sourceEntityVersion: number;
  contentHash: string;
  verificationState: OutcomeVerificationState;
  createdAt: string;
  createdBy: string;
  verifiedAt?: string;
  [key: string]: unknown;
}

export interface Outcome {
  schemaVersion: 2;
  id: string;
  actorId: string;
  title: string;
  summary: string;
  intent: string;
  status: OutcomeStatus;
  realityMode: RealityMode;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sourceModule: OutcomeSourceModule;
  sourceEntityId: string;
  projectId?: string;
  resultType: string;
  resultLocation: string;
  usageInstructions: string;
  nextActions: OutcomeNextAction[];
  limitations: string[];
  deliverableIds: string[];
  evidenceIds: string[];
  verificationState: OutcomeVerificationState;
  version: number;
  blockedReason?: string;
  simulationAcknowledgement?: SimulationAcknowledgement;
  [key: string]: unknown;
}

export interface OutcomeStore {
  schemaVersion: 2;
  actorId: string;
  outcomes: Outcome[];
  deliverables: Deliverable[];
  evidence: OutcomeEvidence[];
  savedAt: string;
  checksum: string;
}

export interface OutcomeDiagnostic {
  code: "invalid-record" | "duplicate-id" | "unresolved-deliverable" | "unresolved-evidence" | "unresolved-outcome";
  domain: "outcomes" | "deliverables" | "evidence";
  recordId?: string;
  referenceId?: string;
}

export interface OutcomeRepositorySnapshot {
  outcomes: Outcome[];
  deliverables: Deliverable[];
  evidence: OutcomeEvidence[];
  diagnostics: OutcomeDiagnostic[];
  recovered: boolean;
}
