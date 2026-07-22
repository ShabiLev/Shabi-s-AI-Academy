export const RUNTIME_SCHEMA_VERSION = 1;
export const RUNTIME_VERSION = "1.5.0-beta.1";
export const RUNTIME_STORAGE_KEY = "shabis-ai-academy.runtime.runs.v1";
export const MAX_RUNTIME_RUNS = 50;

export type ExecutionMode = "mock" | "dryRun" | "liveReserved";
export type RunStatus =
  | "draft"
  | "queued"
  | "running"
  | "waitingForApproval"
  | "retrying"
  | "completed"
  | "failed"
  | "cancelled";
export type MockScenario =
  | "success"
  | "validationFailure"
  | "retryThenSuccess"
  | "retryExhausted"
  | "approvalRequired"
  | "approvalRejected"
  | "cancelled";
export type RuntimeErrorCode =
  | "invalidRequest"
  | "invalidTransition"
  | "unknownProvider"
  | "providerNotConfigured"
  | "validationFailed"
  | "approvalRejected"
  | "retryExhausted"
  | "cancelled"
  | "storageUnavailable"
  | "corruptedStorage"
  | "unsupportedSchema"
  | "internalRuntimeError";
export type RuntimeLayer =
  | "validation"
  | "stateMachine"
  | "provider"
  | "approval"
  | "retry"
  | "storage"
  | "runtime";
export type ApprovalDecision = "pending" | "approved" | "rejected";
export type RiskLevel = "none" | "low" | "medium" | "high";
export type BackoffStrategy = "none" | "fixed" | "incremental" | "exponential";

export interface ValidationIssue {
  field: string;
  code: string;
  message: string;
}
export interface ValidationOutcome {
  valid: boolean;
  issues: ValidationIssue[];
}
export interface RuntimeError {
  code: RuntimeErrorCode;
  messageKey: string;
  safeMessage: string;
  retryable: boolean;
  affectedLayer: RuntimeLayer;
  recoveryAction: string;
  developerDetail?: string;
}
export interface RetryPolicy {
  maxAttempts: number;
  retryableErrorCodes: string[];
  backoffStrategy: BackoffStrategy;
  fallbackAction: "fail" | "cancel";
  stopCondition: string;
}
export interface ApprovalRequest {
  id: string;
  runId: string;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  proposedAction: string;
  consequenceSummary: string;
  required: boolean;
  requestedAt: string;
  decidedAt?: string;
  decision: ApprovalDecision;
  approverRole: string;
}
export interface RunRequest {
  id: string;
  schemaVersion: number;
  runtimeVersion: string;
  mode: ExecutionMode;
  providerId: string;
  input: string;
  systemInstruction: string;
  variables: Record<string, string>;
  plannedToolIds: string[];
  scenario: MockScenario;
  requestedAt: string;
}
export interface RunEvent {
  id: string;
  runId: string;
  sequence: number;
  timestamp: string;
  kind: string;
  status: RunStatus;
  safeSummary: string;
  details?: Record<string, string | number | boolean>;
}
export interface ProviderStatus {
  id: string;
  name: string;
  status: "mockReady" | "notConfigured" | "disabled";
  capabilities: string[];
  reason: string;
}
export interface ProviderRunResponse {
  outcome:
    | "success"
    | "validationFailure"
    | "retryableFailure"
    | "failure"
    | "approvalRequired"
    | "cancelled";
  output?: string;
  safeSummary: string;
  warnings: string[];
  errorCode?: string;
}
export interface DryRunPreview {
  label: string;
  assembledPrompt: string;
  normalizedInput: string;
  variables: Record<string, string>;
  plannedTools: string[];
  approvalPoints: string[];
  estimatedSteps: string[];
  warnings: string[];
  providerStatus: ProviderStatus;
  privacyNotice: string;
}
export interface RunContext {
  request: RunRequest;
  normalizedInput: string;
  attempt: number;
  now: () => string;
  nextId: () => string;
  isCancelled: () => boolean;
}
export interface RunResult {
  status: RunStatus;
  output?: string;
  dryRunPreview?: DryRunPreview;
  validation: ValidationOutcome;
  attempts: number;
  startedAt?: string;
  completedAt?: string;
  warnings: string[];
  events: RunEvent[];
  approval?: ApprovalRequest;
  error?: RuntimeError;
}
export interface RuntimeHistoryRecord {
  schemaVersion: number;
  runtimeVersion: string;
  id: string;
  request: RunRequest;
  result: RunResult;
  createdAt: string;
  updatedAt: string;
}
export interface RuntimeState {
  status: RunStatus;
  events: RunEvent[];
}
export interface TransitionResult {
  ok: boolean;
  state: RuntimeState;
  error?: RuntimeError;
}
