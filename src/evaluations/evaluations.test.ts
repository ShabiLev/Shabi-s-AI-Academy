import {
  addLearningEvidence,
  applyEvaluationRetention,
  buildTeamRecommendation,
  builtInRubrics,
  cancelRun,
  canonicalJson,
  certifyFindings,
  certifySuite,
  classifyRegression,
  cloneBuiltInRubric,
  completeRun,
  continueRun,
  createConnectedPreview,
  createEntityVersion,
  createExperiment,
  createFailureCase,
  createImmutableSnapshot,
  createSuite,
  createTraceEvent,
  deprecateVersion,
  deriveSkillLevel,
  deterministicHash,
  deterministicSeed,
  executeConnectedPreview,
  executeDeterministicEvaluation,
  executeRegressionSuite,
  exportCodexAgent,
  exportTraceHtml,
  exportTraceJson,
  exportTraceMarkdown,
  hasUnsafeContent,
  loadEvaluationRepository,
  markVersionActive,
  parseCodexToml,
  pauseRun,
  readOnlyEvaluators,
  removeLearningEvidence,
  replaceSuiteBaseline,
  resetEvaluationDomain,
  rollbackAsNewVersion,
  safeTraceSummary,
  saveEvaluationRepository,
  startExperiment,
  updateExperiment,
  validateExperiment,
  validateFinding,
  validateRubric,
  withBuiltInRubrics,
} from "./index";
import type {
  EvaluationEvidence,
  EvaluationExperiment,
  EvaluationFinding,
  EvaluationRepositorySnapshot,
  FailureCase,
  LearningEvidence,
  VersionedEntityRef,
} from "./types";
import { describe, expect, it } from "vitest";

const now = "2026-07-30T10:00:00.000Z";
const later = "2026-07-30T10:01:00.000Z";

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();
  failAfter = Number.POSITIVE_INFINITY;
  failOnce = false;
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    if (this.failAfter-- <= 0) {
      if (this.failOnce) {
        this.failAfter = Number.POSITIVE_INFINITY;
        this.failOnce = false;
      }
      throw new Error("quota");
    }
    this.values.set(key, value);
  }
}

const refs: VersionedEntityRef[] = ["mission", "rubric", "agent-a", "agent-b"].map((entityId) => ({
  entityId,
  version: "1",
  contentHash: deterministicHash({ entityId }),
}));

function experiment(overrides: Partial<EvaluationExperiment> = {}): EvaluationExperiment {
  return {
    schemaVersion: 1,
    id: "experiment-1",
    actorId: "actor-a",
    name: "Agent comparison",
    missionSnapshotId: "mission",
    competitorIds: ["agent-a", "agent-b"],
    rubricId: "rubric",
    evaluatorIds: ["reality-checker"],
    repetitionCount: 2,
    seed: "fixed-seed",
    status: "draft",
    resultIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

const emptySnapshot = (): EvaluationRepositorySnapshot => ({
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

describe("canonical deterministic evaluation primitives", () => {
  it("hashes key-order independent Unicode values deterministically", () => {
    expect(deterministicHash({ en: "quality", he: "איכות", nested: { b: 2, a: 1 } }))
      .toBe(deterministicHash({ nested: { a: 1, b: 2 }, he: "איכות", en: "quality" }));
    expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(deterministicSeed("seed", "agent", 0)).toBe(deterministicSeed("seed", "agent", 0));
    expect(deterministicSeed("seed", "agent", 0)).not.toBe(deterministicSeed("seed", "agent", 1));
  });

  it("rejects cycles, non-finite values and prototype-pollution keys", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => deterministicHash(cyclic)).toThrow(/Cyclic/);
    expect(() => deterministicHash(Number.NaN)).toThrow(/Non-finite/);
    const unsafe = JSON.parse('{"__proto__":{"admin":true}}');
    expect(() => deterministicHash(unsafe)).toThrow(/Dangerous/);
    expect(hasUnsafeContent(unsafe)).toBe(true);
  });
});

describe("rubrics, evaluator independence and certification", () => {
  it("ships eight immutable valid rubrics and read-only evaluators", () => {
    expect(builtInRubrics).toHaveLength(8);
    expect(builtInRubrics.every((item) => validateRubric(item, true))).toBe(true);
    expect(Object.isFrozen(builtInRubrics[0].criteria)).toBe(true);
    expect(readOnlyEvaluators).toHaveLength(8);
    expect(readOnlyEvaluators.every((item) => item.permissions.join(",") === "observe,validate")).toBe(true);
  });

  it("requires weights to total exactly 100 and clone retains provenance", () => {
    const invalid = structuredClone(builtInRubrics[0]);
    invalid.source = "user";
    invalid.criteria[0].weight = 29;
    expect(validateRubric(invalid)).toBe(false);
    const clone = cloneBuiltInRubric("general-mission-quality", "my-rubric", now);
    expect(validateRubric(clone)).toBe(true);
    expect(clone).toMatchObject({ source: "user", sourceRubricId: "general-mission-quality" });
  });

  it("does not score missing evidence or self-evaluation", () => {
    const rubric = builtInRubrics[0];
    const finding: EvaluationFinding = {
      criterionId: "requirements",
      evaluatorId: "agent-a",
      implementationOwnerId: "agent-a",
      status: "pass",
      score: 5,
      confidence: "high",
      summary: { he: "עבר", en: "Passed" },
      evidenceIds: ["evidence-1"],
      missingEvidence: [],
      remediation: [],
    };
    expect(validateFinding(finding, rubric)).toBe(true);
    const result = certifyFindings(rubric, [finding], []);
    expect(result.status).toBe("needs-evidence");
    expect(result).not.toHaveProperty("score");
  });

  it("keeps evaluator disagreement visible", () => {
    const rubric = cloneBuiltInRubric("security-review", "security-user", now);
    const criterion = rubric.criteria[0];
    const evidence: EvaluationEvidence = {
      schemaVersion: 1,
      id: "security-evidence",
      type: "security",
      summary: { he: "סריקה", en: "Scan" },
      contentHash: deterministicHash("scan"),
      sourceActorId: "actor-a",
      createdAt: now,
    };
    const base = {
      criterionId: criterion.id,
      implementationOwnerId: "implementer",
      confidence: "high" as const,
      summary: { he: "ממצא", en: "Finding" },
      evidenceIds: [evidence.id],
      missingEvidence: [],
      remediation: [],
    };
    const result = certifyFindings(rubric, [
      { ...base, evaluatorId: "security-evaluator", status: "pass", score: 5 },
      { ...base, evaluatorId: "reality-checker", status: "fail", score: 0 },
    ], [evidence]);
    expect(result.status).toBe("needs-evidence");
    expect(result.criteria[0].status).toBe("disagreement");
  });

  it("blocking criteria and Reality Checker can prevent certification", () => {
    const rubric = cloneBuiltInRubric("security-review", "security-user", now);
    const evidence: EvaluationEvidence[] = rubric.criteria.map((criterion, index) => ({
      schemaVersion: 1,
      id: `evidence-${index}`,
      type: "security",
      summary: { he: "ראיה", en: "Evidence" },
      contentHash: deterministicHash(index),
      sourceActorId: "actor-a",
      createdAt: now,
    }));
    const findings: EvaluationFinding[] = rubric.criteria.map((criterion, index) => ({
      criterionId: criterion.id,
      evaluatorId: "security-evaluator",
      implementationOwnerId: "implementer",
      status: index === 0 ? "fail" : "pass",
      score: index === 0 ? 0 : 5,
      confidence: "high",
      summary: { he: "ממצא", en: "Finding" },
      evidenceIds: [`evidence-${index}`],
      missingEvidence: [],
      remediation: [],
    }));
    expect(certifyFindings(rubric, findings, evidence).status).toBe("failed");
    expect(certifyFindings(rubric, findings, evidence, true).status).toBe("blocked");
  });
});

describe("controlled experiment runtime and immutable versioning", () => {
  it("validates competitor and repetition bounds", () => {
    expect(validateExperiment(experiment(), "actor-a")).toBe(true);
    expect(validateExperiment(experiment({ competitorIds: ["one"] }), "actor-a")).toBe(false);
    expect(validateExperiment(experiment({ competitorIds: ["a", "b", "c", "d", "e", "f"] }), "actor-a")).toBe(false);
    expect(validateExperiment(experiment({ repetitionCount: 21 }), "actor-a")).toBe(false);
    expect(() => createExperiment({
      id: "invalid-experiment",
      actorId: "actor-a",
      name: "Invalid",
      missionSnapshotId: "mission",
      competitorIds: ["one"],
      rubricId: "rubric",
      evaluatorIds: ["reality-checker"],
      repetitionCount: 1,
      seed: "seed",
      createdAt: now,
      updatedAt: now,
    })).toThrow();
  });

  it("freezes input, pauses and resumes at exact progress", () => {
    const started = startExperiment(experiment(), refs, "run-1", now);
    expect(started.run.status).toBe("running");
    expect(Object.isFrozen(started.run.frozenRefs)).toBe(true);
    const paused = pauseRun(started.run, later);
    const resumed = continueRun(paused, refs, "2026-07-30T10:02:00.000Z");
    expect(resumed.status).toBe("running");
    expect(resumed.progress).toEqual(started.run.progress);
    expect(() => updateExperiment(started.experiment, { name: "Changed", updatedAt: later })).toThrow(/immutable/);
  });

  it("blocks resume on version drift and cancellation discards partial result IDs", () => {
    const run = pauseRun(startExperiment(experiment(), refs, "run-1", now).run, later);
    const drifted = refs.map((ref, index) => index ? ref : { ...ref, contentHash: deterministicHash("changed") });
    expect(continueRun(run, drifted, later).status).toBe("blocked");
    const cancelled = cancelRun({ ...run, status: "paused", resultIds: ["partial-result"] }, "user", later);
    expect(cancelled).toMatchObject({ status: "cancelled", resultIds: [], results: [] });
    expect(() => completeRun(cancelled, later)).toThrow();
  });

  it("executes deterministic competitors with criterion evidence, certification and traces", () => {
    const evaluation = experiment({ rubricId: "general-mission-quality" });
    const evaluationRefs = refs.map((ref) => ref.entityId === "rubric" ? { ...ref, entityId: "general-mission-quality" } : ref);
    const firstRun = startExperiment(evaluation, evaluationRefs, "run-1", now).run;
    const secondRun = startExperiment(evaluation, evaluationRefs, "run-2", now).run;
    const first = executeDeterministicEvaluation(evaluation, firstRun, builtInRubrics[0], later);
    const second = executeDeterministicEvaluation(evaluation, secondRun, builtInRubrics[0], later);
    expect(first.results).toHaveLength(evaluation.competitorIds.length * evaluation.repetitionCount);
    expect(first.results.every((result) => result.findings.length === builtInRubrics[0].criteria.length)).toBe(true);
    expect(first.results.every((result) => result.evidence.length >= builtInRubrics[0].criteria.length)).toBe(true);
    expect(first.results.map((result) => result.resultChecksum))
      .toEqual(second.results.map((result) => result.resultChecksum));
    expect(first.run).toMatchObject({ status: "completed", resultIds: first.results.map((item) => item.id) });
    expect(first.traces.at(-1)?.eventType).toBe("complete");
    expect(Object.isFrozen(first.results[0].findings)).toBe(true);
    expect(() => executeDeterministicEvaluation(evaluation, first.run, builtInRubrics[0], later)).toThrow(/immutable|match/);
  });

  it("prevents destructive version overwrite and makes rollback a new version", () => {
    let versions = createEntityVersion([], {
      entityId: "agent-a",
      version: "1.0",
      content: { prompt: "v1" },
      changelog: { he: "ראשון", en: "First" },
      createdAt: now,
      activate: true,
    });
    expect(() => createEntityVersion(versions, {
      entityId: "agent-a", version: "1.0", content: { prompt: "overwrite" }, changelog: { he: "שכתוב", en: "Overwrite" }, createdAt: later,
    })).toThrow(/immutable/);
    versions = createEntityVersion(versions, {
      entityId: "agent-a", version: "2.0", content: { prompt: "v2" }, changelog: { he: "שני", en: "Second" }, createdAt: later, activate: true,
    });
    versions = deprecateVersion(versions, { entityId: "agent-a", version: "1.0" });
    versions = rollbackAsNewVersion(versions, { entityId: "agent-a", version: "1.0" }, "3.0", later);
    expect(versions.find((item) => item.version === "1.0")?.status).toBe("deprecated");
    expect(versions.find((item) => item.version === "3.0")?.content).toEqual({ prompt: "v1" });
    const active = markVersionActive(versions, { entityId: "agent-a", version: "2.0" });
    expect(active.find((item) => item.version === "2.0")?.status).toBe("active");
    const snapshot = createImmutableSnapshot("snapshot-1", active[0], now);
    expect(Object.isFrozen(snapshot.value)).toBe(true);
  });
});

describe("safe traces, previews and Codex export", () => {
  const event = createTraceEvent({
    id: "trace-1",
    runId: "run-1",
    sequence: 1,
    timestamp: now,
    actorType: "evaluator",
    actorId: "reality-checker",
    eventType: "evaluation",
    summary: { he: "בדיקה עברה", en: "Check passed" },
    evidenceIds: ["evidence-1"],
  });

  it("exports safe JSON, Markdown and printable escaped HTML", () => {
    expect(JSON.parse(exportTraceJson([event])).events).toHaveLength(1);
    expect(exportTraceMarkdown([event])).toContain("Check passed");
    const injected = { ...event, summary: { he: "<script>", en: "<script>alert(1)</script>" } };
    expect(exportTraceHtml([injected])).toContain("&lt;script&gt;");
    expect(exportTraceHtml([injected])).not.toContain("<script>alert");
  });

  it("redacts secrets and local paths from trace summaries", () => {
    expect(safeTraceSummary({ he: "token=abc", en: "password secret" }).en).toContain("redacted");
    expect(safeTraceSummary({ he: "קובץ C:\\Users\\me\\secret.txt", en: "file C:\\Users\\me\\secret.txt" }).en)
      .not.toContain("C:\\Users");
  });

  it("creates preview-only actions and refuses execution", () => {
    const previewInput = {
      id: "preview-1",
      connectorType: "github",
      actionType: "pull-request-draft",
      targetSummary: "owner/repository",
      payloadSummary: { he: "טיוטה בלבד", en: "Draft only" },
      requiredPermissions: ["pull_requests:write"],
      riskLevel: "medium" as const,
      reversible: true,
      connectorAvailable: true,
      createdAt: now,
      expiresAt: later,
    };
    const preview = createConnectedPreview(previewInput);
    expect(preview.status).toBe("ready");
    expect(createConnectedPreview({ ...previewInput, connectorAvailable: false }).status).toBe("unavailable");
    expect(() => executeConnectedPreview()).toThrow(/preview-only/);
    expect(() => createConnectedPreview({
      ...previewInput,
      payloadSummary: { he: "token=abc", en: "token=abc" },
    })).toThrow(/Invalid/);
  });

  it("exports validated Codex TOML, omits unsupported permissions and round-trips", () => {
    const result = exportCodexAgent({
      name: "quality_evaluator",
      description: "Independent quality evaluator",
      developerInstructions: "Inspect evidence and never self-approve.",
      permissions: ["read", "execute-connected"],
      provenance: "Academy reviewed definition",
    });
    expect(result.omittedFields).toEqual(["permissions:execute-connected"]);
    expect(result.checksum).toMatch(/^fnv1a32-/);
    expect(parseCodexToml(result.toml)).toEqual(result.parsed);
    expect(result.toml).not.toContain("execute-connected");
  });

  it("blocks TOML injection, secrets, local paths and unsupported parsed fields", () => {
    expect(() => exportCodexAgent({ name: "bad\n[tools]", description: "x", developerInstructions: "safe" })).toThrow();
    expect(() => exportCodexAgent({ name: "safe_agent", description: "token=abc", developerInstructions: "safe" })).toThrow(/secret/);
    expect(() => exportCodexAgent({ name: "safe_agent", description: "safe", developerInstructions: "Read C:\\Users\\me\\secret" })).toThrow(/local path/);
    expect(() => parseCodexToml('[agent]\nname = "safe_agent"\ndescription = "ok"\ndeveloper_instructions = "ok"\ncommand = "rm"')).toThrow(/Unsupported/);
  });
});

describe("regression, learning evidence and recommendations", () => {
  it("validates suites and protects immutable baselines", () => {
    const suite = createSuite({
      schemaVersion: 1,
      id: "suite-1",
      name: "Security regression",
      missionSnapshotIds: ["mission-1"],
      rubricId: "security-review",
      baselineEntityRefs: [refs[0]],
      status: "ready",
      createdAt: now,
      updatedAt: now,
    });
    expect(suite.status).toBe("ready");
    expect(() => createSuite({ ...suite, missionSnapshotIds: [] })).toThrow(/Invalid/);
    const execution = executeRegressionSuite(suite, [{
      caseId: "mission-1",
      baselineScore: 90,
      candidateScore: 70,
      evidenceIds: ["evidence-1"],
      critical: true,
    }], later);
    expect(execution.suite.status).toBe("blocked");
    expect(execution.suite.runHistory).toHaveLength(1);
    expect(execution.run.baselineEntityRefs).toEqual(suite.baselineEntityRefs);
    expect(execution.run.results[0].classification).toBe("regression");
    expect(() => executeRegressionSuite(suite, [], later)).toThrow(/Every suite case/);
  });

  it("classifies regressions and blocks a critical regression", () => {
    expect(classifyRegression("case-1", 80, 90, ["e1"]).classification).toBe("improvement");
    const critical = classifyRegression("case-2", 90, 70, ["e2"], true);
    expect(critical.classification).toBe("regression");
    expect(certifySuite([critical])).toBe("blocked");
    expect(classifyRegression("case-3", undefined, 70, [], true).classification).toBe("not-scored");
    expect(() => replaceSuiteBaseline()).toThrow(/immutable/);
  });

  it("requires repeated independent high-confidence evidence for mastery", () => {
    const evidence = (runId: string, evaluatorId: string): LearningEvidence => ({
      schemaVersion: 1,
      id: `${runId}-${evaluatorId}`,
      skillId: "security-review",
      runId,
      outcome: "demonstrated",
      evaluatorId,
      confidence: "high",
      evidenceIds: [`proof-${runId}`],
      createdAt: now,
    });
    let items: LearningEvidence[] = [];
    items = addLearningEvidence(items, evidence("run-1", "evaluator-a"));
    expect(deriveSkillLevel(items)).toBe("demonstrated");
    items = addLearningEvidence(items, evidence("run-2", "evaluator-b"));
    items = addLearningEvidence(items, evidence("run-3", "evaluator-a"));
    expect(deriveSkillLevel(items)).toBe("mastered");
    expect(removeLearningEvidence(items, "run-3-evaluator-a")).toHaveLength(2);
  });

  it("labels low sample recommendations with low confidence", () => {
    const recommendation = buildTeamRecommendation({
      teamId: "qa-team",
      source: "Observed locally",
      comparableRunCount: 2,
      successRate: 150,
      averageRetries: -1,
      commonFailures: ["requirement gap"],
      freshness: now,
      limitations: [],
    });
    expect(recommendation).toMatchObject({ confidence: "low", successRate: 100, averageRetries: 0 });
    expect(recommendation.limitations).toHaveLength(1);
  });

  it("validates failure cases and rejects prototype pollution", () => {
    const failure: FailureCase = {
      schemaVersion: 1,
      id: "failure-1",
      title: { he: "כשל", en: "Failure" },
      category: "stale context",
      symptom: { he: "פלט ישן", en: "Stale output" },
      rootCause: { he: "הקשר ישן", en: "Stale context" },
      missedSignal: { he: "Hash שונה", en: "Hash changed" },
      correctiveAction: { he: "יצירת run חדש", en: "Create a new run" },
      reusableRule: { he: "בדיקת drift", en: "Check drift" },
      evidenceIds: ["evidence-1"],
      sourceRunIds: ["run-1"],
      createdAt: now,
      updatedAt: now,
    };
    expect(createFailureCase(failure)).toEqual(failure);
    expect(() => createFailureCase(JSON.parse(JSON.stringify({ ...failure, __proto__: { admin: true } })))).not.toThrow();
    expect(() => createFailureCase(JSON.parse(`{"schemaVersion":1,"id":"failure-1","__proto__":{"admin":true}}`))).toThrow();
  });
});

describe("bounded actor-scoped repository", () => {
  it("persists checksummed domains and isolates actors", () => {
    const storage = new MemoryStorage();
    const snapshot = emptySnapshot();
    snapshot.experiments = [experiment()];
    expect(saveEvaluationRepository("actor-a", snapshot, storage, now)).toBe(true);
    expect(loadEvaluationRepository("actor-a", storage).experiments).toHaveLength(1);
    expect(loadEvaluationRepository("actor-b", storage).experiments).toHaveLength(0);
    expect(withBuiltInRubrics(loadEvaluationRepository("actor-a", storage)).rubrics).toHaveLength(8);
  });

  it("quarantines tampered data instead of accepting forged results", () => {
    const storage = new MemoryStorage();
    const snapshot = emptySnapshot();
    snapshot.experiments = [experiment()];
    saveEvaluationRepository("actor-a", snapshot, storage, now);
    const key = [...storage.values.keys()].find((item) => item.includes("evaluation-experiments"))!;
    const parsed = JSON.parse(storage.getItem(key)!);
    parsed.items[0].name = "forged";
    storage.setItem(key, JSON.stringify(parsed));
    const recovered = loadEvaluationRepository("actor-a", storage);
    expect(recovered.experiments).toEqual([]);
    expect(recovered.recoveredDomains).toContain("experiments");
    expect([...storage.values.keys()].some((item) => item.startsWith(`${key}:quarantine:`))).toBe(true);
  });

  it("rejects a forged result even when the attacker recomputes the domain envelope checksum", () => {
    const storage = new MemoryStorage();
    const evaluation = experiment({ rubricId: "general-mission-quality" });
    const evaluationRefs = refs.map((ref) => ref.entityId === "rubric" ? { ...ref, entityId: "general-mission-quality" } : ref);
    const started = startExperiment(evaluation, evaluationRefs, "run-forgery", now).run;
    const completed = executeDeterministicEvaluation(evaluation, started, builtInRubrics[0], later);
    const snapshot = emptySnapshot();
    snapshot.runs = [completed.run];
    snapshot.evidence = completed.evidence;
    snapshot.traces = completed.traces;
    saveEvaluationRepository("actor-a", snapshot, storage, now);

    const key = [...storage.values.keys()].find((item) => item.includes("evaluation-runs"))!;
    const parsed = JSON.parse(storage.getItem(key)!);
    parsed.items[0].results[0].certification.status = "blocked";
    const base = {
      schemaVersion: parsed.schemaVersion,
      actorId: parsed.actorId,
      items: parsed.items,
      savedAt: parsed.savedAt,
    };
    parsed.checksum = deterministicHash(base);
    storage.setItem(key, JSON.stringify(parsed));

    expect(loadEvaluationRepository("actor-a", storage).runs).toEqual([]);
  });

  it("rolls back a multi-domain write on quota failure", () => {
    const storage = new MemoryStorage();
    const before = emptySnapshot();
    saveEvaluationRepository("actor-a", before, storage, now);
    const originals = new Map(storage.values);
    storage.failAfter = 1;
    storage.failOnce = true;
    const changed = emptySnapshot();
    changed.experiments = [experiment()];
    expect(saveEvaluationRepository("actor-a", changed, storage, later)).toBe(false);
    expect(storage.values).toEqual(originals);
  });

  it("applies bounded retention and independent reset", () => {
    const old = "2025-01-01T00:00:00.000Z";
    const snapshot = emptySnapshot();
    snapshot.experiments = [experiment()];
    snapshot.previews = [{
      schemaVersion: 1,
      id: "preview-old",
      connectorType: "github",
      actionType: "draft",
      targetSummary: "repository",
      payloadSummary: { he: "טיוטה", en: "Draft" },
      requiredPermissions: [],
      riskLevel: "low",
      reversible: true,
      status: "ready",
      createdAt: old,
      expiresAt: "2025-01-02T00:00:00.000Z",
    }];
    expect(applyEvaluationRetention(snapshot, Date.parse(now)).previews).toEqual([]);
    const storage = new MemoryStorage();
    saveEvaluationRepository("actor-a", snapshot, storage, now);
    resetEvaluationDomain("actor-a", "experiments", storage);
    expect(loadEvaluationRepository("actor-a", storage).experiments).toEqual([]);
  });

  it("retains old certified runs, traces and evidence referenced by certified results", () => {
    const evaluation = experiment({ rubricId: "general-mission-quality" });
    const evaluationRefs = refs.map((ref) => ref.entityId === "rubric" ? { ...ref, entityId: "general-mission-quality" } : ref);
    const started = startExperiment(evaluation, evaluationRefs, "run-certified-retention", now).run;
    const completed = executeDeterministicEvaluation(evaluation, started, builtInRubrics[0], later);
    const certifiedResult = {
      ...completed.run.results[0],
      certification: { ...completed.run.results[0].certification, status: "certified" as const },
    };
    const certifiedRun = {
      ...completed.run,
      results: [certifiedResult],
      resultIds: [certifiedResult.id],
      evidenceIds: certifiedResult.evidence.map((item) => item.id),
      updatedAt: "2025-01-01T00:00:00.000Z",
      completedAt: "2025-01-01T00:00:00.000Z",
    };
    const oldEvidence = certifiedResult.evidence.map((item) => ({ ...item, createdAt: "2025-01-01T00:00:00.000Z" }));
    const oldTrace = { ...completed.traces[0], runId: certifiedRun.id, timestamp: "2025-01-01T00:00:00.000Z" };
    const snapshot = emptySnapshot();
    snapshot.runs = [certifiedRun];
    snapshot.evidence = oldEvidence;
    snapshot.traces = [oldTrace];

    const retained = applyEvaluationRetention(snapshot, Date.parse("2026-07-30T10:00:00.000Z"));
    expect(retained.runs).toHaveLength(1);
    expect(retained.evidence).toHaveLength(oldEvidence.length);
    expect(retained.traces).toHaveLength(1);
  });
});
