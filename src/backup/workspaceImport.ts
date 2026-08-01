import { deterministicHash } from "../evaluations/hash";
import { calculateEvaluationResultChecksum } from "../evaluations/runtime";
import type { EvaluationCompetitorResult } from "../evaluations/types";
import { evaluationStorageKeys, loadEvaluationRepository } from "../evaluations/repository";
import { BACKUP_MAX_BYTES, checksumPayload, containsSecretLikeKey, containsSecretLikeValue, normalizeBackupActorId, resolveBackupDomainKeys } from "./workspaceBackup";
import type { BackupDomain, ImportPreviewDomain, ImportStrategy, WorkspaceBackup, WorkspaceImportPreview, WorkspaceImportReport } from "./types";

const dangerous = (value: unknown, depth = 0): boolean => {
  if (depth > 30) return true;
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => dangerous(item, depth + 1));
  const record = value as Record<string, unknown>;
  return ["__proto__", "prototype", "constructor"].some((key) => Object.prototype.hasOwnProperty.call(record, key))
    || Object.values(record).some((item) => dangerous(item, depth + 1));
};
const count = (value: unknown): number => Array.isArray(value) ? value.length : value && typeof value === "object" ? (Object.values(value as Record<string,unknown>).find(Array.isArray) as unknown[] | undefined)?.length ?? Object.keys(value as object).length : value === undefined ? 0 : 1;
const ids = (value: unknown): Set<string> => {
  const array = Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value as Record<string,unknown>).find(Array.isArray) as unknown[] | undefined : undefined;
  return new Set((array ?? []).flatMap((item) => item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" ? [(item as { id: string }).id] : []));
};
function envelopeWithoutChecksum(backup: WorkspaceBackup) {
  return backup.actorId === undefined
    ? { schemaVersion: backup.schemaVersion, appVersion: backup.appVersion, exportedAt: backup.exportedAt, domainVersions: backup.domainVersions, domains: backup.domains }
    : { schemaVersion: backup.schemaVersion, appVersion: backup.appVersion, actorId: backup.actorId, exportedAt: backup.exportedAt, domainVersions: backup.domainVersions, domains: backup.domains };
}
function validateBackup(backup: WorkspaceBackup | undefined, storage: Pick<Storage, "getItem">, targetActorId?: string): string[] {
  const errors: string[] = [];
  if (!backup || ![1, 2].includes(backup.schemaVersion) || !backup.domains || typeof backup.domains !== "object"
    || (backup.schemaVersion === 2 && typeof backup.actorId !== "string")
    || (backup.actorId !== undefined && (typeof backup.actorId !== "string" || normalizeBackupActorId(backup.actorId) !== backup.actorId))) return ["invalid-schema"];
  if (containsSecretLikeKey(backup?.domains)) errors.push("secret-shaped-key");
  if (containsSecretLikeValue(backup?.domains)) errors.push("secret-like-value");
  if (dangerous(backup?.domains)) errors.push("executable-or-prototype-content");
  if (backup.checksum !== checksumPayload(envelopeWithoutChecksum(backup))) errors.push("checksum-mismatch");
  const supported = resolveBackupDomainKeys(storage, targetActorId);
  if (Object.keys(backup?.domains ?? {}).some((domain) => !(domain in supported))) errors.push("unsupported-domain");
  if (!backup.domainVersions || typeof backup.domainVersions !== "object"
    || Object.keys(backup.domains).some((domain) => backup.domainVersions[domain as BackupDomain] !== 1)) errors.push("unsupported-domain-version");
  const evaluationDomains: Partial<Record<BackupDomain, string>> = {
    evaluationRubrics: "rubrics", evaluationExperiments: "experiments", evaluationRuns: "runs", evaluationSuites: "suites",
    failureLibrary: "failures", entityVersions: "versions", connectedPreviews: "previews", evaluationEvidence: "evidence", evaluationTraces: "traces",
  };
  for (const [domain, value] of Object.entries(backup.domains) as Array<[BackupDomain, unknown]>) {
    if (!evaluationDomains[domain]) continue;
    if (!value || typeof value !== "object") { errors.push(`invalid-domain:${domain}`); continue; }
    const envelope = value as { schemaVersion?: unknown; actorId?: unknown; items?: unknown; savedAt?: unknown; checksum?: unknown };
    const base = { schemaVersion: 1 as const, actorId: envelope.actorId, items: envelope.items, savedAt: envelope.savedAt };
    if (envelope.schemaVersion !== 1 || typeof envelope.actorId !== "string" || normalizeBackupActorId(envelope.actorId) !== envelope.actorId
      || !Array.isArray(envelope.items) || typeof envelope.savedAt !== "string" || Number.isNaN(Date.parse(envelope.savedAt))
      || envelope.checksum !== deterministicHash(base)) errors.push(`invalid-domain:${domain}`);
  }
  const graphDomains: BackupDomain[] = ["evaluationRuns", "evaluationEvidence", "evaluationTraces"];
  const graphPresent = graphDomains.filter((domain) => Object.prototype.hasOwnProperty.call(backup.domains, domain));
  if (graphPresent.length > 0 && graphPresent.length !== graphDomains.length) errors.push("incomplete-evaluation-graph");
  return errors;
}
export function previewWorkspaceImport(raw: string, storage: Pick<Storage,"getItem"> = localStorage, targetActorId?: string): WorkspaceImportPreview {
  if (new Blob([raw]).size > BACKUP_MAX_BYTES) return { valid: false, errors: ["oversized-import"], domains: [] };
  try {
    const parsed = JSON.parse(raw) as WorkspaceBackup;
    const errors = validateBackup(parsed, storage, targetActorId);
    const backupDomainKeys = resolveBackupDomainKeys(storage, targetActorId);
    const domains: ImportPreviewDomain[] = Object.entries(parsed?.domains ?? {}).map(([name, incoming]) => {
      const domain = name as BackupDomain;
      const supported = domain in backupDomainKeys;
      let existing: unknown;
      if (supported) {
        const rawExisting = storage.getItem(backupDomainKeys[domain]);
        try { existing = domain === "settings" ? rawExisting : JSON.parse(rawExisting ?? "null"); } catch { existing = undefined; }
      }
      const incomingIds = ids(incoming);
      const existingIds = ids(existing);
      return { domain, incomingCount: count(incoming), existingCount: count(existing), conflicts: [...incomingIds].filter((id) => existingIds.has(id)).length, supported };
    });
    const sourceActorId = normalizeBackupActorId(parsed.actorId ?? "local-guest");
    const resolvedTargetActorId = normalizeBackupActorId(targetActorId ?? storage.getItem("shabis-ai-academy:mission-actor:v1") ?? "local-guest");
    return { valid: errors.length === 0 && domains.every((domain) => domain.supported), errors, domains, backup: parsed, sourceActorId, targetActorId: resolvedTargetActorId, ownershipTransfer: sourceActorId !== resolvedTargetActorId };
  } catch {
    return { valid: false, errors: ["malformed-json"], domains: [] };
  }
}
function mergeValues(existing: unknown, incoming: unknown, preserveExisting = false): unknown {
  if (!existing || typeof existing !== "object" || !incoming || typeof incoming !== "object" || Array.isArray(existing) || Array.isArray(incoming)) return incoming;
  const left = existing as Record<string,unknown>;
  const right = incoming as Record<string,unknown>;
  const result = { ...left, ...right };
  for (const key of Object.keys(right)) {
    if (!Array.isArray(left[key]) || !Array.isArray(right[key])) continue;
    const map = new Map<string, unknown>();
    const ordered = preserveExisting ? [...right[key] as unknown[], ...left[key] as unknown[]] : [...left[key] as unknown[], ...right[key] as unknown[]];
    for (const item of ordered) {
      const id = item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" ? (item as { id: string }).id : JSON.stringify(item);
      map.set(id, item);
    }
    result[key] = [...map.values()];
  }
  return result;
}
const immutableDomains = new Set<BackupDomain>(["evaluationRuns", "evaluationSuites", "entityVersions", "evaluationEvidence", "evaluationTraces"]);
const actorScopedDomains = new Set<BackupDomain>(["missions", "agentTeams", "skillMap", "contextPacks", "missionAnalytics", "evaluationRubrics", "evaluationExperiments", "evaluationRuns", "evaluationSuites", "failureLibrary", "entityVersions", "connectedPreviews", "evaluationEvidence", "evaluationTraces"]);
function rebindActor(value: unknown, actorId: string): unknown {
  if (Array.isArray(value)) return value.map((item) => rebindActor(item, actorId));
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  const traceEvent = typeof record.actorType === "string" && typeof record.eventType === "string" && Number.isInteger(record.sequence);
  const evidence = typeof record.sourceActorId === "string" && typeof record.contentHash === "string" && typeof record.createdAt === "string";
  const rebound = Object.fromEntries(Object.entries(record).map(([key, item]) => [key,
    key === "actorId" && !traceEvent ? actorId
      : key === "sourceActorId" && evidence ? actorId
        : rebindActor(item, actorId)]));
  if (Array.isArray(rebound.items) && typeof rebound.savedAt === "string" && typeof rebound.checksum === "string") {
    const base = { schemaVersion: 1 as const, actorId, items: rebound.items, savedAt: rebound.savedAt };
    return { ...base, checksum: deterministicHash(base) };
  }
  return rebound;
}
function prepareImportedRuns(value: unknown, actorId: string): unknown {
  const rebound = rebindActor(value, actorId);
  if (!rebound || typeof rebound !== "object" || !Array.isArray((rebound as { items?: unknown }).items)) return rebound;
  const envelope = rebound as Record<string, unknown> & { items: unknown[] };
  const items = envelope.items.map((item) => {
    if (!item || typeof item !== "object") return item;
    const run = item as Record<string, unknown> & { inputHash?: unknown; results?: unknown };
    if (typeof run.inputHash !== "string" || !Array.isArray(run.results)) return run;
    const results = run.results.map((candidate) => {
      if (!candidate || typeof candidate !== "object") return candidate;
      const result = candidate as EvaluationCompetitorResult;
      const certification = {
        status: "needs-evidence" as const,
        passingScore: result.certification.passingScore,
        criteria: result.certification.criteria,
        reasons: [...result.certification.reasons, {
          he: "תוצאה שיובאה דורשת אימות מקומי מחדש.",
          en: "Imported result requires local revalidation.",
        }],
      };
      const withoutChecksum = { ...result, certification };
      delete (withoutChecksum as Partial<EvaluationCompetitorResult>).resultChecksum;
      return { ...withoutChecksum, resultChecksum: calculateEvaluationResultChecksum(run.inputHash as string, withoutChecksum) };
    });
    return { ...run, results };
  });
  const base = { schemaVersion: 1 as const, actorId, items, savedAt: envelope.savedAt };
  return typeof envelope.savedAt === "string" && typeof envelope.checksum === "string"
    ? { ...base, checksum: deterministicHash(base) }
    : { ...envelope, items };
}
export function applyWorkspaceImport(preview: WorkspaceImportPreview, strategies: Partial<Record<BackupDomain,ImportStrategy>>, storage: Pick<Storage,"getItem"|"setItem"|"removeItem"> = localStorage, targetActorId?: string): WorkspaceImportReport {
  const validationErrors = validateBackup(preview.backup, storage, targetActorId);
  if (!preview.valid || !preview.backup || validationErrors.length > 0) return { ok: false, imported: [], skipped: [], errors: [...new Set([...preview.errors, ...validationErrors])], rolledBack: false };
  const backup = preview.backup;
  const safeTargetActor = normalizeBackupActorId(targetActorId ?? storage.getItem("shabis-ai-academy:mission-actor:v1") ?? "local-guest");
  const backupDomainKeys = resolveBackupDomainKeys(storage, safeTargetActor);
  const snapshots = new Map<string,string|null>();
  const imported: BackupDomain[] = [];
  const skipped: BackupDomain[] = [];
  const graphDomains: BackupDomain[] = ["evaluationRuns", "evaluationEvidence", "evaluationTraces"];
  if (graphDomains.some((domain) => domain in backup.domains) && graphDomains.some((domain) => !(domain in backup.domains) || strategies[domain] === "skip")) {
    return { ok: false, imported: [], skipped: [], errors: ["incomplete-evaluation-graph"], rolledBack: false };
  }
  try {
    const staged = new Map<string, string>();
    for (const [domain, incoming] of Object.entries(backup.domains) as Array<[BackupDomain,unknown]>) {
      const strategy = strategies[domain] ?? "merge";
      const key = backupDomainKeys[domain];
      if (!key || strategy === "skip") { skipped.push(domain); continue; }
      const preparedIncoming = domain === "evaluationRuns"
        ? prepareImportedRuns(incoming, safeTargetActor)
        : actorScopedDomains.has(domain) ? rebindActor(incoming, safeTargetActor) : incoming;
      let value = preparedIncoming;
      if ((strategy === "merge" || immutableDomains.has(domain)) && domain !== "settings") {
        let existing: unknown;
        try { existing = JSON.parse(storage.getItem(key) ?? "null"); } catch { existing = undefined; }
        value = mergeValues(existing, preparedIncoming, immutableDomains.has(domain));
      }
      if (actorScopedDomains.has(domain)) value = rebindActor(value, safeTargetActor);
      staged.set(key, domain === "settings" ? String(value) : JSON.stringify(value));
      imported.push(domain);
    }
    const overlay = {
      getItem: (key: string) => staged.get(key) ?? storage.getItem(key),
      setItem: (key: string, value: string) => { staged.set(key, value); },
    };
    const evaluationKeys = new Set<string>(Object.values(evaluationStorageKeys(safeTargetActor)));
    if ([...staged.keys()].some((key) => evaluationKeys.has(key))) {
      const repository = loadEvaluationRepository(safeTargetActor, overlay);
      if (repository.recoveredDomains.length > 0) throw new Error("invalid-evaluation-domain");
      const experimentIds = new Set(repository.experiments.map((item) => item.id));
      const runIds = new Set(repository.runs.map((item) => item.id));
      const evidenceIds = new Set(repository.evidence.map((item) => item.id));
      if (repository.runs.some((run) => !experimentIds.has(run.experimentId)
        || run.evidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId))
        || run.results.flatMap((result) => result.findings).some((finding) => finding.evidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId)))
        || run.status === "completed" && !repository.traces.some((trace) => trace.runId === run.id))
        || repository.traces.some((trace) => !runIds.has(trace.runId))) throw new Error("invalid-evaluation-graph");
    }
    for (const [key, value] of staged) {
      snapshots.set(key, storage.getItem(key));
      storage.setItem(key, value);
    }
    return { ok: true, imported, skipped, errors: [], rolledBack: false };
  } catch (error) {
    for (const [key, value] of snapshots) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch { /* best effort after a failed transaction */ }
    }
    const reason = error instanceof Error && ["invalid-evaluation-domain", "invalid-evaluation-graph"].includes(error.message) ? error.message : "write-failed";
    return { ok: false, imported: [], skipped: [], errors: [reason], rolledBack: snapshots.size > 0 };
  }
}
