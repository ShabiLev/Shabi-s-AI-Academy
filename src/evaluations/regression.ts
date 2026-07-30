import { deterministicHash } from "./hash";
import type { EvaluationSuite, RegressionCaseResult, RegressionSuiteRun } from "./types";
import { hasUnsafeContent, isIsoDate, SAFE_ID } from "./validation";

export function createSuite(suite: EvaluationSuite): EvaluationSuite {
  if (hasUnsafeContent(suite) || suite.schemaVersion !== 1 || !SAFE_ID.test(suite.id)
    || !suite.name.trim() || suite.name.length > 160 || suite.missionSnapshotIds.length < 1
    || suite.missionSnapshotIds.length > 100 || suite.missionSnapshotIds.some((id) => !SAFE_ID.test(id))
    || new Set(suite.missionSnapshotIds).size !== suite.missionSnapshotIds.length
    || !SAFE_ID.test(suite.rubricId) || suite.baselineEntityRefs.length < 1
    || suite.baselineEntityRefs.some((ref) => !SAFE_ID.test(ref.entityId) || !ref.contentHash)
    || !["draft", "ready", "running", "completed", "blocked"].includes(suite.status)
    || (suite.runHistory !== undefined && (!Array.isArray(suite.runHistory) || suite.runHistory.length > 100))
    || !isIsoDate(suite.createdAt) || !isIsoDate(suite.updatedAt)) throw new Error("Invalid evaluation suite.");
  return structuredClone(suite);
}

export function classifyRegression(
  caseId: string,
  baselineScore: number | undefined,
  candidateScore: number | undefined,
  evidenceIds: string[],
  critical = false,
  tolerance = 0.01,
): RegressionCaseResult {
  if (baselineScore === undefined || candidateScore === undefined) {
    return {
      caseId,
      ...(baselineScore === undefined ? {} : { baselineScore }),
      ...(candidateScore === undefined ? {} : { candidateScore }),
      classification: "not-scored",
      critical,
      evidenceIds,
    };
  }
  const difference = candidateScore - baselineScore;
  return {
    caseId,
    baselineScore,
    candidateScore,
    classification: difference > tolerance ? "improvement" : difference < -tolerance ? "regression" : "no-change",
    critical,
    evidenceIds,
  };
}

export function certifySuite(results: readonly RegressionCaseResult[]): EvaluationSuite["status"] {
  if (results.some((item) => item.classification === "not-scored")) return "blocked";
  if (results.some((item) => item.critical && item.classification === "regression")) return "blocked";
  return "completed";
}

export interface RegressionSuiteCaseInput {
  caseId: string;
  baselineScore?: number;
  candidateScore?: number;
  evidenceIds: string[];
  critical?: boolean;
}

export function executeRegressionSuite(
  suite: EvaluationSuite,
  cases: readonly RegressionSuiteCaseInput[],
  now: string,
): { suite: EvaluationSuite; results: RegressionCaseResult[]; run: RegressionSuiteRun } {
  if (!["ready", "completed", "blocked"].includes(suite.status)) throw new Error("Suite is not ready to run.");
  if (cases.length !== suite.missionSnapshotIds.length) throw new Error("Every suite case must be executed exactly once.");
  const expected = new Set(suite.missionSnapshotIds);
  if (cases.some((item) => !expected.has(item.caseId)) || new Set(cases.map((item) => item.caseId)).size !== expected.size) {
    throw new Error("Suite cases do not match immutable mission snapshots.");
  }
  const results = cases.map((item) => classifyRegression(
    item.caseId,
    item.baselineScore,
    item.candidateScore,
    item.evidenceIds,
    item.critical,
  ));
  const status = certifySuite(results);
  const run: RegressionSuiteRun = {
    schemaVersion: 1,
    id: `suite-run-${deterministicHash({
      suiteId: suite.id,
      results: results.map((result) => ({
        caseId: result.caseId,
        baselineScore: result.baselineScore ?? "not-scored",
        candidateScore: result.candidateScore ?? "not-scored",
        classification: result.classification,
        critical: result.critical,
        evidenceIds: result.evidenceIds,
      })),
      now,
    }).slice("fnv1a32-".length)}`,
    suiteId: suite.id,
    baselineEntityRefs: structuredClone(suite.baselineEntityRefs),
    results,
    status: status === "blocked" ? "blocked" : "completed",
    createdAt: now,
    completedAt: now,
  };
  return {
    suite: { ...suite, status, updatedAt: now, runHistory: [...(suite.runHistory ?? []), run].slice(-100) },
    results,
    run,
  };
}

export function replaceSuiteBaseline(): never {
  throw new Error("Baselines are immutable; create a new suite version.");
}
