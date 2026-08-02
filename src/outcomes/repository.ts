import { deterministicHash } from "../evaluations/hash";
import type { Deliverable, Outcome, OutcomeDiagnostic, OutcomeEvidence, OutcomeRepositorySnapshot, OutcomeStore } from "./types";
import { outcomeGraphDiagnostics, validateDeliverable, validateOutcome, validateOutcomeClaims, validateOutcomeEvidence } from "./validation";

export const OUTCOME_STORAGE_PREFIX = "shabis-ai-academy:outcomes:v2";
export const OUTCOME_MAX_BYTES = 3_000_000;
const MAX_OUTCOMES = 500;
const MAX_DELIVERABLES = 1_000;
const MAX_EVIDENCE = 2_000;

export const normalizeOutcomeActorId = (actorId: string): string =>
  actorId.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 80) || "local-guest";
export const outcomeStorageKey = (actorId: string): string => `${OUTCOME_STORAGE_PREFIX}:${normalizeOutcomeActorId(actorId)}`;

const unsignedStore = (store: Omit<OutcomeStore, "checksum"> | OutcomeStore) => ({
  schemaVersion: 2 as const,
  actorId: store.actorId,
  outcomes: store.outcomes,
  deliverables: store.deliverables,
  evidence: store.evidence,
  savedAt: store.savedAt,
});
export const calculateOutcomeStoreChecksum = (store: Omit<OutcomeStore, "checksum"> | OutcomeStore): string => deterministicHash(unsignedStore(store));

export const emptyOutcomeSnapshot = (): OutcomeRepositorySnapshot => ({ outcomes: [], deliverables: [], evidence: [], diagnostics: [], recovered: false });

function deduplicate<T extends { id: string }>(items: T[], domain: OutcomeDiagnostic["domain"], diagnostics: OutcomeDiagnostic[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      diagnostics.push({ code: "duplicate-id", domain, recordId: item.id });
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export function sanitizeOutcomeStore(value: unknown, expectedActorId?: string): { store?: OutcomeStore; diagnostics: OutcomeDiagnostic[]; errors: string[] } {
  const diagnostics: OutcomeDiagnostic[] = [];
  const errors: string[] = [];
  if (!value || typeof value !== "object") return { diagnostics, errors: ["invalid-outcome-store"] };
  const record = value as Partial<OutcomeStore>;
  const actorId = normalizeOutcomeActorId(expectedActorId ?? String(record.actorId ?? ""));
  if (record.schemaVersion !== 2 || record.actorId !== actorId || !Array.isArray(record.outcomes)
    || !Array.isArray(record.deliverables) || !Array.isArray(record.evidence)
    || typeof record.savedAt !== "string" || Number.isNaN(Date.parse(record.savedAt)) || typeof record.checksum !== "string") {
    return { diagnostics, errors: ["invalid-outcome-store"] };
  }
  try {
    if (record.checksum !== calculateOutcomeStoreChecksum(record as OutcomeStore)) errors.push("outcome-checksum-mismatch");
  } catch {
    errors.push("invalid-outcome-store");
  }
  const collect = <T>(values: unknown[], valid: (item: unknown, actor: string) => item is T, domain: OutcomeDiagnostic["domain"], max: number): T[] => {
    const accepted: T[] = [];
    for (const candidate of values.slice(0, max)) {
      if (valid(candidate, actorId)) accepted.push(candidate);
      else diagnostics.push({ code: "invalid-record", domain, recordId: candidate && typeof candidate === "object" && typeof (candidate as { id?: unknown }).id === "string" ? (candidate as { id: string }).id : undefined });
    }
    return accepted;
  };
  const outcomes = deduplicate(collect<Outcome>(record.outcomes, validateOutcome, "outcomes", MAX_OUTCOMES), "outcomes", diagnostics);
  const deliverables = deduplicate(collect<Deliverable>(record.deliverables, validateDeliverable, "deliverables", MAX_DELIVERABLES), "deliverables", diagnostics);
  const evidence = deduplicate(collect<OutcomeEvidence>(record.evidence, validateOutcomeEvidence, "evidence", MAX_EVIDENCE), "evidence", diagnostics);
  for (const outcome of outcomes) for (const error of validateOutcomeClaims(outcome)) errors.push(`${outcome.id}:${error}`);
  const store: OutcomeStore = { schemaVersion: 2, actorId, outcomes, deliverables, evidence, savedAt: record.savedAt, checksum: "" };
  diagnostics.push(...outcomeGraphDiagnostics(store));
  store.checksum = calculateOutcomeStoreChecksum(store);
  return { store, diagnostics, errors };
}

export function loadOutcomeRepository(actorId: string, storage: Pick<Storage, "getItem" | "setItem"> = localStorage): OutcomeRepositorySnapshot {
  const safeActor = normalizeOutcomeActorId(actorId);
  const key = outcomeStorageKey(safeActor);
  const raw = storage.getItem(key);
  if (raw === null) return emptyOutcomeSnapshot();
  if (new Blob([raw]).size > OUTCOME_MAX_BYTES) return { ...emptyOutcomeSnapshot(), recovered: true };
  try {
    const parsed = sanitizeOutcomeStore(JSON.parse(raw), safeActor);
    if (!parsed.store || parsed.errors.length > 0) {
      try { storage.setItem(`${key}:quarantine`, raw.slice(0, 200_000)); } catch { /* Recovery does not depend on quarantine persistence. */ }
      return { ...emptyOutcomeSnapshot(), diagnostics: parsed.diagnostics, recovered: true };
    }
    return { outcomes: parsed.store.outcomes, deliverables: parsed.store.deliverables, evidence: parsed.store.evidence, diagnostics: parsed.diagnostics, recovered: false };
  } catch {
    try { storage.setItem(`${key}:quarantine`, raw.slice(0, 200_000)); } catch { /* Best-effort diagnostics only. */ }
    return { ...emptyOutcomeSnapshot(), recovered: true };
  }
}

export function saveOutcomeRepository(actorId: string, snapshot: Pick<OutcomeRepositorySnapshot, "outcomes" | "deliverables" | "evidence">, storage: Pick<Storage, "setItem"> = localStorage, now = () => new Date().toISOString()): boolean {
  const safeActor = normalizeOutcomeActorId(actorId);
  const unique = <T extends { id: string }>(items: T[]) => new Set(items.map((item) => item.id)).size === items.length;
  if (snapshot.outcomes.length > MAX_OUTCOMES || snapshot.deliverables.length > MAX_DELIVERABLES || snapshot.evidence.length > MAX_EVIDENCE
    || !unique(snapshot.outcomes) || !unique(snapshot.deliverables) || !unique(snapshot.evidence)
    || snapshot.outcomes.some((item) => !validateOutcome(item, safeActor) || validateOutcomeClaims(item).length > 0)
    || snapshot.deliverables.some((item) => !validateDeliverable(item, safeActor))
    || snapshot.evidence.some((item) => !validateOutcomeEvidence(item, safeActor))) return false;
  const base = { schemaVersion: 2 as const, actorId: safeActor, outcomes: snapshot.outcomes, deliverables: snapshot.deliverables, evidence: snapshot.evidence, savedAt: now() };
  const store: OutcomeStore = { ...base, checksum: calculateOutcomeStoreChecksum(base) };
  const raw = JSON.stringify(store);
  if (new Blob([raw]).size > OUTCOME_MAX_BYTES) return false;
  try { storage.setItem(outcomeStorageKey(safeActor), raw); return true; } catch { return false; }
}

export type CreateOutcomeInput = Pick<Outcome, "actorId" | "title" | "summary" | "intent" | "status" | "realityMode" | "createdBy" | "sourceModule" | "sourceEntityId" | "projectId" | "resultType" | "resultLocation" | "usageInstructions" | "nextActions" | "limitations" | "deliverableIds" | "evidenceIds" | "verificationState" | "blockedReason" | "simulationAcknowledgement">;
export function createOutcome(input: CreateOutcomeInput, now: () => string = () => new Date().toISOString(), nextId: () => string = () => crypto.randomUUID()): Outcome {
  const timestamp = now();
  return { ...input, schemaVersion: 2, id: nextId(), actorId: normalizeOutcomeActorId(input.actorId), createdBy: normalizeOutcomeActorId(input.createdBy), createdAt: timestamp, updatedAt: timestamp, version: 1 };
}
