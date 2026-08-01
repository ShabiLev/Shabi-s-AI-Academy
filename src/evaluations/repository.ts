import { builtInRubrics } from "./catalog";
import { deterministicHash } from "./hash";
import { calculateEvaluationResultChecksum } from "./runtime";
import { certifyFindings } from "./scoring";
import type {
  CertificationResult,
  EntityVersion,
  EvaluationCompetitorResult,
  EvaluationEvidence,
  EvaluationExperiment,
  EvaluationRepositorySnapshot,
  EvaluationRubric,
  EvaluationRun,
  EvaluationSuite,
} from "./types";
import {
  hasUnsafeContent,
  hasSensitiveText,
  isIsoDate,
  SAFE_ID,
  validateExperiment,
  validateEntityRef,
  validateFailureCase,
  validatePreview,
  validateRubric,
  validateTrace,
} from "./validation";

const MAX_BYTES = 2_000_000;
const RETENTION_DAYS = 180;
const LIMITS = {
  rubrics: 100,
  experiments: 100,
  runs: 200,
  suites: 100,
  failures: 200,
  versions: 500,
  previews: 100,
  evidence: 1_000,
  traces: 5_000,
} as const;
export type EvaluationDomain = keyof typeof LIMITS;
type Domain = EvaluationDomain;

export const normalizeEvaluationActorId = (actorId: string) =>
  actorId.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 80) || "local-guest";

export const evaluationStorageKeys = (actorId: string) => {
  const actor = normalizeEvaluationActorId(actorId);
  return {
    rubrics: `shabis-ai-academy:evaluation-rubrics:v1:${actor}`,
    experiments: `shabis-ai-academy:evaluation-experiments:v1:${actor}`,
    runs: `shabis-ai-academy:evaluation-runs:v1:${actor}`,
    suites: `shabis-ai-academy:evaluation-suites:v1:${actor}`,
    failures: `shabis-ai-academy:failure-library:v1:${actor}`,
    versions: `shabis-ai-academy:entity-versions:v1:${actor}`,
    previews: `shabis-ai-academy:connected-previews:v1:${actor}`,
    evidence: `shabis-ai-academy:evaluation-evidence:v1:${actor}`,
    traces: `shabis-ai-academy:evaluation-traces:v1:${actor}`,
  } as const;
};

interface StoredDomain {
  schemaVersion: 1;
  actorId: string;
  items: unknown[];
  checksum: string;
  savedAt: string;
}

const empty = (): EvaluationRepositorySnapshot => ({
  rubrics: [],
  experiments: [],
  runs: [],
  suites: [],
  failures: [],
  versions: [],
  previews: [],
  evidence: [],
  traces: [],
  recoveredDomains: [],
});

const encodedBytes = (value: string) => new TextEncoder().encode(value).byteLength;
const unsigned = (stored: Omit<StoredDomain, "checksum">) => stored;

function quarantine(storage: Pick<Storage, "setItem">, key: string, raw: string): void {
  try {
    storage.setItem(`${key}:quarantine:${Date.now()}`, raw.slice(0, 200_000));
  } catch {
    // Recovery remains available in memory when quarantine storage is full.
  }
}

function validateRun(value: unknown, actorId: string): value is EvaluationRun {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const run = value as EvaluationRun;
  return run.schemaVersion === 1 && SAFE_ID.test(run.id) && run.actorId === actorId
    && SAFE_ID.test(run.experimentId) && ["running", "paused", "needs-evidence", "completed", "cancelled", "blocked"].includes(run.status)
    && /^fnv1a32-[a-f0-9]{8}$/.test(run.inputHash) && Array.isArray(run.frozenRefs)
    && run.frozenRefs.length <= 20 && run.frozenRefs.every(validateEntityRef)
    && Array.isArray(run.resultIds) && run.resultIds.length <= 100 && run.resultIds.every((id) => SAFE_ID.test(id))
    && Array.isArray(run.evidenceIds) && run.evidenceIds.length <= 1_000 && run.evidenceIds.every((id) => SAFE_ID.test(id))
    && Array.isArray(run.results) && run.results.length <= 100
    && run.results.every((result) => result.schemaVersion === 1 && SAFE_ID.test(result.id)
      && result.runId === run.id && SAFE_ID.test(result.competitorId) && result.competitorId === result.competitorRef.entityId
      && validateEntityRef(result.competitorRef)
      && run.frozenRefs.some((ref) => ref.entityId === result.competitorRef.entityId && ref.version === result.competitorRef.version && ref.contentHash === result.competitorRef.contentHash)
      && Array.isArray(result.evaluatorIds) && result.evaluatorIds.length > 0
      && result.evaluatorIds.every((id) => SAFE_ID.test(id) && run.frozenRefs.some((ref) => ref.entityId === id))
      && Number.isInteger(result.repetition)
      && result.repetition >= 0 && /^fnv1a32-[a-f0-9]{8}$/.test(result.resultChecksum)
      && Array.isArray(result.findings) && Array.isArray(result.evidence)
      && result.evidence.every((item) => validateEvidence(item, actorId))
      && new Set(result.evidence.map((item) => item.id)).size === result.evidence.length
      && result.findings.every((finding) => Array.isArray(finding.evidenceIds)
        && finding.evidenceIds.every((id) => result.evidence.some((item) => item.id === id)))
      && result.evidence.every((item) => result.findings.some((finding) => finding.evidenceIds.includes(item.id)))
      && calculateEvaluationResultChecksum(run.inputHash, result) === result.resultChecksum
      && isIsoDate(result.completedAt))
    && new Set(run.resultIds).size === run.resultIds.length && new Set(run.evidenceIds).size === run.evidenceIds.length
    && run.resultIds.length === run.results.length
    && run.resultIds.every((resultId, index) => run.results[index]?.id === resultId)
    && run.evidenceIds.length === run.results.reduce((sum, result) => sum + result.evidence.length, 0)
    && run.evidenceIds.every((evidenceId) => run.results.some((result) => result.evidence.some((item) => item.id === evidenceId)))
    && isIsoDate(run.startedAt) && isIsoDate(run.updatedAt);
}

const IMPORT_REVALIDATION_REASON = "Imported result requires local revalidation.";

function isVerifiedImportDowngrade(actual: CertificationResult, expected: CertificationResult): boolean {
  if (actual.status !== "needs-evidence" || actual.score !== undefined
    || actual.passingScore !== expected.passingScore
    || deterministicHash(actual.criteria) !== deterministicHash(expected.criteria)
    || actual.reasons.length !== expected.reasons.length + 1) return false;
  const originalReasons = actual.reasons.slice(0, -1);
  const importReason = actual.reasons.at(-1);
  return deterministicHash(originalReasons) === deterministicHash(expected.reasons)
    && importReason?.en === IMPORT_REVALIDATION_REASON;
}

function hasValidCertification(
  run: EvaluationRun,
  result: EvaluationCompetitorResult,
  experiments: readonly EvaluationExperiment[],
  rubrics: readonly EvaluationRubric[],
  versions: readonly EntityVersion[],
): boolean {
  const experiment = experiments.find((item) => item.id === run.experimentId);
  const frozenRubrics = run.frozenRefs.flatMap((ref) => {
    const stored = versions.find((item) => item.entityId === ref.entityId && item.version === ref.version
      && item.contentHash === ref.contentHash && deterministicHash(item.content) === ref.contentHash);
    if (stored && validateRubric(stored.content, true)) return [stored.content];
    const builtIn = builtInRubrics.find((item) => item.id === ref.entityId
      && (item.version ?? "1.0.0") === ref.version && deterministicHash(item) === ref.contentHash);
    return builtIn ? [builtIn] : [];
  });
  const rubric = frozenRubrics.find((item) => !experiment || (item.id === experiment.rubricId
    && (item.lineageId ?? item.id) === run.frozenRefs.find((ref) => ref.contentHash === deterministicHash(item))?.entityId));
  if (!rubric) return false;
  const realityCheckerBlocked = result.findings.some((finding) => finding.evaluatorId === "reality-checker" && finding.status === "fail");
  const expected = certifyFindings(rubric, result.findings, result.evidence, realityCheckerBlocked);
  if (deterministicHash(result.certification) === deterministicHash(expected)) return true;
  return isVerifiedImportDowngrade(result.certification, expected);
}

function hasValidRepositoryCertifications(snapshot: EvaluationRepositorySnapshot): boolean {
  return snapshot.runs.every((run) => run.results.every((item) => hasValidCertification(
    run, item, snapshot.experiments, snapshot.rubrics, snapshot.versions,
  )));
}

function validateSuite(value: unknown): value is EvaluationSuite {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as EvaluationSuite;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id) && typeof item.name === "string" && item.name.length <= 160
    && item.missionSnapshotIds.length <= 100 && item.missionSnapshotIds.every((id) => SAFE_ID.test(id))
    && SAFE_ID.test(item.rubricId) && item.baselineEntityRefs.length <= 100
    && ["draft", "ready", "running", "completed", "blocked"].includes(item.status)
    && (item.runHistory === undefined || (Array.isArray(item.runHistory) && item.runHistory.length <= 100
      && item.runHistory.every((run) => run.schemaVersion === 1 && SAFE_ID.test(run.id) && run.suiteId === item.id
        && ["completed", "blocked"].includes(run.status) && Array.isArray(run.results)
        && run.results.length === item.missionSnapshotIds.length && Array.isArray(run.baselineEntityRefs)
        && isIsoDate(run.createdAt) && isIsoDate(run.completedAt))))
    && isIsoDate(item.createdAt) && isIsoDate(item.updatedAt);
}

function validateVersion(value: unknown): value is EntityVersion {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as EntityVersion;
  return item.schemaVersion === 1 && SAFE_ID.test(item.entityId) && /^[0-9]+(?:\.[0-9]+){0,2}$/.test(item.version)
    && /^fnv1a32-[a-f0-9]{8}$/.test(item.contentHash) && deterministicHash(item.content) === item.contentHash
    && (item.parentRef === undefined || validateEntityRef(item.parentRef))
    && (item.authorSource === undefined || (typeof item.authorSource === "string" && item.authorSource.length > 0 && item.authorSource.length <= 80))
    && (item.fieldChanges === undefined || (Array.isArray(item.fieldChanges) && item.fieldChanges.length <= 100
      && item.fieldChanges.every((change) => typeof change.path === "string" && change.path.length <= 160
        && typeof change.before === "string" && change.before.length <= 500 && typeof change.after === "string" && change.after.length <= 500)))
    && ["active", "inactive", "deprecated"].includes(item.status) && isIsoDate(item.createdAt);
}

function validateEvidence(value: unknown, actorId: string): value is EvaluationEvidence {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as EvaluationEvidence;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id)
    && ["requirement", "output", "test", "accessibility", "security", "performance", "trace", "review"].includes(item.type)
    && typeof item.summary?.he === "string" && item.summary.he.length <= 1_000 && !hasSensitiveText(item.summary.he)
    && typeof item.summary?.en === "string" && item.summary.en.length <= 1_000 && !hasSensitiveText(item.summary.en)
    && /^fnv1a32-[a-f0-9]{8}$/.test(item.contentHash) && item.sourceActorId === actorId && isIsoDate(item.createdAt);
}

const validators: { [K in Domain]: (value: unknown, actorId: string) => boolean } = {
  rubrics: (value) => validateRubric(value),
  experiments: validateExperiment,
  runs: validateRun,
  suites: (value) => validateSuite(value),
  failures: (value) => validateFailureCase(value),
  versions: (value) => validateVersion(value),
  previews: (value) => validatePreview(value),
  evidence: validateEvidence,
  traces: (value) => validateTrace(value),
};

function loadDomain(storage: Pick<Storage, "getItem" | "setItem">, key: string, domain: Domain, actorId: string): unknown[] {
  const raw = storage.getItem(key);
  if (!raw) return [];
  if (encodedBytes(raw) > MAX_BYTES) {
    quarantine(storage, key, raw);
    throw new Error("oversized-domain");
  }
  try {
    const parsed = JSON.parse(raw) as StoredDomain;
    if (parsed.schemaVersion !== 1 || parsed.actorId !== actorId || !Array.isArray(parsed.items)
      || parsed.items.length > LIMITS[domain]
      || deterministicHash(unsigned({ schemaVersion: 1, actorId: parsed.actorId, items: parsed.items, savedAt: parsed.savedAt })) !== parsed.checksum) {
      throw new Error("invalid-domain");
    }
    if (!parsed.items.every((item) => validators[domain](item, actorId))) throw new Error("invalid-item");
    return parsed.items;
  } catch {
    quarantine(storage, key, raw);
    throw new Error("corrupt-domain");
  }
}

export function loadEvaluationRepository(
  actorId: string,
  storage: Pick<Storage, "getItem" | "setItem"> = localStorage,
): EvaluationRepositorySnapshot {
  const safeActor = normalizeEvaluationActorId(actorId);
  const keys = evaluationStorageKeys(actorId);
  const result = empty();
  for (const domain of Object.keys(keys) as Domain[]) {
    try {
      (result[domain] as unknown[]) = loadDomain(storage, keys[domain], domain, safeActor);
    } catch {
      result.recoveredDomains.push(domain);
    }
  }
  if (!hasValidRepositoryCertifications(result)) {
    const raw = storage.getItem(keys.runs);
    if (raw) quarantine(storage, keys.runs, raw);
    result.runs = [];
    if (!result.recoveredDomains.includes("runs")) result.recoveredDomains.push("runs");
  }
  return result;
}

function encodeDomain(actorId: string, items: unknown[], savedAt: string): string {
  const base = { schemaVersion: 1 as const, actorId, items, savedAt };
  return JSON.stringify({ ...base, checksum: deterministicHash(base) });
}

const protectedRun = (run: EvaluationRun) => !["completed", "cancelled"].includes(run.status)
  || run.results.some((result) => result.certification.status === "certified");
const runEvidenceIds = (run: EvaluationRun) => new Set(run.results.flatMap((result) => result.evidence.map((item) => item.id)));

export function prepareEvaluationRepositorySnapshot(
  snapshot: EvaluationRepositorySnapshot,
  now = Date.now(),
): EvaluationRepositorySnapshot | undefined {
  const retained = applyEvaluationRetention(snapshot, now);
  const selected = new Set(retained.runs.filter(protectedRun).map((run) => run.id));
  const selectedEvidence = new Set(retained.runs.filter((run) => selected.has(run.id)).flatMap((run) => [...runEvidenceIds(run)]));
  let selectedTraceCount = retained.traces.filter((event) => selected.has(event.runId)).length;
  if (selected.size > LIMITS.runs || selectedEvidence.size > LIMITS.evidence || selectedTraceCount > LIMITS.traces) return undefined;
  const candidates = retained.runs.filter((run) => !selected.has(run.id)).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  for (const run of candidates) {
    if (selected.size >= LIMITS.runs) break;
    const evidenceIds = runEvidenceIds(run);
    const additionalEvidence = [...evidenceIds].filter((id) => !selectedEvidence.has(id)).length;
    const additionalTraces = retained.traces.filter((event) => event.runId === run.id).length;
    if (selectedEvidence.size + additionalEvidence > LIMITS.evidence || selectedTraceCount + additionalTraces > LIMITS.traces) continue;
    selected.add(run.id);
    evidenceIds.forEach((id) => selectedEvidence.add(id));
    selectedTraceCount += additionalTraces;
  }
  if ([...selectedEvidence].some((id) => !retained.evidence.some((item) => item.id === id))) return undefined;
  const evidence = retained.evidence.filter((item) => selectedEvidence.has(item.id));
  for (const item of [...retained.evidence].reverse()) {
    if (evidence.length >= LIMITS.evidence) break;
    if (!evidence.some((existing) => existing.id === item.id)) evidence.unshift(item);
  }
  const selectedRuns = retained.runs.filter((run) => selected.has(run.id));
  const protectedVersionKeys = new Set(selectedRuns.flatMap((run) => run.frozenRefs.map((ref) => `${ref.entityId}@${ref.version}`)));
  const protectedVersions = retained.versions.filter((item) => protectedVersionKeys.has(`${item.entityId}@${item.version}`));
  if (protectedVersions.length > LIMITS.versions) return undefined;
  const versions = [...protectedVersions];
  for (const item of [...retained.versions].reverse()) {
    if (versions.length >= LIMITS.versions) break;
    if (!versions.some((existing) => existing.entityId === item.entityId && existing.version === item.version)) versions.unshift(item);
  }
  return {
    ...retained,
    rubrics: retained.rubrics.slice(-LIMITS.rubrics),
    experiments: retained.experiments.slice(-LIMITS.experiments),
    runs: selectedRuns,
    suites: retained.suites.slice(-LIMITS.suites),
    failures: retained.failures.slice(-LIMITS.failures),
    versions,
    previews: retained.previews.slice(-LIMITS.previews),
    evidence,
    traces: retained.traces.filter((event) => selected.has(event.runId)).slice(-LIMITS.traces),
  };
}

export function saveEvaluationRepository(
  actorId: string,
  snapshot: EvaluationRepositorySnapshot,
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage,
  now = new Date().toISOString(),
): boolean {
  const safeActor = normalizeEvaluationActorId(actorId);
  const keys = evaluationStorageKeys(actorId);
  const prepared = prepareEvaluationRepositorySnapshot(snapshot, Date.parse(now));
  if (!prepared || !hasValidRepositoryCertifications(prepared)) return false;
  let invalidItem = false;
  const records = (Object.keys(keys) as Domain[]).map((domain) => {
    const source = domain === "rubrics"
      ? prepared.rubrics.filter((item) => item.source === "user")
      : prepared[domain] as unknown[];
    const items = source.filter((item) => validators[domain](item, safeActor));
    if (items.length !== source.length) invalidItem = true;
    return [keys[domain], encodeDomain(safeActor, items, now)] as const;
  });
  if (invalidItem) return false;
  if (records.some(([, raw]) => encodedBytes(raw) > MAX_BYTES)) return false;
  const before = new Map(records.map(([key]) => [key, storage.getItem(key)]));
  try {
    for (const [key, raw] of records) storage.setItem(key, raw);
    return true;
  } catch {
    for (const [key, raw] of before) {
      try {
        if (raw === null) storage.removeItem(key);
        else storage.setItem(key, raw);
      } catch {
        // Best-effort transactional rollback.
      }
    }
    return false;
  }
}

export function applyEvaluationRetention(snapshot: EvaluationRepositorySnapshot, now = Date.now()): EvaluationRepositorySnapshot {
  const cutoff = now - RETENTION_DAYS * 86_400_000;
  const recent = (date: string) => Date.parse(date) >= cutoff;
  const activeRunIds = new Set(snapshot.runs.filter((run) => !["completed", "cancelled"].includes(run.status)).map((run) => run.id));
  const certifiedRuns = snapshot.runs.filter((run) =>
    run.status === "completed" && run.results.some((result) => result.certification.status === "certified"));
  const certifiedRunIds = new Set(certifiedRuns.map((run) => run.id));
  const certifiedEvidenceIds = new Set(certifiedRuns.flatMap((run) =>
    run.results
      .filter((result) => result.certification.status === "certified")
      .flatMap((result) => [
        ...result.evidence.map((item) => item.id),
        ...result.findings.flatMap((finding) => finding.evidenceIds),
      ])));
  return {
    ...snapshot,
    runs: snapshot.runs.filter((run) => activeRunIds.has(run.id) || certifiedRunIds.has(run.id) || recent(run.updatedAt)),
    traces: snapshot.traces.filter((event) => activeRunIds.has(event.runId) || certifiedRunIds.has(event.runId) || recent(event.timestamp)),
    previews: snapshot.previews.filter((preview) => recent(preview.createdAt)),
    evidence: snapshot.evidence.filter((item) => certifiedEvidenceIds.has(item.id) || recent(item.createdAt)),
  };
}

export function resetEvaluationDomain(
  actorId: string,
  domain: Domain,
  storage: Pick<Storage, "removeItem"> = localStorage,
): void {
  storage.removeItem(evaluationStorageKeys(actorId)[domain]);
}

export function withBuiltInRubrics(snapshot: EvaluationRepositorySnapshot): EvaluationRepositorySnapshot {
  return { ...snapshot, rubrics: [...builtInRubrics, ...snapshot.rubrics.filter((item) => item.source === "user")] };
}
