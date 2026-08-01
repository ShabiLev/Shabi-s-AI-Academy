/* eslint-disable react-refresh/only-export-components */
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deterministicHash } from "./hash";
import { createFailureCase as validateAndCreateFailureCase } from "./learning";
import { createConnectedPreview as validateAndCreatePreview } from "./connectedPreview";
import { createSuite as validateAndCreateSuite, executeRegressionSuite, type RegressionSuiteCaseInput } from "./regression";
import {
  applyEvaluationRetention,
  loadEvaluationRepository,
  normalizeEvaluationActorId,
  saveEvaluationRepository,
  withBuiltInRubrics,
} from "./repository";
import {
  cancelRun as cancelRuntimeRun,
  continueRun as continueRuntimeRun,
  createExperiment as createRuntimeExperiment,
  executeDeterministicEvaluation,
  pauseRun as pauseRuntimeRun,
  startExperiment as startRuntimeExperiment,
  updateExperiment as updateRuntimeExperiment,
} from "./runtime";
import type {
  EvaluationExperiment,
  EvaluationRepositorySnapshot,
  EvaluationRun,
  EvaluationSuite,
  FailureCase,
  ConnectedActionPreview,
  VersionedEntityRef,
} from "./types";

interface EvaluationContextValue {
  actorId: string;
  experiments: EvaluationExperiment[];
  runs: EvaluationRun[];
  suites: EvaluationSuite[];
  failureCases: FailureCase[];
  snapshot: EvaluationRepositorySnapshot;
  createExperiment(input: Omit<EvaluationExperiment, "schemaVersion" | "status" | "resultIds">): EvaluationExperiment;
  updateExperiment(id: string, patch: Parameters<typeof updateRuntimeExperiment>[1]): EvaluationExperiment;
  start(id: string, refs?: readonly VersionedEntityRef[]): EvaluationRun;
  pause(id: string): EvaluationRun;
  continue(id: string, refs?: readonly VersionedEntityRef[]): EvaluationRun;
  complete(id: string): EvaluationRun;
  cancel(id: string, reason?: string): EvaluationRun;
  createSuite(suite: EvaluationSuite): EvaluationSuite;
  runSuite(id: string, cases: readonly RegressionSuiteCaseInput[]): EvaluationSuite;
  createFailureCase(failure: FailureCase): FailureCase;
  createPreview(preview: Parameters<typeof validateAndCreatePreview>[0]): ConnectedActionPreview;
}

const EvaluationContext = createContext<EvaluationContextValue | undefined>(undefined);
const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function inferredRefs(experiment: EvaluationExperiment): VersionedEntityRef[] {
  return [experiment.missionSnapshotId, experiment.rubricId, ...experiment.competitorIds, ...experiment.evaluatorIds]
    .map((entityId) => {
      const version = entityId.match(/-v(\d+(?:\.\d+)*)$/i)?.[1] ?? "1.0";
      return { entityId, version, contentHash: deterministicHash({ entityId, version }) };
    });
}

export function EvaluationProvider({
  actorId = "local-guest",
  storage = localStorage,
  children,
}: PropsWithChildren<{ actorId?: string; storage?: Storage }>) {
  const normalizedActorId = normalizeEvaluationActorId(actorId);
  const loadSnapshot = useCallback(() =>
    withBuiltInRubrics(applyEvaluationRetention(loadEvaluationRepository(normalizedActorId, storage))),
  [normalizedActorId, storage]);
  const [repository, setRepository] = useState<{ actorId: string; snapshot: EvaluationRepositorySnapshot }>(() => ({
    actorId: normalizedActorId,
    snapshot: loadSnapshot(),
  }));
  const activeRepository = repository.actorId === normalizedActorId
    ? repository
    : { actorId: normalizedActorId, snapshot: loadSnapshot() };
  const snapshot = activeRepository.snapshot;

  useEffect(() => {
    if (repository.actorId === normalizedActorId) return;
    // Actor changes are an isolation boundary, not a repository merge.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRepository({ actorId: normalizedActorId, snapshot: loadSnapshot() });
  }, [loadSnapshot, normalizedActorId, repository.actorId]);

  const commit = useCallback((producer: (current: EvaluationRepositorySnapshot) => EvaluationRepositorySnapshot) => {
    let result = activeRepository.snapshot;
    setRepository((current) => {
      const currentSnapshot = current.actorId === normalizedActorId ? current.snapshot : loadSnapshot();
      result = producer(currentSnapshot);
      if (!saveEvaluationRepository(normalizedActorId, result, storage)) throw new Error("Evaluation repository write failed.");
      return { actorId: normalizedActorId, snapshot: result };
    });
    return result;
  }, [activeRepository.snapshot, loadSnapshot, normalizedActorId, storage]);

  const value = useMemo<EvaluationContextValue>(() => ({
    actorId: normalizedActorId,
    experiments: snapshot.experiments,
    runs: snapshot.runs,
    suites: snapshot.suites,
    failureCases: snapshot.failures,
    snapshot,
    createExperiment: (input) => {
      const created = createRuntimeExperiment({ ...input, actorId: normalizedActorId });
      commit((current) => ({ ...current, experiments: [...current.experiments, created].slice(-100) }));
      return created;
    },
    updateExperiment: (experimentId, patch) => {
      const currentExperiment = snapshot.experiments.find((item) => item.id === experimentId);
      if (!currentExperiment) throw new Error("Unknown evaluation experiment.");
      const updated = updateRuntimeExperiment(currentExperiment, patch);
      commit((current) => ({ ...current, experiments: current.experiments.map((item) => item.id === experimentId ? updated : item) }));
      return updated;
    },
    start: (experimentId, refs) => {
      const experiment = snapshot.experiments.find((item) => item.id === experimentId);
      if (!experiment) throw new Error("Unknown evaluation experiment.");
      const started = startRuntimeExperiment(experiment, refs ?? inferredRefs(experiment), id("evaluation-run"), nowIso());
      commit((current) => ({
        ...current,
        experiments: current.experiments.map((item) => item.id === experimentId ? started.experiment : item),
        runs: [...current.runs, started.run].slice(-200),
      }));
      return started.run;
    },
    pause: (experimentId) => {
      const run = [...snapshot.runs].reverse().find((item) => item.experimentId === experimentId);
      if (!run) throw new Error("Unknown evaluation run.");
      const updated = pauseRuntimeRun(run, nowIso());
      commit((current) => ({ ...current, runs: current.runs.map((item) => item.id === run.id ? updated : item),
        experiments: current.experiments.map((item) => item.id === experimentId ? { ...item, status: "paused", updatedAt: updated.updatedAt } : item) }));
      return updated;
    },
    continue: (experimentId, refs) => {
      const experiment = snapshot.experiments.find((item) => item.id === experimentId);
      const run = [...snapshot.runs].reverse().find((item) => item.experimentId === experimentId);
      if (!experiment || !run) throw new Error("Unknown evaluation run.");
      const updated = continueRuntimeRun(run, refs ?? inferredRefs(experiment), nowIso());
      commit((current) => ({ ...current, runs: current.runs.map((item) => item.id === run.id ? updated : item),
        experiments: current.experiments.map((item) => item.id === experimentId ? { ...item, status: updated.status, updatedAt: updated.updatedAt } : item) }));
      return updated;
    },
    complete: (experimentId) => {
      const experiment = snapshot.experiments.find((item) => item.id === experimentId);
      const run = [...snapshot.runs].reverse().find((item) => item.experimentId === experimentId);
      const rubric = snapshot.rubrics.find((item) => item.id === experiment?.rubricId);
      if (!experiment || !run || !rubric) throw new Error("Unknown or incomplete evaluation setup.");
      const output = executeDeterministicEvaluation(experiment, run, rubric, nowIso());
      commit((current) => ({
        ...current,
        experiments: current.experiments.map((item) => item.id === experimentId
          ? { ...item, status: "completed", resultIds: output.run.resultIds, updatedAt: output.run.updatedAt, completedAt: output.run.completedAt }
          : item),
        runs: current.runs.map((item) => item.id === run.id ? output.run : item),
        evidence: [...current.evidence, ...output.evidence].slice(-1_000),
        traces: [...current.traces, ...output.traces].slice(-5_000),
      }));
      return output.run;
    },
    cancel: (experimentId, reason = "Cancelled by user") => {
      const run = [...snapshot.runs].reverse().find((item) => item.experimentId === experimentId);
      if (!run) throw new Error("Unknown evaluation run.");
      const updated = cancelRuntimeRun(run, reason, nowIso());
      commit((current) => ({ ...current, runs: current.runs.map((item) => item.id === run.id ? updated : item),
        experiments: current.experiments.map((item) => item.id === experimentId ? { ...item, status: "cancelled", resultIds: [], updatedAt: updated.updatedAt } : item) }));
      return updated;
    },
    createSuite: (suite) => {
      const created = validateAndCreateSuite(suite);
      commit((current) => ({ ...current, suites: [...current.suites, created].slice(-100) }));
      return created;
    },
    runSuite: (suiteId, cases) => {
      const suite = snapshot.suites.find((item) => item.id === suiteId);
      if (!suite) throw new Error("Unknown evaluation suite.");
      const output = executeRegressionSuite(suite, cases, nowIso());
      commit((current) => ({ ...current, suites: current.suites.map((item) => item.id === suiteId ? output.suite : item) }));
      return output.suite;
    },
    createFailureCase: (failure) => {
      const created = validateAndCreateFailureCase(failure);
      commit((current) => ({ ...current, failures: [...current.failures, created].slice(-200) }));
      return created;
    },
    createPreview: (input) => {
      const created = validateAndCreatePreview(input);
      commit((current) => ({ ...current, previews: [...current.previews, created].slice(-100) }));
      return created;
    },
  }), [commit, normalizedActorId, snapshot]);

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
}

export function useEvaluations(): EvaluationContextValue {
  const value = useContext(EvaluationContext);
  if (!value) throw new Error("useEvaluations must be used within EvaluationProvider.");
  return value;
}
