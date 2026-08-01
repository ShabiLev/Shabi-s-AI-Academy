/* eslint-disable react-refresh/only-export-components */
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deterministicHash } from "./hash";
import { validateRubric } from "./validation";
import { createFailureCase as validateAndCreateFailureCase } from "./learning";
import { createConnectedPreview as validateAndCreatePreview } from "./connectedPreview";
import { createEntityVersion, deprecateVersion } from "./versioning";
import { evaluationCompetitors, evaluationMissionSnapshots, readOnlyEvaluators } from "./catalog";
import { loadAgentState } from "../agents/agentStorage";
import { loadPromptState } from "../prompts/promptStorage";
import { loadMissionRepository } from "../missions/repository";
import { createSuite as validateAndCreateSuite, executeRegressionSuite, type RegressionSuiteCaseInput } from "./regression";
import {
  applyEvaluationRetention,
  loadEvaluationRepository,
  normalizeEvaluationActorId,
  prepareEvaluationRepositorySnapshot,
  resetEvaluationDomain,
  saveEvaluationRepository,
  withBuiltInRubrics,
} from "./repository";
import {
  cancelRun as cancelRuntimeRun,
  continueRun as continueRuntimeRun,
  createExperiment as createRuntimeExperiment,
  createRevalidationExperiment,
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
  EvaluationRubric,
  VersionedEntityRef,
} from "./types";
import type { EvaluationDomain } from "./repository";

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
  createRevalidation(id: string): EvaluationExperiment;
  createSuite(suite: EvaluationSuite): EvaluationSuite;
  runSuite(id: string, cases: readonly RegressionSuiteCaseInput[]): EvaluationSuite;
  createFailureCase(failure: FailureCase): FailureCase;
  createPreview(preview: Parameters<typeof validateAndCreatePreview>[0]): ConnectedActionPreview;
  saveRubric(rubric: EvaluationRubric): EvaluationRubric;
  deprecateRubric(rubricId: string): void;
  rollbackRubric(rubricId: string): EvaluationRubric;
  resetRecoveredDomain(domain: EvaluationDomain): void;
}

const EvaluationContext = createContext<EvaluationContextValue | undefined>(undefined);
const nowIso = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

interface ResolvedEvaluationEntity { id: string; version: string; content: unknown; authorSource: string }
const toHashableContent = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
function resolveEntities(experiment: EvaluationExperiment, snapshot: EvaluationRepositorySnapshot, storage: Pick<Storage, "getItem" | "setItem">): ResolvedEvaluationEntity[] {
  const rubric = snapshot.rubrics.find((item) => item.id === experiment.rubricId);
  const agents = loadAgentState(storage).agents;
  const prompts = loadPromptState(storage).prompts;
  const missionRepository = loadMissionRepository(experiment.actorId, storage);
  const mutableVersion = (entityId: string, value: unknown) => {
    const contentHash = deterministicHash(toHashableContent(value));
    const prior = snapshot.versions.filter((item) => item.entityId === entityId);
    const unchanged = prior.find((item) => item.contentHash === contentHash);
    if (unchanged) return unchanged.version;
    const nextPatch = prior.length
      ? Math.max(...prior.map((item) => Number(item.version.split(".")[2] ?? 0))) + 1
      : 0;
    return `1.0.${nextPatch}`;
  };
  const resolveUserEntity = (entityId: string): ResolvedEvaluationEntity | undefined => {
    const agent = agents.find((item) => item.id === entityId);
    if (agent) return { id: agent.id, version: `${agent.version}.0.0`, content: agent, authorSource: agent.importedFromCatalog ? "catalog-import" : "local-user" };
    const prompt = prompts.find((item) => item.id === entityId);
    if (prompt) return { id: prompt.id, version: `${prompt.version}.0.0`, content: prompt, authorSource: prompt.sourceCatalogId ? "catalog-import" : "local-user" };
    const team = missionRepository.teams.find((item) => item.id === entityId);
    if (team) return { id: team.id, version: mutableVersion(team.id, team), content: team, authorSource: team.source };
    return undefined;
  };
  const mission = missionRepository.missions.find((item) => item.id === experiment.missionSnapshotId);
  const entities = [
    mission ? { id: mission.id, version: mutableVersion(mission.id, mission), content: mission, authorSource: "local-user" } : evaluationMissionSnapshots.find((item) => item.id === experiment.missionSnapshotId) && { ...evaluationMissionSnapshots.find((item) => item.id === experiment.missionSnapshotId)!, content: evaluationMissionSnapshots.find((item) => item.id === experiment.missionSnapshotId)!, authorSource: "system-demo" },
    rubric ? { id: rubric.lineageId ?? rubric.id, version: rubric.version ?? "1.0.0", content: rubric, authorSource: rubric.source } : undefined,
    ...experiment.competitorIds.map((entityId) => resolveUserEntity(entityId) ?? (evaluationCompetitors.find((item) => item.id === entityId) && { ...evaluationCompetitors.find((item) => item.id === entityId)!, content: evaluationCompetitors.find((item) => item.id === entityId)!, authorSource: "system-demo" })),
    ...experiment.evaluatorIds.map((entityId) => { const evaluator = readOnlyEvaluators.find((item) => item.id === entityId); return evaluator && { id: evaluator.id, version: "1.0.0", content: evaluator, authorSource: "system" }; }),
  ];
  if (entities.some((item) => !item)) throw new Error("Unknown versioned evaluation entity.");
  return (entities as ResolvedEvaluationEntity[]).map((entity) => ({ ...entity, content: toHashableContent(entity.content) }));
}
function inferredRefs(entities: readonly ResolvedEvaluationEntity[], snapshot: EvaluationRepositorySnapshot): VersionedEntityRef[] {
  return entities.map((entity) => {
    const stored = snapshot.versions.find((candidate) => candidate.entityId === entity.id && candidate.version === entity.version);
    const version = entity.version;
    const actualHash = deterministicHash(entity.content);
    const contentHash = stored?.contentHash ?? actualHash;
    if (stored && (deterministicHash(stored.content) !== contentHash || actualHash !== contentHash)) throw new Error("Version content drift detected.");
    return { entityId: entity.id, version, contentHash };
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
      const candidate = producer(currentSnapshot);
      const prepared = prepareEvaluationRepositorySnapshot(candidate);
      if (!prepared) throw new Error("Evaluation repository capacity is protected by active or certified evidence.");
      result = prepared;
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
    saveRubric: (rubric) => {
      if (!validateRubric(rubric) || rubric.source !== "user") throw new Error("Invalid user rubric.");
      commit((current) => {
        if (current.rubrics.some((item) => item.id === rubric.id)) throw new Error("Rubric versions are immutable.");
        let versions = current.versions;
        if (rubric.parentVersionRef && !versions.some((item) => item.entityId === rubric.parentVersionRef!.entityId && item.version === rubric.parentVersionRef!.version)) {
          const parentRubric = current.rubrics.find((item) => item.id === rubric.parentVersionRef!.entityId);
          if (!parentRubric || deterministicHash(parentRubric) !== rubric.parentVersionRef.contentHash) throw new Error("Rubric parent version is unavailable or changed.");
          versions = createEntityVersion(versions, {
            entityId: parentRubric.id,
            version: rubric.parentVersionRef.version,
            content: parentRubric,
            changelog: { he: "גרסת מקור קפואה", en: "Frozen source version" },
            createdAt: parentRubric.createdAt,
            authorSource: parentRubric.source,
            activate: true,
          });
        }
        return {
          ...current,
          rubrics: [...current.rubrics, rubric],
          versions: createEntityVersion(versions, {
            entityId: rubric.lineageId ?? rubric.id,
            version: rubric.version ?? "1.0.0",
            content: rubric,
            parentRef: rubric.parentVersionRef,
            authorSource: rubric.source,
            changelog: {
              he: rubric.sourceRubricId ? `גרסה חדשה מתוך ${rubric.sourceRubricId}` : "גרסת rubric ראשונה",
              en: rubric.sourceRubricId ? `New version from ${rubric.sourceRubricId}` : "Initial rubric version",
            },
            createdAt: rubric.createdAt,
            activate: true,
          }),
        };
      });
      return rubric;
    },
    deprecateRubric: (rubricId) => {
      const rubric = snapshot.rubrics.find((item) => item.id === rubricId);
      if (!rubric || rubric.source !== "user") throw new Error("Only a user rubric version can be deprecated.");
      const ref = { entityId: rubric.lineageId ?? rubric.id, version: rubric.version ?? "1.0.0" };
      if (!snapshot.versions.some((item) => item.entityId === ref.entityId && item.version === ref.version)) throw new Error("Rubric version is not persisted.");
      commit((current) => ({ ...current, versions: deprecateVersion(current.versions, ref) }));
    },
    rollbackRubric: (rubricId) => {
      const source = snapshot.rubrics.find((item) => item.id === rubricId);
      if (!source || source.source !== "user") throw new Error("Only a user rubric version can be restored.");
      const lineageId = source.lineageId ?? source.id;
      const lineageVersions = snapshot.versions.filter((item) => item.entityId === lineageId);
      const active = lineageVersions.find((item) => item.status === "active");
      if (!active) throw new Error("Rubric lineage has no active version.");
      const nextPatch = Math.max(...lineageVersions.map((item) => Number(item.version.split(".")[2] ?? 0))) + 1;
      const timestamp = nowIso();
      const restored: EvaluationRubric = { ...structuredClone(source), id: id("rubric"), sourceRubricId: source.id, lineageId, version: `1.0.${nextPatch}`, parentVersionRef: { entityId: lineageId, version: active.version, contentHash: active.contentHash }, createdAt: timestamp, updatedAt: timestamp };
      commit((current) => ({ ...current, rubrics: [...current.rubrics, restored], versions: createEntityVersion(current.versions, {
        entityId: lineageId, version: restored.version!, content: restored, parentRef: restored.parentVersionRef, authorSource: "user",
        changelog: { he: `שחזור תוכן מגרסה ${source.version ?? "1.0.0"}`, en: `Restore content from version ${source.version ?? "1.0.0"}` }, createdAt: timestamp, activate: true,
      }) }));
      return restored;
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
      const entities = refs ? [] : resolveEntities(experiment, snapshot, storage);
      const started = startRuntimeExperiment(experiment, refs ?? inferredRefs(entities, snapshot), id("evaluation-run"), nowIso());
      commit((current) => {
        let versions = current.versions;
        for (const entity of entities) {
          if (versions.some((item) => item.entityId === entity.id && item.version === entity.version)) continue;
          versions = createEntityVersion(versions, {
            entityId: entity.id, version: entity.version, content: entity.content, authorSource: entity.authorSource,
            changelog: { he: "גרסה שהוקפאה לניסוי הערכה", en: "Version frozen for an evaluation experiment" },
            createdAt: nowIso(), activate: true,
          });
        }
        return {
          ...current, versions,
          experiments: current.experiments.map((item) => item.id === experimentId ? started.experiment : item),
          runs: [...current.runs, started.run],
        };
      });
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
      const updated = continueRuntimeRun(run, refs ?? inferredRefs(resolveEntities(experiment, snapshot, storage), snapshot), nowIso());
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
        evidence: [...current.evidence, ...output.evidence],
        traces: [...current.traces, ...output.traces],
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
    createRevalidation: (experimentId) => {
      const source = snapshot.experiments.find((item) => item.id === experimentId);
      if (!source) throw new Error("Unknown evaluation experiment.");
      const sourceRun = [...snapshot.runs].reverse().find((item) => item.experimentId === experimentId);
      if (!sourceRun) throw new Error("Only imported uncertified results require revalidation.");
      const timestamp = nowIso();
      const created = createRevalidationExperiment(source, sourceRun, id("evaluation"), timestamp);
      commit((current) => ({ ...current, experiments: [...current.experiments, created].slice(-100) }));
      return created;
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
    resetRecoveredDomain: (domain) => {
      const domains = domain === "runs" || domain === "evidence" || domain === "traces" ? (["runs", "evidence", "traces"] as const) : [domain];
      domains.forEach((item) => resetEvaluationDomain(normalizedActorId, item, storage));
      setRepository({ actorId: normalizedActorId, snapshot: loadSnapshot() });
    },
  }), [commit, loadSnapshot, normalizedActorId, snapshot, storage]);

  return <EvaluationContext.Provider value={value}>{children}</EvaluationContext.Provider>;
}

export function useEvaluations(): EvaluationContextValue {
  const value = useContext(EvaluationContext);
  if (!value) throw new Error("useEvaluations must be used within EvaluationProvider.");
  return value;
}
