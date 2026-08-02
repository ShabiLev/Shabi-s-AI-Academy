import { createMission, teamPresets, transitionMission, type AgentTeam, type GuidanceMode, type Mission } from "../../src/missions";

const ACTOR = "fixture-actor";
const CLOCK = "2026-07-26T12:00:00.000Z";

const base = (mode: GuidanceMode = "guided"): Mission =>
  createMission({
    actorId: ACTOR,
    id: `mission-fixture-${mode}`,
    goal: "Verify a deterministic Mission fixture",
    language: "en",
    guidanceMode: mode,
    executionLevel: mode === "audit-only" ? "explain" : "simulate",
    now: CLOCK,
  });

const running = (): Mission => {
  const approved = transitionMission(base(), "approve-plan", CLOCK).mission;
  return transitionMission(approved, "start", CLOCK).mission;
};

const paused = (): Mission => transitionMission(running(), "pause", CLOCK).mission;

const completed = (): Mission => {
  let mission = running();
  while (mission.status === "running") mission = transitionMission(mission, "complete-phase", CLOCK, undefined, { evidenceIds: [], simulationAcknowledged: true }).mission;
  return mission;
};

export const missionStateFixtures = {
  empty: [],
  draft: [{ ...base(), status: "draft" as const }],
  running: [running()],
  paused: [paused()],
  completed: [completed()],
  corrupted: "{not-json",
} as const;

export const teamStateFixtures = {
  builtIn: teamPresets[0],
  custom: {
    ...teamPresets[0],
    id: "team-fixture-custom",
    source: "user",
    sourcePresetId: teamPresets[0].id,
  } satisfies AgentTeam,
  oversized: {
    ...teamPresets[0],
    id: "team-fixture-oversized",
    source: "user",
    memberAgentIds: [...teamPresets[0].memberAgentIds, "ui-designer", "prompt-engineer"],
  },
} as const;

export const guidanceModeFixtures: readonly GuidanceMode[] = ["teach", "guided", "expert", "audit-only"];
