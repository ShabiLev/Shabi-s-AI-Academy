import type {
  ConnectedActionPreview,
  EvaluationExperiment,
  EvaluationFinding,
  EvaluationRubric,
  FailureCase,
  LocalizedText,
  TraceEvent,
  VersionedEntityRef,
} from "./types";

export const SAFE_ID = /^[a-z0-9][a-z0-9._-]{0,79}$/i;
export const HASH = /^fnv1a32-[a-f0-9]{8}$/;
const SECRET_KEY = /(?:api[-_]?key|secret|password|token|authorization|credential|private[-_]?key)/i;
const SECRET_VALUE = /(?:bearer\s+[a-z0-9._-]+|-----BEGIN [A-Z ]+PRIVATE KEY-----|(?:api[-_ ]?key|password|token)\s*[:=]\s*\S+)/i;
const LOCAL_PATH = /(?:[a-z]:[\\/]|\/(?:users|home|private|var)\/)/i;
const categories = new Set(["requirement gap", "hallucinated capability", "test fixture masking", "stale context", "scope creep", "self-approval", "permission violation", "accessibility regression", "security failure", "performance regression", "repository hygiene", "deployment mismatch"]);

export function boundedText(value: unknown, max = 500, allowEmpty = false): value is string {
  return typeof value === "string" && value.length <= max && (allowEmpty || value.trim().length > 0);
}

export function validLocalized(value: unknown, max = 500): value is LocalizedText {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return Object.keys(item).every((key) => key === "he" || key === "en")
    && boundedText(item.he, max) && boundedText(item.en, max);
}

export function hasUnsafeContent(value: unknown, depth = 0): boolean {
  if (depth > 24 || typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => hasUnsafeContent(item, depth + 1));
  const record = value as Record<string, unknown>;
  return Object.keys(record).some((key) =>
    ["__proto__", "prototype", "constructor"].includes(key) || SECRET_KEY.test(key))
    || Object.values(record).some((item) => hasUnsafeContent(item, depth + 1));
}

export const isIsoDate = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));

export function validateEntityRef(value: unknown): value is VersionedEntityRef {
  if (!value || typeof value !== "object") return false;
  const ref = value as VersionedEntityRef;
  return SAFE_ID.test(ref.entityId) && /^[0-9]+(?:\.[0-9]+){0,2}$/.test(ref.version) && HASH.test(ref.contentHash);
}

export function validateRubric(value: unknown, allowSystem = false): value is EvaluationRubric {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const rubric = value as EvaluationRubric;
  if (rubric.schemaVersion !== 1 || !SAFE_ID.test(rubric.id) || !validLocalized(rubric.name)
    || !validLocalized(rubric.description, 1_000) || !["system", "user"].includes(rubric.source)
    || (rubric.source === "system" && !allowSystem) || !Array.isArray(rubric.criteria)
    || rubric.criteria.length < 1 || rubric.criteria.length > 20 || rubric.totalWeight !== 100
    || !Number.isFinite(rubric.passingScore) || rubric.passingScore < 0 || rubric.passingScore > 100
    || !isIsoDate(rubric.createdAt) || !isIsoDate(rubric.updatedAt)) return false;
  const ids = new Set<string>();
  const calculatedWeight = rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (Math.abs(calculatedWeight - 100) > Number.EPSILON * 100) return false;
  return rubric.criteria.every((criterion) => {
    if (!SAFE_ID.test(criterion.id) || ids.has(criterion.id)) return false;
    ids.add(criterion.id);
    const scale = criterion.scoringScale;
    return validLocalized(criterion.name) && validLocalized(criterion.description, 1_000)
      && Number.isFinite(criterion.weight) && criterion.weight > 0 && criterion.weight <= 100
      && Number.isFinite(scale?.min) && Number.isFinite(scale?.max) && scale.min < scale.max
      && Array.isArray(scale.anchors) && scale.anchors.length >= 2 && scale.anchors.length <= 10
      && scale.anchors.every((anchor) => Number.isFinite(anchor.score) && anchor.score >= scale.min
        && anchor.score <= scale.max && validLocalized(anchor.label))
      && Array.isArray(criterion.requiredEvidenceTypes)
      && criterion.requiredEvidenceTypes.length > 0;
  }) && Number.isInteger(rubric.evidencePolicy?.minimumPerCriterion)
    && rubric.evidencePolicy.minimumPerCriterion >= 1 && rubric.evidencePolicy.minimumPerCriterion <= 10
    && typeof rubric.evidencePolicy.requireIndependentEvaluator === "boolean";
}

export function validateExperiment(value: unknown, actorId: string): value is EvaluationExperiment {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as EvaluationExperiment;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id) && item.actorId === actorId
    && boundedText(item.name, 160) && SAFE_ID.test(item.missionSnapshotId)
    && Array.isArray(item.competitorIds) && item.competitorIds.length >= 2 && item.competitorIds.length <= 5
    && new Set(item.competitorIds).size === item.competitorIds.length && item.competitorIds.every((id) => SAFE_ID.test(id))
    && SAFE_ID.test(item.rubricId) && Array.isArray(item.evaluatorIds) && item.evaluatorIds.length >= 1
    && item.evaluatorIds.length <= 8 && new Set(item.evaluatorIds).size === item.evaluatorIds.length
    && item.evaluatorIds.every((id) => SAFE_ID.test(id)) && Number.isInteger(item.repetitionCount)
    && item.repetitionCount >= 1 && item.repetitionCount <= 20 && boundedText(item.seed, 128)
    && ["draft", "ready", "running", "paused", "needs-evidence", "completed", "cancelled", "blocked"].includes(item.status)
    && Array.isArray(item.resultIds) && item.resultIds.length <= 100 && item.resultIds.every((id) => SAFE_ID.test(id))
    && isIsoDate(item.createdAt) && isIsoDate(item.updatedAt)
    && (item.completedAt === undefined || isIsoDate(item.completedAt));
}

export function validateFinding(finding: EvaluationFinding, rubric: EvaluationRubric): boolean {
  const criterion = rubric.criteria.find((item) => item.id === finding.criterionId);
  if (!criterion || !SAFE_ID.test(finding.evaluatorId)
    || (finding.implementationOwnerId !== undefined && !SAFE_ID.test(finding.implementationOwnerId))
    || !["pass", "fail", "partial", "not-scored"].includes(finding.status)
    || !["low", "medium", "high"].includes(finding.confidence) || !validLocalized(finding.summary, 1_000)
    || !Array.isArray(finding.evidenceIds) || finding.evidenceIds.some((id) => !SAFE_ID.test(id))
    || !Array.isArray(finding.missingEvidence) || !finding.missingEvidence.every((item) => validLocalized(item))
    || !Array.isArray(finding.remediation) || !finding.remediation.every((item) => validLocalized(item))) return false;
  if (finding.status === "not-scored") return finding.score === undefined;
  return Number.isFinite(finding.score) && finding.score! >= criterion.scoringScale.min
    && finding.score! <= criterion.scoringScale.max && finding.evidenceIds.length > 0;
}

export function validateTrace(event: unknown): event is TraceEvent {
  if (!event || typeof event !== "object" || hasUnsafeContent(event)) return false;
  const item = event as TraceEvent;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id) && SAFE_ID.test(item.runId)
    && Number.isInteger(item.sequence) && item.sequence >= 0 && isIsoDate(item.timestamp)
    && ["user", "conductor", "agent", "evaluator", "system"].includes(item.actorType)
    && SAFE_ID.test(item.actorId) && validLocalized(item.summary, 1_000)
    && !LOCAL_PATH.test(item.summary.he) && !LOCAL_PATH.test(item.summary.en)
    && Array.isArray(item.evidenceIds) && item.evidenceIds.length <= 30 && item.evidenceIds.every((id) => SAFE_ID.test(id));
}

export function validateFailureCase(value: unknown): value is FailureCase {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as FailureCase;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id) && validLocalized(item.title)
    && categories.has(item.category) && validLocalized(item.symptom, 1_000) && validLocalized(item.rootCause, 1_000)
    && validLocalized(item.missedSignal, 1_000) && validLocalized(item.correctiveAction, 1_000)
    && validLocalized(item.reusableRule, 1_000) && item.evidenceIds.every((id) => SAFE_ID.test(id))
    && item.sourceRunIds.every((id) => SAFE_ID.test(id)) && isIsoDate(item.createdAt) && isIsoDate(item.updatedAt);
}

export function validatePreview(value: unknown): value is ConnectedActionPreview {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as ConnectedActionPreview;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id) && boundedText(item.connectorType, 40)
    && boundedText(item.actionType, 80) && boundedText(item.targetSummary, 240)
    && validLocalized(item.payloadSummary, 2_000) && item.requiredPermissions.length <= 12
    && !SECRET_VALUE.test(item.targetSummary) && !SECRET_VALUE.test(item.payloadSummary.he) && !SECRET_VALUE.test(item.payloadSummary.en)
    && item.requiredPermissions.every((permission) => boundedText(permission, 80))
    && ["low", "medium", "high"].includes(item.riskLevel) && typeof item.reversible === "boolean"
    && ["draft", "ready", "unavailable", "expired"].includes(item.status)
    && isIsoDate(item.createdAt) && isIsoDate(item.expiresAt) && Date.parse(item.expiresAt) > Date.parse(item.createdAt);
}
