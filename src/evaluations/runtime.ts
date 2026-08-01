import { deterministicHash, deterministicSeed, immutableCopy } from "./hash";
import { certifyFindings } from "./scoring";
import { createTraceEvent } from "./trace";
import type {
  CertificationResult,
  DeterministicEvaluationOutput,
  EvaluationCompetitorResult,
  EvaluationEvidence,
  EvaluationExperiment,
  EvaluationFinding,
  EvaluationRubric,
  EvaluationRun,
  TraceEvent,
  VersionedEntityRef,
} from "./types";
import { validateExperiment } from "./validation";
import { hasVersionDrift } from "./versioning";

interface EvaluationResultChecksumInput {
  competitorRef: VersionedEntityRef;
  repetition: number;
  seed: string;
  evaluatorIds: string[];
  findings: EvaluationFinding[];
  evidence: EvaluationEvidence[];
  certification: CertificationResult;
}

export function calculateEvaluationResultChecksum(
  inputHash: string,
  result: EvaluationResultChecksumInput,
): string {
  const normalizeFinding = (finding: EvaluationFinding) => ({
    criterionId: finding.criterionId,
    evaluatorId: finding.evaluatorId,
    implementationOwnerId: finding.implementationOwnerId ?? null,
    status: finding.status,
    score: finding.score ?? null,
    confidence: finding.confidence,
    summary: finding.summary,
    evidenceHashes: finding.evidenceIds.map((id) =>
      result.evidence.find((item) => item.id === id)?.contentHash ?? null),
    missingEvidence: finding.missingEvidence,
    remediation: finding.remediation,
  });
  return deterministicHash({
    inputHash,
    competitorRef: result.competitorRef,
    repetition: result.repetition,
    seed: result.seed,
    evaluatorIds: result.evaluatorIds,
    findings: result.findings.map(normalizeFinding),
    evidence: result.evidence.map((item) => ({
      type: item.type,
      summary: item.summary,
      contentHash: item.contentHash,
      sourceActorId: item.sourceActorId,
    })),
    certification: {
      status: result.certification.status,
      score: result.certification.score ?? null,
      passingScore: result.certification.passingScore,
      criteria: result.certification.criteria.map((criterion) => ({
        criterionId: criterion.criterionId,
        status: criterion.status,
        normalizedScore: criterion.normalizedScore ?? null,
        weightedScore: criterion.weightedScore ?? null,
        findings: criterion.findings.map(normalizeFinding),
      })),
      reasons: result.certification.reasons,
    },
  });
}

export function createExperiment(input: Omit<EvaluationExperiment, "schemaVersion" | "status" | "resultIds">): EvaluationExperiment {
  const experiment: EvaluationExperiment = { ...input, schemaVersion: 1, status: "draft", resultIds: [] };
  if (!validateExperiment(experiment, input.actorId)) throw new Error("Invalid evaluation experiment.");
  return experiment;
}

export function updateExperiment(experiment: EvaluationExperiment, patch: Partial<Pick<EvaluationExperiment, "name" | "missionSnapshotId" | "competitorIds" | "rubricId" | "evaluatorIds" | "repetitionCount" | "seed">> & { updatedAt: string }): EvaluationExperiment {
  if (experiment.status !== "draft" && experiment.status !== "ready") throw new Error("Started experiments are immutable.");
  const next = { ...experiment, ...patch };
  if (!validateExperiment(next, experiment.actorId)) throw new Error("Invalid evaluation experiment update.");
  return next;
}

export function validateExperimentSetup(experiment: EvaluationExperiment, refs: readonly VersionedEntityRef[]): string[] {
  const errors: string[] = [];
  if (!validateExperiment(experiment, experiment.actorId)) errors.push("invalid-experiment");
  if (refs.length < experiment.competitorIds.length + 1) errors.push("missing-version-references");
  if (refs.some((ref) => !ref.contentHash)) errors.push("missing-content-hash");
  return errors;
}

export function startExperiment(
  experiment: EvaluationExperiment,
  refs: readonly VersionedEntityRef[],
  runId: string,
  now: string,
): { experiment: EvaluationExperiment; run: EvaluationRun } {
  const errors = validateExperimentSetup(experiment, refs);
  if (errors.length) throw new Error(errors.join(","));
  if (!["draft", "ready"].includes(experiment.status)) throw new Error("Experiment cannot be started.");
  const frozenRefs = immutableCopy([...refs]);
  return {
    experiment: { ...experiment, status: "running", updatedAt: now },
    run: immutableCopy({
      schemaVersion: 1,
      id: runId,
      actorId: experiment.actorId,
      experimentId: experiment.id,
      status: "running",
      inputHash: deterministicHash({
        missionSnapshotId: experiment.missionSnapshotId,
        competitorIds: experiment.competitorIds,
        rubricId: experiment.rubricId,
        evaluatorIds: experiment.evaluatorIds,
        repetitions: experiment.repetitionCount,
        seed: experiment.seed,
        refs: frozenRefs,
      }),
      frozenRefs,
      progress: { competitorIndex: 0, repetitionIndex: 0, evaluatorIndex: 0 },
      resultIds: [],
      results: [],
      evidenceIds: [],
      startedAt: now,
      updatedAt: now,
    }),
  };
}

export function pauseRun(run: EvaluationRun, now: string): EvaluationRun {
  if (run.status !== "running") throw new Error("Only a running evaluation can be paused.");
  return immutableCopy({ ...run, status: "paused", pausedAt: now, updatedAt: now });
}

export function continueRun(run: EvaluationRun, currentRefs: readonly VersionedEntityRef[], now: string): EvaluationRun {
  if (run.status !== "paused" && run.status !== "needs-evidence") throw new Error("Run is not resumable.");
  if (hasVersionDrift(run.frozenRefs, currentRefs)) {
    return immutableCopy({ ...run, status: "blocked", updatedAt: now });
  }
  const { pausedAt: _pausedAt, ...checkpoint } = run;
  void _pausedAt;
  return immutableCopy({ ...checkpoint, status: "running", updatedAt: now });
}

export function advanceRun(run: EvaluationRun, progress: EvaluationRun["progress"], resultId: string | undefined, evidenceIds: readonly string[], now: string): EvaluationRun {
  if (run.status !== "running") throw new Error("Only a running evaluation can advance.");
  return immutableCopy({
    ...run,
    progress,
    resultIds: resultId && !run.resultIds.includes(resultId) ? [...run.resultIds, resultId] : run.resultIds,
    evidenceIds: [...new Set([...run.evidenceIds, ...evidenceIds])],
    updatedAt: now,
  });
}

export function cancelRun(run: EvaluationRun, reason: string, now: string): EvaluationRun {
  if (["completed", "cancelled"].includes(run.status)) throw new Error("Terminal evaluation cannot be cancelled.");
  return immutableCopy({
    ...run,
    status: "cancelled",
    resultIds: [],
    results: [],
    cancellationReason: reason.slice(0, 500),
    updatedAt: now,
  });
}

export function completeRun(run: EvaluationRun, now: string): EvaluationRun {
  if (run.status !== "running") throw new Error("Only a running evaluation can complete.");
  return immutableCopy({ ...run, status: "completed", completedAt: now, updatedAt: now });
}

function deterministicFinding(
  run: EvaluationRun,
  experiment: EvaluationExperiment,
  rubric: EvaluationRubric,
  competitorId: string,
  competitorIndex: number,
  repetition: number,
  criterionIndex: number,
  now: string,
): { finding: EvaluationFinding; evidence: EvaluationEvidence[] } {
  const criterion = rubric.criteria[criterionIndex];
  const evaluatorId = experiment.evaluatorIds[(competitorIndex + repetition + criterionIndex) % experiment.evaluatorIds.length];
  const numericSeed = deterministicSeed(experiment.seed, `${competitorId}:${criterion.id}`, repetition);
  const span = criterion.scoringScale.max - criterion.scoringScale.min;
  const score = criterion.scoringScale.min + (numericSeed % (Math.floor(span) + 1));
  const normalized = (score - criterion.scoringScale.min) / span;
  const status: EvaluationFinding["status"] = normalized >= 0.7 ? "pass" : normalized >= 0.4 ? "partial" : "fail";
  const evidence = criterion.requiredEvidenceTypes.map((type, evidenceIndex): EvaluationEvidence => {
    const summary = {
      he: `ראיית סימולציה דטרמיניסטית עבור ${criterion.name.he}`,
      en: `Deterministic simulation evidence for ${criterion.name.en}`,
    };
    return {
      schemaVersion: 1,
      id: `${run.id}-c${competitorIndex}-r${repetition}-k${criterionIndex}-e${evidenceIndex}`,
      type,
      summary,
      contentHash: deterministicHash({
        inputHash: run.inputHash,
        competitorId,
        repetition,
        criterionId: criterion.id,
        type,
        numericSeed,
      }),
      sourceActorId: run.actorId,
      createdAt: now,
    };
  });
  return {
    finding: {
      criterionId: criterion.id,
      evaluatorId,
      implementationOwnerId: competitorId,
      status,
      score,
      confidence: "high",
      summary: {
        he: `Academy deterministic evaluation: ציון ${score} מתוך ${criterion.scoringScale.max}`,
        en: `Academy deterministic evaluation: score ${score} of ${criterion.scoringScale.max}`,
      },
      evidenceIds: evidence.map((item) => item.id),
      missingEvidence: [],
      remediation: status === "pass" ? [] : [{
        he: `יש לשפר את ${criterion.name.he} ולהריץ הערכה חדשה.`,
        en: `Improve ${criterion.name.en.toLowerCase()} and create a new evaluation run.`,
      }],
    },
    evidence,
  };
}

export function executeDeterministicEvaluation(
  experiment: EvaluationExperiment,
  run: EvaluationRun,
  rubric: EvaluationRubric,
  now: string,
): DeterministicEvaluationOutput {
  if (run.status !== "running" || experiment.id !== run.experimentId || experiment.rubricId !== rubric.id) {
    throw new Error("Evaluation run, experiment and rubric do not match.");
  }
  if (run.results.length || run.resultIds.length) throw new Error("Certified evaluation results are immutable.");
  const results: EvaluationCompetitorResult[] = [];
  const allEvidence: EvaluationEvidence[] = [];
  const traces: TraceEvent[] = [];
  let sequence = 0;
  traces.push(createTraceEvent({
    id: `${run.id}-trace-${sequence}`,
    runId: run.id,
    sequence: sequence++,
    timestamp: now,
    actorType: "system",
    actorId: "academy-simulator",
    eventType: "snapshot",
    summary: { he: "קלט ההערכה הוקפא ואומת.", en: "Evaluation input was frozen and verified." },
    evidenceIds: [],
    metadata: { phase: "freeze", gateStatus: "PASS", nextAction: "execute" },
  }));
  experiment.competitorIds.forEach((competitorId, competitorIndex) => {
    const competitorRef = run.frozenRefs.find((ref) => ref.entityId === competitorId);
    if (!competitorRef) throw new Error(`Missing frozen competitor reference: ${competitorId}`);
    for (let repetition = 0; repetition < experiment.repetitionCount; repetition += 1) {
      const findings: EvaluationFinding[] = [];
      const evidence: EvaluationEvidence[] = [];
      rubric.criteria.forEach((_criterion, criterionIndex) => {
        const generated = deterministicFinding(run, experiment, rubric, competitorId, competitorIndex, repetition, criterionIndex, now);
        findings.push(generated.finding);
        evidence.push(...generated.evidence);
      });
      const certification = certifyFindings(rubric, findings, evidence);
      const resultWithoutChecksum = {
        schemaVersion: 1,
        id: `${run.id}-c${competitorIndex}-r${repetition}`,
        runId: run.id,
        competitorId,
        competitorRef,
        repetition,
        seed: experiment.seed,
        evaluatorIds: [...experiment.evaluatorIds],
        findings,
        evidence,
        certification,
        completedAt: now,
      } satisfies Omit<EvaluationCompetitorResult, "resultChecksum">;
      const result: EvaluationCompetitorResult = immutableCopy({
        ...resultWithoutChecksum,
        resultChecksum: calculateEvaluationResultChecksum(run.inputHash, resultWithoutChecksum),
      });
      results.push(result);
      allEvidence.push(...evidence);
      traces.push(createTraceEvent({
        id: `${run.id}-trace-${sequence}`,
        runId: run.id,
        sequence: sequence++,
        timestamp: now,
        actorType: "evaluator",
        actorId: experiment.evaluatorIds[0],
        eventType: "evaluation",
        summary: {
          he: `הערכת סימולציה דטרמיניסטית הושלמה עבור מתחרה ${competitorIndex + 1}, חזרה ${repetition + 1}.`,
          en: `Deterministic simulation completed for competitor ${competitorIndex + 1}, repetition ${repetition + 1}.`,
        },
        evidenceIds: evidence.map((item) => item.id).slice(0, 30),
        metadata: { phase: "evaluate", gateStatus: certification.status === "certified" ? "PASS" : "FAIL" },
      }));
    }
  });
  const completedRun = immutableCopy({
    ...run,
    status: "completed" as const,
    progress: {
      competitorIndex: experiment.competitorIds.length - 1,
      repetitionIndex: experiment.repetitionCount - 1,
      evaluatorIndex: experiment.evaluatorIds.length - 1,
    },
    results,
    resultIds: results.map((item) => item.id),
    evidenceIds: allEvidence.map((item) => item.id),
    updatedAt: now,
    completedAt: now,
  });
  traces.push(createTraceEvent({
    id: `${run.id}-trace-${sequence}`,
    runId: run.id,
    sequence,
    timestamp: now,
    actorType: "system",
    actorId: "academy-simulator",
    eventType: "complete",
    summary: { he: "ההערכה הדטרמיניסטית הושלמה.", en: "The deterministic evaluation completed." },
    evidenceIds: [],
    metadata: { phase: "publish", gateStatus: "PASS" },
  }));
  return immutableCopy({ run: completedRun, results, evidence: allEvidence, traces });
}

export function forkExperiment(experiment: EvaluationExperiment, id: string, now: string): EvaluationExperiment {
  return { ...experiment, id, status: "draft", resultIds: [], createdAt: now, updatedAt: now, completedAt: undefined };
}
