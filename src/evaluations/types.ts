export interface LocalizedText {
  he: string;
  en: string;
}

export type EvidenceType =
  | "requirement"
  | "output"
  | "test"
  | "accessibility"
  | "security"
  | "performance"
  | "trace"
  | "review";

export interface EvidencePolicy {
  minimumPerCriterion: number;
  requireIndependentEvaluator: boolean;
}

export interface ScoreAnchor {
  score: number;
  label: LocalizedText;
}

export interface RubricCriterion {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  weight: number;
  scoringScale: { min: number; max: number; anchors: ScoreAnchor[] };
  requiredEvidenceTypes: EvidenceType[];
  blocking: boolean;
}

export interface EvaluationRubric {
  schemaVersion: 1;
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  source: "system" | "user";
  sourceRubricId?: string;
  lineageId?: string;
  version?: string;
  parentVersionRef?: VersionedEntityRef;
  criteria: RubricCriterion[];
  totalWeight: number;
  passingScore: number;
  evidencePolicy: EvidencePolicy;
  createdAt: string;
  updatedAt: string;
}

export type EvaluationStatus =
  | "draft"
  | "ready"
  | "running"
  | "paused"
  | "needs-evidence"
  | "completed"
  | "cancelled"
  | "blocked";

export interface VersionedEntityRef {
  entityId: string;
  version: string;
  contentHash: string;
}

export interface EvaluationExperiment {
  schemaVersion: 1;
  id: string;
  actorId: string;
  name: string;
  missionSnapshotId: string;
  competitorIds: string[];
  rubricId: string;
  evaluatorIds: string[];
  repetitionCount: number;
  seed: string;
  status: EvaluationStatus;
  resultIds: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ImmutableSnapshot<T = unknown> {
  schemaVersion: 1;
  id: string;
  entityRef: VersionedEntityRef;
  value: T;
  createdAt: string;
}

export interface EvaluationEvidence {
  schemaVersion: 1;
  id: string;
  type: EvidenceType;
  summary: LocalizedText;
  contentHash: string;
  sourceActorId: string;
  createdAt: string;
}

export interface EvaluationFinding {
  criterionId: string;
  evaluatorId: string;
  implementationOwnerId?: string;
  status: "pass" | "fail" | "partial" | "not-scored";
  score?: number;
  confidence: "low" | "medium" | "high";
  summary: LocalizedText;
  evidenceIds: string[];
  missingEvidence: LocalizedText[];
  remediation: LocalizedText[];
}

export interface CriterionScore {
  criterionId: string;
  status: EvaluationFinding["status"] | "disagreement";
  normalizedScore?: number;
  weightedScore?: number;
  findings: EvaluationFinding[];
}

export interface CertificationResult {
  status: "certified" | "failed" | "needs-evidence" | "blocked";
  score?: number;
  passingScore: number;
  criteria: CriterionScore[];
  reasons: LocalizedText[];
}

export interface EvaluationProgress {
  competitorIndex: number;
  repetitionIndex: number;
  evaluatorIndex: number;
}

export interface EvaluationRun {
  schemaVersion: 1;
  id: string;
  actorId: string;
  experimentId: string;
  status: Exclude<EvaluationStatus, "draft" | "ready">;
  inputHash: string;
  frozenRefs: VersionedEntityRef[];
  progress: EvaluationProgress;
  resultIds: string[];
  results: EvaluationCompetitorResult[];
  evidenceIds: string[];
  startedAt: string;
  updatedAt: string;
  pausedAt?: string;
  completedAt?: string;
  cancellationReason?: string;
}

export interface EvaluationCompetitorResult {
  schemaVersion: 1;
  id: string;
  runId: string;
  competitorId: string;
  competitorRef: VersionedEntityRef;
  repetition: number;
  seed: string;
  evaluatorIds: string[];
  findings: EvaluationFinding[];
  evidence: EvaluationEvidence[];
  certification: CertificationResult;
  resultChecksum: string;
  completedAt: string;
}

export interface DeterministicEvaluationOutput {
  run: EvaluationRun;
  results: EvaluationCompetitorResult[];
  evidence: EvaluationEvidence[];
  traces: TraceEvent[];
}

export type TraceEventType =
  | "setup"
  | "snapshot"
  | "execution"
  | "evaluation"
  | "gate"
  | "evidence"
  | "retry"
  | "pause"
  | "resume"
  | "complete"
  | "cancel"
  | "block";

export interface SafeTraceMetadata {
  phase?: string;
  permission?: string;
  gateStatus?: "PASS" | "FAIL" | "INFO";
  evidenceType?: EvidenceType;
  evidenceTypes?: EvidenceType[];
  retry?: number;
  nextAction?: string;
  resultId?: string;
}

export interface TraceEvent {
  schemaVersion: 1;
  id: string;
  runId: string;
  sequence: number;
  timestamp: string;
  actorType: "user" | "conductor" | "agent" | "evaluator" | "system";
  actorId: string;
  eventType: TraceEventType;
  summary: LocalizedText;
  evidenceIds: string[];
  metadata: SafeTraceMetadata;
}

export interface EntityVersion<T = unknown> {
  schemaVersion: 1;
  entityId: string;
  version: string;
  contentHash: string;
  content: T;
  parentRef?: VersionedEntityRef;
  authorSource?: string;
  fieldChanges?: Array<{ path: string; before: string; after: string }>;
  changelog: LocalizedText;
  status: "active" | "inactive" | "deprecated";
  createdAt: string;
}

export interface EvaluationSuite {
  schemaVersion: 1;
  id: string;
  name: string;
  missionSnapshotIds: string[];
  rubricId: string;
  baselineEntityRefs: VersionedEntityRef[];
  status: "draft" | "ready" | "running" | "completed" | "blocked";
  createdAt: string;
  updatedAt: string;
  runHistory?: RegressionSuiteRun[];
}

export interface RegressionCaseResult {
  caseId: string;
  baselineScore?: number;
  candidateScore?: number;
  classification: "improvement" | "regression" | "no-change" | "not-scored";
  critical: boolean;
  evidenceIds: string[];
}

export interface RegressionSuiteRun {
  schemaVersion: 1;
  id: string;
  suiteId: string;
  baselineEntityRefs: VersionedEntityRef[];
  results: RegressionCaseResult[];
  status: "completed" | "blocked";
  createdAt: string;
  completedAt: string;
}

export type FailureCategory =
  | "requirement gap"
  | "hallucinated capability"
  | "test fixture masking"
  | "stale context"
  | "scope creep"
  | "self-approval"
  | "permission violation"
  | "accessibility regression"
  | "security failure"
  | "performance regression"
  | "repository hygiene"
  | "deployment mismatch";

export interface FailureCase {
  schemaVersion: 1;
  id: string;
  title: LocalizedText;
  category: FailureCategory;
  symptom: LocalizedText;
  rootCause: LocalizedText;
  missedSignal: LocalizedText;
  correctiveAction: LocalizedText;
  reusableRule: LocalizedText;
  evidenceIds: string[];
  sourceRunIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LearningEvidence {
  schemaVersion: 1;
  id: string;
  skillId: string;
  runId: string;
  outcome: "practice" | "demonstrated";
  evaluatorId: string;
  confidence: "low" | "medium" | "high";
  evidenceIds: string[];
  createdAt: string;
}

export interface TeamRecommendation {
  teamId: string;
  source: "System default" | "Observed locally" | "Community-derived" | "User preference";
  comparableRunCount: number;
  successRate: number;
  averageRetries: number;
  commonFailures: FailureCategory[];
  confidence: "low" | "medium" | "high";
  freshness: string;
  limitations: LocalizedText[];
}

export interface ConnectedActionPreview {
  schemaVersion: 1;
  id: string;
  connectorType: string;
  actionType: string;
  targetSummary: string;
  payloadSummary: LocalizedText;
  requiredPermissions: string[];
  riskLevel: "low" | "medium" | "high";
  reversible: boolean;
  recoveryPlan?: LocalizedText;
  status: "draft" | "ready" | "unavailable" | "expired";
  createdAt: string;
  expiresAt: string;
}

export interface EvaluationRepositorySnapshot {
  rubrics: EvaluationRubric[];
  experiments: EvaluationExperiment[];
  runs: EvaluationRun[];
  suites: EvaluationSuite[];
  failures: FailureCase[];
  versions: EntityVersion[];
  previews: ConnectedActionPreview[];
  evidence: EvaluationEvidence[];
  traces: TraceEvent[];
  recoveredDomains: string[];
}
