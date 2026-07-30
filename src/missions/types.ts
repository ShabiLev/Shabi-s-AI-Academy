export interface LocalizedText {
  he: string;
  en: string;
}

export type AgentPermission =
  | "observe"
  | "recommend"
  | "plan"
  | "implement"
  | "validate"
  | "approve"
  | "execute-local"
  | "execute-connected";

export type ExecutionLevel =
  | "explain"
  | "simulate"
  | "dry-run"
  | "local-execute"
  | "connected-execute";

export type GuidanceMode = "teach" | "guided" | "expert" | "audit-only";
export type CatalogSource = "system" | "community" | "user";

export interface AgentSource {
  repository?: string;
  revision?: string;
  path?: string;
  license?: string;
  adapted: boolean;
}

export interface AgentDefinition {
  schemaVersion: 1;
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  purpose: LocalizedText;
  inputs: LocalizedText[];
  outputs: LocalizedText[];
  permissions: AgentPermission[];
  gates: string[];
  source: CatalogSource;
  sourceDetails?: AgentSource;
  active: boolean;
}

export interface AgentTeam {
  schemaVersion: 1;
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  source: "system" | "user";
  conductorAgentId: string;
  memberAgentIds: string[];
  phaseIds: string[];
  createdAt: string;
  updatedAt: string;
  sourcePresetId?: string;
}

export interface MissionInterpretation {
  goal: string;
  summary: LocalizedText;
  goals: LocalizedText[];
  acceptanceCriteria: LocalizedText[];
  assumptions: LocalizedText[];
  missingInformation: LocalizedText[];
  risks: LocalizedText[];
}

export type MissionStatus =
  | "draft"
  | "awaiting-plan-approval"
  | "ready"
  | "running"
  | "paused"
  | "needs-input"
  | "needs-work"
  | "completed"
  | "cancelled"
  | "blocked";

export type MissionPhaseStatus =
  | "pending"
  | "active"
  | "passed"
  | "failed"
  | "paused"
  | "skipped";

export interface MissionPhase {
  id: string;
  title: LocalizedText;
  ownerAgentId: string;
  reviewerAgentId?: string;
  requiredPermission: AgentPermission;
  status: MissionPhaseStatus;
  inputSummary: string;
  outputSummary?: string;
  gate: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MissionEvidence {
  id: string;
  phaseId: string;
  kind: "interpretation" | "plan" | "handoff" | "gate" | "learning" | "system";
  result: "PASS" | "FAIL" | "INFO";
  summary: LocalizedText;
  recordedAt: string;
}

export interface PauseCheckpoint {
  phaseId: string;
  transitionCount: number;
  fingerprint: string;
  pausedAt: string;
}

export interface Mission {
  schemaVersion: 1;
  id: string;
  actorId: string;
  title: string;
  language: "he" | "en";
  interpretation: MissionInterpretation;
  teamId: string;
  guidanceMode: GuidanceMode;
  executionLevel: ExecutionLevel;
  status: MissionStatus;
  phases: MissionPhase[];
  currentPhaseIndex: number;
  currentPhaseId?: string;
  transitionCount: number;
  evidence: MissionEvidence[];
  contextPackIds: string[];
  createdAt: string;
  updatedAt: string;
  pauseCheckpoint?: PauseCheckpoint;
  blockedReason?: string;
  pausedAt?: string;
  completedAt?: string;
  learningSummary?: {
    summary: LocalizedText;
    demonstratedSkillIds: string[];
    nextPracticeRoute: string;
  };
}

export interface SkillDefinition {
  id: string;
  name: LocalizedText;
  relatedAgentIds: string[];
  lessonRoute: string;
}

export type SkillLevel = "not-introduced" | "introduced" | "practised" | "demonstrated" | "mastered" | "needs-reinforcement";
export type SkillEvidenceSource = "lesson" | "exercise" | "mission" | "evaluation";

export interface SkillEvidence {
  id: string;
  skillId: string;
  source: SkillEvidenceSource;
  sourceId: string;
  completedAt: string;
  outcome?: "practice" | "demonstrated";
  evaluatorId?: string;
  confidence?: "low" | "medium" | "high";
  evidenceIds?: string[];
}

export interface SkillProgress {
  skillId: string;
  level: SkillLevel;
  evidence: SkillEvidence[];
}

export interface ContextPackReference {
  entityType: "lesson" | "prompt" | "agent" | "project" | "document" | "mission";
  entityId: string;
  label: string;
}

export interface ContextPack {
  schemaVersion: 1;
  id: string;
  name: LocalizedText;
  description: string;
  note: string;
  sourceIds: string[];
  excludedSourceIds: string[];
  allowedAgentIds: string[];
  sensitivity: "public" | "local-private" | "connected-private";
  owner: string;
  sizeBytes: number;
  validationStatus: "valid" | "invalid";
  freshness: "current" | "stale" | "unknown";
  references: ContextPackReference[];
  createdAt: string;
  updatedAt: string;
}

export type MissionAnalyticsEventType =
  | "mission_created"
  | "mission_plan_approved"
  | "mission_started"
  | "mission_paused"
  | "mission_resumed"
  | "mission_completed"
  | "mission_blocked"
  | "team_preset_used"
  | "agent_added"
  | "agent_removed"
  | "quality_gate_failed"
  | "quality_gate_passed"
  | "learning_mode_selected";

export interface MissionAnalyticsEvent {
  type: MissionAnalyticsEventType;
  timestamp: string;
  category?: string;
  quality?: number;
}

export interface MissionStore {
  schemaVersion: 1;
  missions: Mission[];
}

export interface TeamStore {
  schemaVersion: 1;
  teams: AgentTeam[];
}

export interface SkillStore {
  schemaVersion: 1;
  progress: SkillProgress[];
}

export interface ContextPackStore {
  schemaVersion: 1;
  packs: ContextPack[];
}

export interface MissionAnalyticsStore {
  schemaVersion: 1;
  events: MissionAnalyticsEvent[];
}
