import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AGENT_STORAGE_KEY } from "../agents/agentStorage";
import { emptyAgent } from "../agents/types";
import { teamPresets } from "../missions/catalog";
import { createMission } from "../missions/missionEngine";
import { missionStorageKeys } from "../missions/repository";
import { builtInRubrics, cloneBuiltInRubric } from "./index";
import { EvaluationProvider, useEvaluations } from "./EvaluationContext";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function LocalEntityProbe() {
  const evaluations = useEvaluations();
  const experiment = evaluations.experiments.find((item) => item.id === "experiment-local-agents");
  const updatedExperiment = evaluations.experiments.find((item) => item.id === "experiment-updated-agents");
  const run = evaluations.runs.find((item) => item.experimentId === experiment?.id);
  const refsMatchVersions = evaluations.runs.every((item) => item.frozenRefs.every((ref) => {
    const version = evaluations.snapshot.versions.find((candidate) => candidate.entityId === ref.entityId && candidate.version === ref.version);
    return version?.contentHash === ref.contentHash;
  }));
  return (
    <>
      <output data-testid="frozen-refs">{run?.frozenRefs.map((item) => `${item.entityId}@${item.version}`).join(",")}</output>
      <output data-testid="stored-versions">{evaluations.snapshot.versions.map((item) => `${item.entityId}@${item.version}:${item.authorSource}`).join(",")}</output>
      <output data-testid="refs-match-versions">{String(refsMatchVersions)}</output>
      <button type="button" onClick={() => evaluations.createExperiment({
        id: "experiment-local-agents", actorId: evaluations.actorId, name: "Local agents",
        missionSnapshotId: "mission-accessible-react-snapshot", competitorIds: ["local-agent-a", "local-agent-b"],
        rubricId: "general-mission-quality", evaluatorIds: ["reality-checker"], repetitionCount: 1, seed: "local-seed",
        createdAt: "2026-07-30T10:00:00.000Z", updatedAt: "2026-07-30T10:00:00.000Z",
      })}>Create local experiment</button>
      <button type="button" disabled={!experiment} onClick={() => evaluations.start("experiment-local-agents")}>Start local experiment</button>
      <button type="button" onClick={() => evaluations.createExperiment({
        id: "experiment-updated-agents", actorId: evaluations.actorId, name: "Updated local agents",
        missionSnapshotId: "mission-accessible-react-snapshot", competitorIds: ["local-agent-a", "local-agent-b"],
        rubricId: "general-mission-quality", evaluatorIds: ["reality-checker"], repetitionCount: 1, seed: "updated-seed",
        createdAt: "2026-07-30T11:00:00.000Z", updatedAt: "2026-07-30T11:00:00.000Z",
      })}>Create updated experiment</button>
      <button type="button" disabled={!updatedExperiment} onClick={() => evaluations.start("experiment-updated-agents")}>Start updated experiment</button>
    </>
  );
}

function RubricLifecycleProbe() {
  const evaluations = useEvaluations();
  const original = evaluations.snapshot.rubrics.find((item) => item.id === "rubric-user-lifecycle");
  const lineageVersions = evaluations.snapshot.versions.filter((item) => item.entityId === "general-mission-quality");
  return (
    <>
      <output data-testid="rubric-versions">{lineageVersions.map((item) => `${item.version}:${item.status}`).join(",")}</output>
      <button type="button" onClick={() => evaluations.saveRubric(cloneBuiltInRubric(
        builtInRubrics[0].id, "rubric-user-lifecycle", "2026-07-30T10:00:00.000Z",
      ))}>Save rubric</button>
      <button type="button" disabled={!original} onClick={() => evaluations.rollbackRubric(original!.id)}>Restore rubric</button>
      <button type="button" disabled={!original} onClick={() => evaluations.deprecateRubric(original!.id)}>Deprecate rubric</button>
    </>
  );
}

function MutableMissionProbe() {
  const evaluations = useEvaluations();
  const create = (id: string, name: string) => evaluations.createExperiment({
    id, actorId: evaluations.actorId, name, missionSnapshotId: "mission-local-versioned",
    competitorIds: ["team-local-a", "team-local-b"], rubricId: "general-mission-quality",
    evaluatorIds: ["reality-checker"], repetitionCount: 1, seed: `${id}-seed`,
    createdAt: "2026-07-30T10:00:00.000Z", updatedAt: "2026-07-30T10:00:00.000Z",
  });
  const first = evaluations.experiments.some((item) => item.id === "experiment-team-first");
  const second = evaluations.experiments.some((item) => item.id === "experiment-team-second");
  const refsMatchVersions = evaluations.runs.every((run) => run.frozenRefs.every((ref) =>
    evaluations.snapshot.versions.some((item) => item.entityId === ref.entityId && item.version === ref.version && item.contentHash === ref.contentHash)));
  return <>
    <output data-testid="mission-team-versions">{evaluations.snapshot.versions.map((item) => `${item.entityId}@${item.version}`).join(",")}</output>
    <output data-testid="mission-team-refs-match">{String(refsMatchVersions)}</output>
    <button type="button" onClick={() => create("experiment-team-first", "First team run")}>Create first team experiment</button>
    <button type="button" disabled={!first} onClick={() => evaluations.start("experiment-team-first")}>Start first team experiment</button>
    <button type="button" onClick={() => create("experiment-team-second", "Second team run")}>Create second team experiment</button>
    <button type="button" disabled={!second} onClick={() => evaluations.start("experiment-team-second")}>Start second team experiment</button>
  </>;
}

function Probe() {
  const evaluations = useEvaluations();
  return (
    <>
      <output data-testid="actor">{evaluations.actorId}</output>
      <output data-testid="experiments">{evaluations.experiments.length}</output>
      <button type="button" onClick={() => evaluations.createExperiment({
        id: "experiment-isolation",
        actorId: evaluations.actorId,
        name: "Actor isolation",
        missionSnapshotId: "mission-snapshot",
        competitorIds: ["agent-a", "agent-b"],
        rubricId: "release-readiness",
        evaluatorIds: ["reality-checker"],
        repetitionCount: 1,
        seed: "fixed-seed",
        createdAt: "2026-07-30T10:00:00.000Z",
        updatedAt: "2026-07-30T10:00:00.000Z",
      })}>Create</button>
    </>
  );
}

describe("EvaluationProvider actor isolation", () => {
  it("reloads actor state without exposing or merging the previous actor repository", () => {
    const storage = new MemoryStorage();
    const view = render(
      <EvaluationProvider actorId="actor-a" storage={storage}><Probe /></EvaluationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.getByTestId("actor")).toHaveTextContent("actor-a");
    expect(screen.getByTestId("experiments")).toHaveTextContent("1");

    view.rerender(
      <EvaluationProvider actorId="actor-b" storage={storage}><Probe /></EvaluationProvider>,
    );
    expect(screen.getByTestId("actor")).toHaveTextContent("actor-b");
    expect(screen.getByTestId("experiments")).toHaveTextContent("0");

    view.rerender(
      <EvaluationProvider actorId="actor-a" storage={storage}><Probe /></EvaluationProvider>,
    );
    expect(screen.getByTestId("experiments")).toHaveTextContent("1");
  });

  it("freezes actual local agent content and provenance for an experiment", () => {
    const storage = new MemoryStorage();
    const agent = (id: string, version: number) => ({
      ...emptyAgent, id, version, name: id, goal: "Evaluate local content", category: "qa" as const,
      isFavorite: false, createdAt: "2026-07-30T09:00:00.000Z", updatedAt: "2026-07-30T09:00:00.000Z",
    });
    storage.setItem(AGENT_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1, agents: [agent("local-agent-a", 2), agent("local-agent-b", 3)],
      filters: { search: "", category: "all", status: "all", favoritesOnly: false, sort: "updated" },
    }));
    render(<EvaluationProvider actorId="actor-a" storage={storage}><LocalEntityProbe /></EvaluationProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Create local experiment" }));
    fireEvent.click(screen.getByRole("button", { name: "Start local experiment" }));
    expect(screen.getByTestId("frozen-refs")).toHaveTextContent("local-agent-a@2.0.0");
    expect(screen.getByTestId("frozen-refs")).toHaveTextContent("local-agent-b@3.0.0");
    expect(screen.getByTestId("stored-versions")).toHaveTextContent("local-agent-a@2.0.0:local-user");
    expect(screen.getByTestId("stored-versions")).toHaveTextContent("local-agent-b@3.0.0:local-user");
    storage.setItem(AGENT_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1, agents: [agent("local-agent-a", 4), agent("local-agent-b", 5)],
      filters: { search: "", category: "all", status: "all", favoritesOnly: false, sort: "updated" },
    }));
    fireEvent.click(screen.getByRole("button", { name: "Create updated experiment" }));
    fireEvent.click(screen.getByRole("button", { name: "Start updated experiment" }));
    expect(screen.getByTestId("stored-versions")).toHaveTextContent("local-agent-a@4.0.0:local-user");
    expect(screen.getByTestId("stored-versions")).toHaveTextContent("local-agent-b@5.0.0:local-user");
    expect(screen.getByTestId("refs-match-versions")).toHaveTextContent("true");
  });

  it("keeps a rubric lineage immutable across save, restore, and deprecation", () => {
    const storage = new MemoryStorage();
    render(<EvaluationProvider actorId="actor-a" storage={storage}><RubricLifecycleProbe /></EvaluationProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Save rubric" }));
    expect(screen.getByTestId("rubric-versions")).toHaveTextContent("1.0.0:inactive,1.0.1:active");
    fireEvent.click(screen.getByRole("button", { name: "Restore rubric" }));
    expect(screen.getByTestId("rubric-versions")).toHaveTextContent("1.0.1:inactive,1.0.2:active");
    fireEvent.click(screen.getByRole("button", { name: "Deprecate rubric" }));
    expect(screen.getByTestId("rubric-versions")).toHaveTextContent("1.0.1:deprecated");
  });

  it("creates new immutable versions when local Mission and Team content changes", () => {
    const storage = new MemoryStorage();
    const keys = missionStorageKeys("actor-a");
    const timestamp = "2026-07-30T09:00:00.000Z";
    const teams = teamPresets.slice(0, 2).map((preset, index) => ({
      ...structuredClone(preset), id: index ? "team-local-b" : "team-local-a", source: "user" as const,
      createdAt: timestamp, updatedAt: timestamp,
    }));
    const mission = createMission({ actorId: "actor-a", goal: "Version local mission content", team: teams[0], now: timestamp, id: "mission-local-versioned" });
    storage.setItem(keys.missions, JSON.stringify({ schemaVersion: 1, missions: [mission] }));
    storage.setItem(keys.teams, JSON.stringify({ schemaVersion: 1, teams }));
    render(<EvaluationProvider actorId="actor-a" storage={storage}><MutableMissionProbe /></EvaluationProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Create first team experiment" }));
    fireEvent.click(screen.getByRole("button", { name: "Start first team experiment" }));
    expect(screen.getByTestId("mission-team-versions")).toHaveTextContent("mission-local-versioned@1.0.0");
    expect(screen.getByTestId("mission-team-versions")).toHaveTextContent("team-local-a@1.0.0");
    const updatedAt = "2026-07-30T09:05:00.000Z";
    storage.setItem(keys.missions, JSON.stringify({ schemaVersion: 1, missions: [{ ...mission, title: "Updated mission", updatedAt }] }));
    storage.setItem(keys.teams, JSON.stringify({ schemaVersion: 1, teams: teams.map((team) => ({ ...team, description: { ...team.description, en: `${team.description.en} updated` }, updatedAt })) }));
    fireEvent.click(screen.getByRole("button", { name: "Create second team experiment" }));
    fireEvent.click(screen.getByRole("button", { name: "Start second team experiment" }));
    expect(screen.getByTestId("mission-team-versions")).toHaveTextContent("mission-local-versioned@1.0.1");
    expect(screen.getByTestId("mission-team-versions")).toHaveTextContent("team-local-a@1.0.1");
    expect(screen.getByTestId("mission-team-versions")).toHaveTextContent("team-local-b@1.0.1");
    expect(screen.getByTestId("mission-team-refs-match")).toHaveTextContent("true");
  });
});
