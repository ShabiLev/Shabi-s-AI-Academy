import { describe, expect, it } from "vitest";
import {
  applyWorkspaceImport,
  backupDomainKeys,
  checksumPayload,
  createWorkspaceBackup,
  previewWorkspaceImport,
  serializeWorkspaceBackup,
} from ".";
import {
  builtInRubrics,
  deterministicHash,
  evaluationStorageKeys,
  executeDeterministicEvaluation,
  loadEvaluationRepository,
  saveEvaluationRepository,
  startExperiment,
  type EvaluationExperiment,
  type EvaluationRepositorySnapshot,
  type VersionedEntityRef,
} from "../evaluations";
import { createOutcome, loadOutcomeRepository, saveOutcomeRepository } from "../outcomes";
function memoryStorage(seed: Record<string, string> = {}, failKey = "") {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === failKey) throw new Error("quota");
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    map,
  };
}
describe("complete Workspace backup", () => {
  it("exports whitelisted parsed domains with metadata and checksum", () => {
    const storage = memoryStorage({
      [backupDomainKeys.prompts]: JSON.stringify({
        schemaVersion: 1,
        prompts: [{ id: "p1" }],
      }),
      [backupDomainKeys.settings]: "en",
      unrelated: "secret",
    });
    const backup = createWorkspaceBackup(storage, () => "now");
    expect(backup.domains.prompts).toBeDefined();
    expect(backup.domains.settings).toBe("en");
    expect(JSON.stringify(backup)).not.toContain("unrelated");
    expect(backup.checksum).toBe(
      checksumPayload({
        schemaVersion: 3,
        appVersion: "2.0.0",
        actorId: "local-guest",
        exportedAt: "now",
        domainVersions: backup.domainVersions,
        domains: backup.domains,
      }),
    );
  });
  it("previews conflicts and applies merge or replace per domain", () => {
    const storage = memoryStorage({
      [backupDomainKeys.prompts]: JSON.stringify({
        schemaVersion: 1,
        prompts: [{ id: "p1", title: "old" }],
      }),
    });
    const backup = createWorkspaceBackup(
      memoryStorage({
        [backupDomainKeys.prompts]: JSON.stringify({
          schemaVersion: 1,
          prompts: [{ id: "p1", title: "new" }, { id: "p2" }],
        }),
      }),
    );
    const preview = previewWorkspaceImport(
      serializeWorkspaceBackup(backup),
      storage,
    );
    expect(preview.valid).toBe(true);
    expect(preview.domains[0].conflicts).toBe(1);
    const report = applyWorkspaceImport(preview, { prompts: "merge" }, storage);
    expect(report.ok).toBe(true);
    expect(
      JSON.parse(storage.getItem(backupDomainKeys.prompts)!).prompts,
    ).toHaveLength(2);
  });
  it("rejects malformed, oversized, secret-bearing, and modified imports", () => {
    expect(previewWorkspaceImport("{").errors).toContain("malformed-json");
    expect(previewWorkspaceImport("x".repeat(8_000_001)).errors).toContain(
      "oversized-import",
    );
    const backup = createWorkspaceBackup(memoryStorage());
    const secret = { ...backup, domains: { workspace: { apiKey: "no" } } };
    secret.checksum = checksumPayload({
      schemaVersion: secret.schemaVersion,
      appVersion: secret.appVersion,
      actorId: secret.actorId,
      exportedAt: secret.exportedAt,
      domainVersions: secret.domainVersions,
      domains: secret.domains,
    });
    expect(previewWorkspaceImport(JSON.stringify(secret)).errors).toContain(
      "secret-shaped-key",
    );
    const changed = { ...backup, appVersion: "changed" };
    expect(previewWorkspaceImport(JSON.stringify(changed)).errors).toContain(
      "checksum-mismatch",
    );
  });
  it("excludes and rejects secret-like values and private paths", () => {
    const unsafe = memoryStorage({
      [backupDomainKeys.prompts]: JSON.stringify({
        prompts: [{ id: "p1", content: "token=abc123" }],
      }),
      [backupDomainKeys.projects]: JSON.stringify({
        projects: [{ id: "p", note: "C:\\Users\\person\\private.txt" }],
      }),
    });
    const backup = createWorkspaceBackup(unsafe);
    expect(backup.domains.prompts).toBeUndefined();
    expect(backup.domains.projects).toBeUndefined();
    const incoming = {
      ...createWorkspaceBackup(memoryStorage()),
      domains: {
        prompts: { prompts: [{ id: "p2", content: "Bearer abc.def" }] },
      },
    };
    incoming.checksum = checksumPayload({
      schemaVersion: incoming.schemaVersion,
      appVersion: incoming.appVersion,
      actorId: incoming.actorId,
      exportedAt: incoming.exportedAt,
      domainVersions: incoming.domainVersions,
      domains: incoming.domains,
    });
    expect(previewWorkspaceImport(JSON.stringify(incoming)).errors).toContain(
      "secret-like-value",
    );
  });
  it("rejects standalone provider tokens, JWTs, UNC paths, and unsupported domain versions", () => {
    for (const unsafeValue of [
      "sk-abcdefghijklmnopqrstuvwx",
      "ghp_abcdefghijklmnopqrstuvwxyz123456",
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop",
      "\\\\private-server\\staff-share\\report.json",
      "/etc/shadow",
      "C:\\workspace\\private\\data.json",
    ]) {
      const storage = memoryStorage({ [backupDomainKeys.prompts]: JSON.stringify({ prompts: [{ id: "unsafe", value: unsafeValue }] }) });
      expect(createWorkspaceBackup(storage).domains.prompts).toBeUndefined();
    }
    const backup = createWorkspaceBackup(memoryStorage({ [backupDomainKeys.prompts]: JSON.stringify({ prompts: [{ id: "safe" }] }) }));
    backup.domainVersions.prompts = 2;
    backup.checksum = checksumPayload({ schemaVersion: backup.schemaVersion, appVersion: backup.appVersion, actorId: backup.actorId, exportedAt: backup.exportedAt, domainVersions: backup.domainVersions, domains: backup.domains });
    expect(previewWorkspaceImport(serializeWorkspaceBackup(backup)).errors).toContain("unsupported-domain-version");
  });
  it("accepts legacy schema-1 backups without an actor field", () => {
    const current = createWorkspaceBackup(
      memoryStorage({ [backupDomainKeys.settings]: "en" }),
      () => "2026-08-01T08:00:00.000Z",
    );
    const legacyBase = { ...current } as Partial<typeof current>;
    delete legacyBase.actorId;
    delete legacyBase.checksum;
    const unsigned = { ...legacyBase, schemaVersion: 1 as const };
    const legacy = { ...unsigned, checksum: checksumPayload(unsigned) };
    const preview = previewWorkspaceImport(
      JSON.stringify(legacy),
      memoryStorage(),
      "actor-b",
    );
    expect(preview.valid).toBe(true);
    expect(preview.sourceActorId).toBe("local-guest");
    expect(preview.targetActorId).toBe("actor-b");
  });
  it("rolls back every touched key after a write failure", () => {
    const source = memoryStorage({
      [backupDomainKeys.prompts]: JSON.stringify({ prompts: [{ id: "new" }] }),
      [backupDomainKeys.agents]: JSON.stringify({ agents: [{ id: "a" }] }),
    });
    const preview = previewWorkspaceImport(
      serializeWorkspaceBackup(createWorkspaceBackup(source)),
    );
    const target = memoryStorage(
      { [backupDomainKeys.prompts]: "old" },
      backupDomainKeys.agents,
    );
    const report = applyWorkspaceImport(
      preview,
      { prompts: "replace", agents: "replace" },
      target,
    );
    expect(report.rolledBack).toBe(true);
    expect(target.getItem(backupDomainKeys.prompts)).toBe("old");
  });
  it("includes every actor-scoped Version 1.9 domain", () => {
    const actor = "actor-1";
    const domainNames = [
      "missions",
      "agentTeams",
      "skillMap",
      "contextPacks",
      "missionAnalytics",
      "evaluationRubrics",
      "evaluationExperiments",
      "evaluationRuns",
      "evaluationSuites",
      "failureLibrary",
      "entityVersions",
      "connectedPreviews",
      "evaluationEvidence",
      "evaluationTraces",
    ] as const;
    const storage = memoryStorage({
      "shabis-ai-academy:mission-actor:v1": actor,
      ...Object.fromEntries(
        domainNames.map((domain) => [
          backupDomainKeys[domain].replace("local-guest", actor),
          JSON.stringify({ schemaVersion: 1, items: [] }),
        ]),
      ),
    });
    const backup = createWorkspaceBackup(storage);
    expect(Object.keys(backup.domains)).toEqual(
      expect.arrayContaining([...domainNames]),
    );
    expect(backup.actorId).toBe(actor);
  });
  it("exports schema 3 Outcomes and transactionally rebinds them to the target actor", () => {
    const source = memoryStorage({ "shabis-ai-academy:mission-actor:v1": "actor-a" });
    const outcome = createOutcome({
      actorId: "actor-a", createdBy: "actor-a", title: "Outcome", summary: "Local result", intent: "Create value",
      status: "ready", realityMode: "local", sourceModule: "project", sourceEntityId: "project-1",
      resultType: "project-outcome", resultLocation: "/projects/project-1", usageInstructions: "Review it.",
      nextActions: [], limitations: ["Local only"], deliverableIds: [], evidenceIds: [], verificationState: "unverified",
    }, () => "2026-08-01T12:00:00.000Z", () => "outcome-1");
    expect(saveOutcomeRepository("actor-a", { outcomes: [outcome], deliverables: [], evidence: [] }, source, () => "2026-08-01T12:00:00.000Z")).toBe(true);
    const backup = createWorkspaceBackup(source, () => "2026-08-01T12:01:00.000Z", "actor-a");
    expect(backup.schemaVersion).toBe(3);
    expect(backup.domainVersions.outcomes).toBe(2);
    expect(backup.domains.outcomes).toBeDefined();

    const target = memoryStorage();
    const preview = previewWorkspaceImport(serializeWorkspaceBackup(backup), target, "actor-b");
    expect(preview.valid).toBe(true);
    expect(preview.ownershipTransfer).toBe(true);
    const report = applyWorkspaceImport(preview, { outcomes: "replace" }, target, "actor-b");
    expect(report.ok).toBe(true);
    const restored = loadOutcomeRepository("actor-b", target);
    expect(restored.outcomes[0]).toMatchObject({ id: "outcome-1", actorId: "actor-b", createdBy: "actor-b" });
    expect(loadOutcomeRepository("actor-a", target).outcomes).toEqual([]);
  });
  it("rejects a partial protected evaluation graph before writing", () => {
    const savedAt = "2026-08-01T08:00:00.000Z";
    const evidence = {
      schemaVersion: 1 as const,
      id: "evidence-1",
      type: "test",
      summary: { he: "בדיקה", en: "Test" },
      contentHash: "fnv1a32-12345678",
      sourceActorId: "actor-a",
      createdAt: savedAt,
    };
    const base = {
      schemaVersion: 1 as const,
      actorId: "actor-a",
      items: [evidence],
      savedAt,
    };
    const source = memoryStorage({
      "shabis-ai-academy:evaluation-evidence:v1:actor-a": JSON.stringify({
        ...base,
        checksum: deterministicHash(base),
      }),
    });
    const backup = createWorkspaceBackup(source, () => savedAt, "actor-a");
    const target = memoryStorage();
    const preview = previewWorkspaceImport(
      serializeWorkspaceBackup(backup),
      target,
      "actor-b",
    );
    const report = applyWorkspaceImport(
        preview,
        { evaluationEvidence: "replace" },
        target,
        "actor-b",
      );
    expect(report.ok).toBe(false);
    expect(report.errors).toContain("incomplete-evaluation-graph");
    expect(target.getItem(evaluationStorageKeys("actor-b").evidence)).toBeNull();
  });
  it("restores a complete evaluation graph across actors without forging certification or trace identity", () => {
    const savedAt = "2026-08-01T08:00:00.000Z";
    const refs: VersionedEntityRef[] = [
      "mission",
      "general-mission-quality",
      "agent-a",
      "agent-b",
      "reality-checker",
    ].map((entityId) => ({
      entityId,
      version: entityId === "general-mission-quality" ? builtInRubrics[0].version! : "1",
      contentHash: entityId === "general-mission-quality"
        ? deterministicHash(builtInRubrics[0])
        : deterministicHash({ entityId }),
    }));
    const experiment: EvaluationExperiment = {
      schemaVersion: 1,
      id: "experiment-backup",
      actorId: "actor-a",
      name: "Backup graph",
      missionSnapshotId: "mission",
      competitorIds: ["agent-a", "agent-b"],
      rubricId: "general-mission-quality",
      evaluatorIds: ["reality-checker"],
      repetitionCount: 1,
      seed: "backup-seed",
      status: "draft",
      resultIds: [],
      createdAt: savedAt,
      updatedAt: savedAt,
    };
    const started = startExperiment(experiment, refs, "run-backup", savedAt);
    const output = executeDeterministicEvaluation(
      experiment,
      started.run,
      builtInRubrics[0],
      savedAt,
    );
    const snapshot: EvaluationRepositorySnapshot = {
      rubrics: [],
      experiments: [started.experiment],
      runs: [output.run],
      suites: [],
      failures: [],
      versions: [],
      previews: [],
      evidence: output.evidence,
      traces: output.traces,
      recoveredDomains: [],
    };
    const source = memoryStorage();
    expect(saveEvaluationRepository("actor-a", snapshot, source, savedAt)).toBe(
      true,
    );
    const backup = createWorkspaceBackup(source, () => savedAt, "actor-a");
    const target = memoryStorage();
    const preview = previewWorkspaceImport(
      serializeWorkspaceBackup(backup),
      target,
      "actor-b",
    );
    expect(preview.ownershipTransfer).toBe(true);
    const strategies = Object.fromEntries(
      Object.keys(backup.domains).map((domain) => [domain, "replace"]),
    );
    const report = applyWorkspaceImport(preview, strategies, target, "actor-b");
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
    const restored = loadEvaluationRepository("actor-b", target);
    expect(restored.recoveredDomains).toEqual([]);
    expect(restored.runs).toHaveLength(1);
    expect(restored.runs[0].actorId).toBe("actor-b");
    expect(
      restored.runs[0].results.every(
        (result) => result.certification.status === "needs-evidence",
      ),
    ).toBe(true);
    expect(
      restored.runs[0].results
        .flatMap((result) => result.evidence)
        .every((item) => item.sourceActorId === "actor-b"),
    ).toBe(true);
    expect(restored.traces.map((event) => event.actorId)).toEqual(
      expect.arrayContaining(["academy-simulator", "independent-evaluator-panel"]),
    );
    expect(
      target.getItem(evaluationStorageKeys("actor-b").runs),
    ).not.toBeNull();
  });
  it("rejects malformed evaluation domains at preview and apply time without mutation", () => {
    const source = memoryStorage({
      [backupDomainKeys.evaluationRuns]: JSON.stringify({
        schemaVersion: 1,
        runs: [{ id: "run-1", result: "incoming" }, { id: "run-2" }],
      }),
    });
    const target = memoryStorage({
      [backupDomainKeys.evaluationRuns]: JSON.stringify({
        schemaVersion: 1,
        runs: [{ id: "run-1", result: "existing" }],
      }),
    });
    const preview = previewWorkspaceImport(
      serializeWorkspaceBackup(createWorkspaceBackup(source)),
      target,
    );
    expect(preview.valid).toBe(false);
    expect(preview.errors).toEqual(expect.arrayContaining(["invalid-domain:evaluationRuns", "incomplete-evaluation-graph"]));
    expect(applyWorkspaceImport(preview, { evaluationRuns: "replace" }, target).ok).toBe(false);
    expect(JSON.parse(target.getItem(backupDomainKeys.evaluationRuns)!).runs).toEqual([{ id: "run-1", result: "existing" }]);
    preview.backup!.domains.evaluationRuns = {
      schemaVersion: 1,
      runs: [{ id: "tampered" }],
    };
    expect(applyWorkspaceImport(preview, {}, target).errors).toContain(
      "checksum-mismatch",
    );
  });
});
