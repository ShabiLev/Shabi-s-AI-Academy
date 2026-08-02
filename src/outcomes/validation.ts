import {
  OUTCOME_STATUSES,
  REALITY_MODES,
  type Deliverable,
  type Outcome,
  type OutcomeDiagnostic,
  type OutcomeEvidence,
  type OutcomeSourceModule,
  type OutcomeStore,
} from "./types";

const ID = /^[a-z0-9][a-z0-9._-]{0,119}$/i;
const HASH = /^[a-z0-9][a-z0-9._:-]{3,159}$/i;
const SOURCE_MODULES = new Set<OutcomeSourceModule>(["prompt", "agent", "team", "mission", "project", "workflow", "knowledge", "lesson"]);
const VERIFICATION_STATES = new Set(["unverified", "needs-evidence", "verified", "failed"]);

export function hasDangerousOutcomeKeys(value: unknown, depth = 0): boolean {
  if (depth > 30) return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => hasDangerousOutcomeKeys(item, depth + 1));
  const record = value as Record<string, unknown>;
  return ["__proto__", "prototype", "constructor"].some((key) => Object.prototype.hasOwnProperty.call(record, key))
    || Object.values(record).some((item) => hasDangerousOutcomeKeys(item, depth + 1));
}

const bounded = (value: unknown, max: number, allowEmpty = false): value is string =>
  typeof value === "string" && value.length <= max && (allowEmpty || value.trim().length > 0);
const timestamp = (value: unknown): value is string => bounded(value, 40) && !Number.isNaN(Date.parse(value));
const ids = (value: unknown, max: number): value is string[] => Array.isArray(value) && value.length <= max
  && new Set(value).size === value.length && value.every((item) => typeof item === "string" && ID.test(item));

export function validateDeliverable(value: unknown, actorId?: string): value is Deliverable {
  if (!value || typeof value !== "object" || hasDangerousOutcomeKeys(value)) return false;
  const item = value as Deliverable;
  return item.schemaVersion === 2 && ID.test(item.id) && ID.test(item.actorId)
    && (!actorId || item.actorId === actorId) && ID.test(item.outcomeId)
    && bounded(item.title, 200) && bounded(item.resultType, 80) && bounded(item.location, 1_000)
    && bounded(item.usageInstructions, 4_000, true)
    && (item.sourceEntityId === undefined || ID.test(item.sourceEntityId))
    && (item.sourceEntityVersion === undefined || (Number.isInteger(item.sourceEntityVersion) && item.sourceEntityVersion > 0))
    && (item.contentHash === undefined || HASH.test(item.contentHash))
    && timestamp(item.createdAt) && timestamp(item.updatedAt) && Number.isInteger(item.version) && item.version > 0;
}

export function validateOutcomeEvidence(value: unknown, actorId?: string): value is OutcomeEvidence {
  if (!value || typeof value !== "object" || hasDangerousOutcomeKeys(value)) return false;
  const item = value as OutcomeEvidence;
  return item.schemaVersion === 2 && ID.test(item.id) && ID.test(item.actorId)
    && (!actorId || item.actorId === actorId) && ID.test(item.outcomeId)
    && (item.deliverableId === undefined || ID.test(item.deliverableId))
    && bounded(item.evidenceType, 80) && bounded(item.summary, 2_000)
    && ID.test(item.sourceEntityId) && Number.isInteger(item.sourceEntityVersion) && item.sourceEntityVersion > 0
    && HASH.test(item.contentHash) && VERIFICATION_STATES.has(item.verificationState)
    && timestamp(item.createdAt) && ID.test(item.createdBy)
    && (item.verifiedAt === undefined || timestamp(item.verifiedAt));
}

export function validateOutcome(value: unknown, actorId?: string): value is Outcome {
  if (!value || typeof value !== "object" || hasDangerousOutcomeKeys(value)) return false;
  const item = value as Outcome;
  const acknowledgement = item.simulationAcknowledgement;
  return item.schemaVersion === 2 && ID.test(item.id) && ID.test(item.actorId)
    && (!actorId || item.actorId === actorId) && bounded(item.title, 200) && bounded(item.summary, 4_000, true)
    && bounded(item.intent, 2_000) && OUTCOME_STATUSES.includes(item.status) && REALITY_MODES.includes(item.realityMode)
    && timestamp(item.createdAt) && timestamp(item.updatedAt) && ID.test(item.createdBy)
    && SOURCE_MODULES.has(item.sourceModule) && ID.test(item.sourceEntityId)
    && (item.projectId === undefined || ID.test(item.projectId)) && bounded(item.resultType, 80)
    && bounded(item.resultLocation, 1_000) && bounded(item.usageInstructions, 4_000, true)
    && Array.isArray(item.nextActions) && item.nextActions.length <= 20
    && item.nextActions.every((action) => Boolean(action) && ID.test(action.id) && bounded(action.label, 200)
      && (action.route === undefined || (bounded(action.route, 500) && action.route.startsWith("/"))))
    && Array.isArray(item.limitations) && item.limitations.length <= 30 && item.limitations.every((entry) => bounded(entry, 1_000))
    && ids(item.deliverableIds, 200) && ids(item.evidenceIds, 500)
    && VERIFICATION_STATES.has(item.verificationState) && Number.isInteger(item.version) && item.version > 0
    && (item.blockedReason === undefined || bounded(item.blockedReason, 2_000))
    && (acknowledgement === undefined || (timestamp(acknowledgement.acknowledgedAt)
      && ID.test(acknowledgement.acknowledgedBy) && bounded(acknowledgement.statement, 1_000)));
}

export function outcomeGraphDiagnostics(store: Pick<OutcomeStore, "outcomes" | "deliverables" | "evidence">): OutcomeDiagnostic[] {
  const diagnostics: OutcomeDiagnostic[] = [];
  const outcomeIds = new Set(store.outcomes.map((item) => item.id));
  const deliverableIds = new Set(store.deliverables.map((item) => item.id));
  const evidenceIds = new Set(store.evidence.map((item) => item.id));
  for (const outcome of store.outcomes) {
    for (const referenceId of outcome.deliverableIds) if (!deliverableIds.has(referenceId)) diagnostics.push({ code: "unresolved-deliverable", domain: "outcomes", recordId: outcome.id, referenceId });
    for (const referenceId of outcome.evidenceIds) if (!evidenceIds.has(referenceId)) diagnostics.push({ code: "unresolved-evidence", domain: "outcomes", recordId: outcome.id, referenceId });
  }
  for (const deliverable of store.deliverables) if (!outcomeIds.has(deliverable.outcomeId)) diagnostics.push({ code: "unresolved-outcome", domain: "deliverables", recordId: deliverable.id, referenceId: deliverable.outcomeId });
  for (const item of store.evidence) {
    if (!outcomeIds.has(item.outcomeId)) diagnostics.push({ code: "unresolved-outcome", domain: "evidence", recordId: item.id, referenceId: item.outcomeId });
    if (item.deliverableId && !deliverableIds.has(item.deliverableId)) diagnostics.push({ code: "unresolved-deliverable", domain: "evidence", recordId: item.id, referenceId: item.deliverableId });
  }
  return diagnostics;
}

export function hasOutcomeSubstantiation(outcome: Outcome): boolean {
  return outcome.deliverableIds.length > 0 || outcome.evidenceIds.length > 0
    || (outcome.realityMode === "simulated" && outcome.simulationAcknowledgement !== undefined);
}

export function validateOutcomeClaims(outcome: Outcome): string[] {
  const errors: string[] = [];
  if (outcome.status === "completed" && !hasOutcomeSubstantiation(outcome)) errors.push("completion-requires-substantiation");
  if (outcome.status === "verified" && (outcome.evidenceIds.length === 0 || outcome.verificationState !== "verified")) errors.push("verification-requires-evidence");
  if (outcome.status === "blocked" && !outcome.blockedReason?.trim()) errors.push("blocked-requires-reason");
  if (outcome.realityMode !== "simulated" && outcome.status === "simulated") errors.push("simulated-status-requires-simulated-reality");
  return errors;
}
