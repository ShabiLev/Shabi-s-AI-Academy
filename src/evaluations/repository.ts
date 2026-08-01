import { builtInRubrics } from "./catalog";
import { deterministicHash } from "./hash";
import { calculateEvaluationResultChecksum } from "./runtime";
import type {
  EntityVersion,
  EvaluationEvidence,
  EvaluationRepositorySnapshot,
  EvaluationRun,
  EvaluationSuite,
} from "./types";
import {
  hasUnsafeContent,
  isIsoDate,
  SAFE_ID,
  validateExperiment,
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
type Domain = keyof typeof LIMITS;

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
    && Array.isArray(run.resultIds) && run.resultIds.length <= 100 && run.resultIds.every((id) => SAFE_ID.test(id))
    && Array.isArray(run.evidenceIds) && run.evidenceIds.length <= 1_000 && run.evidenceIds.every((id) => SAFE_ID.test(id))
    && Array.isArray(run.results) && run.results.length <= 100
    && run.results.every((result) => result.schemaVersion === 1 && SAFE_ID.test(result.id)
      && result.runId === run.id && SAFE_ID.test(result.competitorId) && Number.isInteger(result.repetition)
      && result.repetition >= 0 && /^fnv1a32-[a-f0-9]{8}$/.test(result.resultChecksum)
      && Array.isArray(result.findings) && Array.isArray(result.evidence)
      && result.evidence.every((item) => validateEvidence(item, actorId))
      && result.findings.every((finding) => Array.isArray(finding.evidenceIds)
        && finding.evidenceIds.every((id) => result.evidence.some((item) => item.id === id)))
      && calculateEvaluationResultChecksum(run.inputHash, result) === result.resultChecksum
      && isIsoDate(result.completedAt))
    && run.resultIds.length === run.results.length
    && run.resultIds.every((resultId, index) => run.results[index]?.id === resultId)
    && run.evidenceIds.every((evidenceId) => run.results.some((result) => result.evidence.some((item) => item.id === evidenceId)))
    && isIsoDate(run.startedAt) && isIsoDate(run.updatedAt);
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
    && ["active", "inactive", "deprecated"].includes(item.status) && isIsoDate(item.createdAt);
}

function validateEvidence(value: unknown, actorId: string): value is EvaluationEvidence {
  if (!value || typeof value !== "object" || hasUnsafeContent(value)) return false;
  const item = value as EvaluationEvidence;
  return item.schemaVersion === 1 && SAFE_ID.test(item.id)
    && ["requirement", "output", "test", "accessibility", "security", "performance", "trace", "review"].includes(item.type)
    && typeof item.summary?.he === "string" && typeof item.summary?.en === "string"
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
    return parsed.items.filter((item) => validators[domain](item, actorId));
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
  return result;
}

function encodeDomain(actorId: string, items: unknown[], savedAt: string): string {
  const base = { schemaVersion: 1 as const, actorId, items, savedAt };
  return JSON.stringify({ ...base, checksum: deterministicHash(base) });
}

export function saveEvaluationRepository(
  actorId: string,
  snapshot: EvaluationRepositorySnapshot,
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage,
  now = new Date().toISOString(),
): boolean {
  const safeActor = normalizeEvaluationActorId(actorId);
  const keys = evaluationStorageKeys(actorId);
  const records = (Object.keys(keys) as Domain[]).map((domain) => {
    const source = domain === "rubrics"
      ? snapshot.rubrics.filter((item) => item.source === "user")
      : snapshot[domain] as unknown[];
    const items = source.filter((item) => validators[domain](item, safeActor)).slice(-LIMITS[domain]);
    return [keys[domain], encodeDomain(safeActor, items, now)] as const;
  });
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
    previews: snapshot.previews.filter((preview) => Date.parse(preview.expiresAt) > now),
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
