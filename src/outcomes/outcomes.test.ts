import { describe, expect, it } from "vitest";
import {
  calculateOutcomeStoreChecksum,
  createOutcome,
  loadOutcomeRepository,
  outcomeStorageKey,
  saveOutcomeRepository,
  sanitizeOutcomeStore,
  validateOutcome,
  validateOutcomeClaims,
  type Deliverable,
  type Outcome,
  type OutcomeEvidence,
  type OutcomeStore,
} from ".";

function memoryStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    values,
  };
}

const baseOutcome = (actorId = "actor-a", id = "outcome-1"): Outcome => createOutcome({
  actorId,
  createdBy: actorId,
  title: "Release outcome",
  summary: "A bounded local result",
  intent: "Prepare a release",
  status: "ready",
  realityMode: "local",
  sourceModule: "project",
  sourceEntityId: "project-1",
  resultType: "project-outcome",
  resultLocation: `/outcomes/${id}`,
  usageInstructions: "Review and attach evidence.",
  nextActions: [{ id: "review", label: "Review", route: `/outcomes/${id}` }],
  limitations: ["Browser-local only"],
  deliverableIds: [],
  evidenceIds: [],
  verificationState: "unverified",
}, () => "2026-08-01T12:00:00.000Z", () => id);

describe("actor-scoped outcomes", () => {
  it("isolates actor stores and preserves safe forward-compatible fields", () => {
    const storage = memoryStorage();
    const outcome = { ...baseOutcome(), futureDisplayHint: "compact" };
    expect(saveOutcomeRepository("actor-a", { outcomes: [outcome], deliverables: [], evidence: [] }, storage)).toBe(true);
    expect(loadOutcomeRepository("actor-a", storage).outcomes[0].futureDisplayHint).toBe("compact");
    expect(loadOutcomeRepository("actor-b", storage).outcomes).toEqual([]);
    expect(storage.values.has(outcomeStorageKey("actor-a"))).toBe(true);
  });

  it("rejects unsupported completion, verification, and blocked claims", () => {
    const outcome = baseOutcome();
    expect(validateOutcomeClaims({ ...outcome, status: "completed" })).toContain("completion-requires-substantiation");
    expect(validateOutcomeClaims({ ...outcome, status: "verified", verificationState: "verified" })).toContain("verification-requires-evidence");
    expect(validateOutcomeClaims({ ...outcome, status: "blocked" })).toContain("blocked-requires-reason");
    expect(validateOutcomeClaims({ ...outcome, status: "simulated" })).toContain("simulated-status-requires-simulated-reality");
    expect(validateOutcomeClaims({ ...outcome, status: "completed", realityMode: "simulated", simulationAcknowledgement: { acknowledgedAt: outcome.updatedAt, acknowledgedBy: outcome.actorId, statement: "I understand this was simulated." } })).toEqual([]);
  });

  it("retains unresolved references as diagnostics without fabricating records", () => {
    const outcome = { ...baseOutcome(), deliverableIds: ["missing-deliverable"] };
    const base = { schemaVersion: 2 as const, actorId: "actor-a", outcomes: [outcome], deliverables: [], evidence: [], savedAt: outcome.updatedAt };
    const parsed = sanitizeOutcomeStore({ ...base, checksum: calculateOutcomeStoreChecksum(base) }, "actor-a");
    expect(parsed.errors).toEqual([]);
    expect(parsed.diagnostics).toContainEqual({ code: "unresolved-deliverable", domain: "outcomes", recordId: outcome.id, referenceId: "missing-deliverable" });
    expect(parsed.store?.deliverables).toEqual([]);
  });

  it("keeps valid siblings but quarantines a modified envelope checksum", () => {
    const outcome = baseOutcome();
    const invalid = { ...outcome, id: "invalid outcome id" };
    const base = { schemaVersion: 2 as const, actorId: "actor-a", outcomes: [outcome, invalid], deliverables: [], evidence: [], savedAt: outcome.updatedAt };
    const store: OutcomeStore = { ...base, checksum: calculateOutcomeStoreChecksum(base) };
    const sanitized = sanitizeOutcomeStore(store, "actor-a");
    expect(sanitized.store?.outcomes.map((item) => item.id)).toEqual([outcome.id]);
    expect(sanitized.diagnostics.some((item) => item.code === "invalid-record")).toBe(true);

    const storage = memoryStorage({ [outcomeStorageKey("actor-a")]: JSON.stringify({ ...store, savedAt: "2026-08-02T12:00:00.000Z" }) });
    expect(loadOutcomeRepository("actor-a", storage).recovered).toBe(true);
    expect(storage.values.has(`${outcomeStorageKey("actor-a")}:quarantine`)).toBe(true);
  });

  it("rejects a resultLocation that is not an internal app route, closing an unsanchored-link vector", () => {
    expect(validateOutcome({ ...baseOutcome(), resultLocation: "javascript:alert(1)" })).toBe(false);
    expect(validateOutcome({ ...baseOutcome(), resultLocation: "https://example.com" })).toBe(false);
    expect(validateOutcome(baseOutcome())).toBe(true);
  });

  it("rejects duplicate IDs on application writes instead of silently overwriting them", () => {
    const outcome = baseOutcome();
    expect(saveOutcomeRepository("actor-a", { outcomes: [outcome, { ...outcome }], deliverables: [], evidence: [] }, memoryStorage())).toBe(false);
  });

  it("persists a complete deliverable and exact-version evidence graph", () => {
    const outcome = { ...baseOutcome(), status: "verified" as const, verificationState: "verified" as const, deliverableIds: ["deliverable-1"], evidenceIds: ["evidence-1"] };
    const deliverable: Deliverable = { schemaVersion: 2, id: "deliverable-1", actorId: "actor-a", outcomeId: outcome.id, title: "Release report", resultType: "document", location: "browser-local:project-1", usageInstructions: "Export and review.", sourceEntityId: "project-1", sourceEntityVersion: 2, contentHash: "fnv1a32-12345678", createdAt: outcome.createdAt, updatedAt: outcome.updatedAt, version: 1 };
    const evidence: OutcomeEvidence = { schemaVersion: 2, id: "evidence-1", actorId: "actor-a", outcomeId: outcome.id, deliverableId: deliverable.id, evidenceType: "review", summary: "Reviewed exact project version", sourceEntityId: "project-1", sourceEntityVersion: 2, contentHash: "fnv1a32-12345678", verificationState: "verified", createdAt: outcome.createdAt, createdBy: "actor-a", verifiedAt: outcome.updatedAt };
    const storage = memoryStorage();
    expect(saveOutcomeRepository("actor-a", { outcomes: [outcome], deliverables: [deliverable], evidence: [evidence] }, storage)).toBe(true);
    const loaded = loadOutcomeRepository("actor-a", storage);
    expect(loaded.recovered).toBe(false);
    expect(loaded.diagnostics).toEqual([]);
    expect(loaded.evidence[0].sourceEntityVersion).toBe(2);
  });
});
