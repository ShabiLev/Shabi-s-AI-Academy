import { describe, expect, it } from "vitest";
import { agentCatalog, communitySource, skillCatalog, teamPresets } from "./catalog";
import { createMission, deriveSkillLevel, missionFingerprint, transitionMission } from "./missionEngine";
import { loadMissionRepository, missionStorageKeys, saveMissionRepository, type MissionRepositorySnapshot } from "./repository";
import { validateContextPack, validateMissionAnalyticsEvent, validateTeam } from "./validation";
import type { SkillEvidence } from "./types";

function storage(seed: Record<string, string> = {}, failKey?: string) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === failKey) throw new Error("quota");
      values.set(key, value);
    },
    removeItem: (key: string) => { values.delete(key); },
    values,
  };
}

describe("Version 1.8 Agent Teams", () => {
  it("ships five immutable presets with exactly one Conductor and at most eight unique members", () => {
    expect(teamPresets).toHaveLength(5);
    for (const preset of teamPresets) {
      expect(validateTeam(preset, true)).toBe(true);
      expect(preset.conductorAgentId).toBe("conductor");
      expect(preset.memberAgentIds.filter((id) => id === "conductor")).toHaveLength(1);
      expect(new Set(preset.memberAgentIds).size).toBe(preset.memberAgentIds.length);
      expect(preset.memberAgentIds.length).toBeLessThanOrEqual(8);
      expect(preset.source).toBe("system");
      const mission = createMission({ actorId: "preset-check", goal: "Verify preset roles", team: preset });
      expect(mission.phases.every((phase) => !phase.reviewerAgentId || phase.reviewerAgentId !== phase.ownerAgentId)).toBe(true);
      expect(mission.phases.every((phase) => agentCatalog.find((agent) => agent.id === phase.ownerAgentId)?.permissions.includes(phase.requiredPermission))).toBe(true);
    }
  });

  it("pins 12 inert community adaptations to the verified MIT revision", () => {
    const community = agentCatalog.filter((agent) => agent.source === "community");
    expect(community).toHaveLength(12);
    expect(community.every((agent) => agent.sourceDetails?.adapted && agent.sourceDetails.license === "MIT")).toBe(true);
    expect(new Set(community.map((agent) => agent.sourceDetails?.revision))).toEqual(new Set([communitySource.revision]));
  });

  it("rejects duplicate members, forged system records, and more than eight agents", () => {
    const userTeam = { ...teamPresets[0], id: "team-user", source: "user" as const };
    expect(validateTeam({ ...userTeam, memberAgentIds: ["conductor", "conductor"] })).toBe(false);
    expect(validateTeam({ ...userTeam, source: "system" })).toBe(false);
    expect(validateTeam({ ...userTeam, memberAgentIds: agentCatalog.slice(0, 9).map((agent) => agent.id) })).toBe(false);
  });
});

describe("Version 1.8 mission runtime", () => {
  const actorId = "guest-user";

  it("requires plan approval and coordinates a deterministic sequential mission", () => {
    let mission = createMission({ actorId, goal: "Deliver an accessible mission workspace", now: "2026-07-29T08:00:00.000Z", id: "mission-1" });
    expect(mission.status).toBe("awaiting-plan-approval");
    expect(transitionMission(mission, "start").reason).toBe("invalid-transition");
    mission = transitionMission(mission, "approve-plan", "2026-07-29T08:01:00.000Z").mission;
    expect(mission.status).toBe("ready");
    mission = transitionMission(mission, "start", "2026-07-29T08:02:00.000Z").mission;
    expect(mission.status).toBe("running");
    expect(mission.phases.filter((phase) => phase.status === "active")).toHaveLength(1);
    while (mission.status === "running") mission = transitionMission(mission, "complete-phase", undefined, undefined, { evidenceIds: [], simulationAcknowledged: true }).mission;
    expect(mission.status).toBe("completed");
    expect(mission.evidence.some((item) => item.kind === "learning" && item.result === "PASS")).toBe(true);
  });

  it("persists a precise pause checkpoint and refuses drifted continuation", () => {
    let mission = createMission({ actorId, goal: "Review a release safely", id: "mission-pause" });
    mission = transitionMission(mission, "approve-plan").mission;
    mission = transitionMission(mission, "start").mission;
    mission = transitionMission(mission, "pause").mission;
    expect(mission.status).toBe("paused");
    expect(mission.pauseCheckpoint?.phaseId).toBe(mission.phases[mission.currentPhaseIndex].id);
    expect(transitionMission(mission, "continue").ok).toBe(true);

    const drifted = { ...mission, phases: mission.phases.map((phase, index) => index === mission.currentPhaseIndex ? { ...phase, outputSummary: "changed after pause" } : phase) };
    expect(missionFingerprint(drifted)).not.toBe(mission.pauseCheckpoint?.fingerprint);
    const rejected = transitionMission(drifted, "continue");
    expect(rejected.reason).toBe("resume-drift");
    expect(rejected.mission.status).toBe("needs-input");
  });

  it("rejects click-only completion and records a documented blocker without claiming completion", () => {
    let mission = createMission({ actorId, goal: "Require an honest result" });
    mission = transitionMission(transitionMission(mission, "approve-plan").mission, "start").mission;
    expect(transitionMission(mission, "complete-phase").reason).toBe("missing-completion-proof");
    const blocked = transitionMission(mission, "complete-phase", undefined, undefined, { evidenceIds: [], simulationAcknowledged: false, blocker: "External approval is missing" });
    expect(blocked.mission.status).toBe("blocked");
    expect(blocked.mission.completedAt).toBeUndefined();
    expect(blocked.mission.phaseProofs?.at(-1)?.blocker).toBe("External approval is missing");
  });

  it("blocks unavailable execution and self-approval", () => {
    const connected = createMission({ actorId, goal: "Execute a connected write", executionLevel: "connected-execute" });
    const approved = transitionMission(connected, "approve-plan").mission;
    expect(transitionMission(approved, "start").reason).toBe("connected-disabled");

    let mission = createMission({ actorId, goal: "Review implementation independently" });
    mission = transitionMission(transitionMission(mission, "approve-plan").mission, "start").mission;
    const index = mission.currentPhaseIndex;
    mission = { ...mission, phases: mission.phases.map((phase, phaseIndex) => phaseIndex === index ? { ...phase, reviewerAgentId: phase.ownerAgentId } : phase) };
    expect(transitionMission(mission, "complete-phase").reason).toBe("self-approval");
  });

  it("allows only bounded local Mission execution and forces Audit Only to Explain", () => {
    const local = transitionMission(
      transitionMission(createMission({ actorId, goal: "Update local mission state", executionLevel: "local-execute" }), "approve-plan").mission,
      "start",
    );
    expect(local.ok).toBe(true);
    expect(local.mission.status).toBe("running");

    const audit = createMission({ actorId, goal: "Inspect without mutation", guidanceMode: "audit-only", executionLevel: "connected-execute" });
    expect(audit.executionLevel).toBe("explain");
  });

  it("records a failed quality gate and retries the same phase without skipping it", () => {
    let mission = createMission({ actorId, goal: "Exercise a correction loop" });
    mission = transitionMission(transitionMission(mission, "approve-plan").mission, "start").mission;
    const phaseId = mission.currentPhaseId;
    mission = transitionMission(mission, "fail-phase").mission;
    expect(mission.status).toBe("needs-work");
    expect(mission.evidence.at(-1)).toMatchObject({ result: "FAIL", phaseId });
    mission = transitionMission(mission, "retry").mission;
    expect(mission.status).toBe("running");
    expect(mission.currentPhaseId).toBe(phaseId);
  });

  it("derives skill progress only from completion evidence", () => {
    expect(skillCatalog).toHaveLength(12);
    expect(deriveSkillLevel([])).toBe("not-introduced");
    expect(deriveSkillLevel([{ id: "e1", skillId: "quality", source: "lesson", sourceId: "lesson-1", completedAt: "now" }])).toBe("introduced");
    expect(deriveSkillLevel([
      { id: "e1", skillId: "quality", source: "lesson", sourceId: "lesson-1", completedAt: "now" },
      { id: "e2", skillId: "quality", source: "exercise", sourceId: "exercise-1", completedAt: "now" },
    ])).toBe("practised");
  });

  it("requires independent high-confidence evaluation evidence for mastery", () => {
    const evaluation = (id: string, runId: string, evaluatorId: string, outcome: "practice" | "demonstrated", confidence: "low" | "high"): SkillEvidence => ({
      id,
      skillId: "qa",
      source: "evaluation",
      sourceId: runId,
      completedAt: "2026-07-30T12:00:00.000Z",
      outcome,
      evaluatorId,
      confidence,
      evidenceIds: outcome === "demonstrated" ? [`proof-${id}`] : [],
    });
    expect(deriveSkillLevel([evaluation("e1", "run-1", "reality-checker", "practice", "low")])).toBe("practised");
    expect(deriveSkillLevel([evaluation("e2", "run-1", "reality-checker", "demonstrated", "high")])).toBe("demonstrated");
    expect(deriveSkillLevel([
      evaluation("e3", "run-1", "reality-checker", "demonstrated", "high"),
      evaluation("e4", "run-2", "security-evaluator", "demonstrated", "high"),
      evaluation("e5", "run-3", "reality-checker", "demonstrated", "high"),
    ])).toBe("mastered");
  });
});

describe("Version 1.8 storage and privacy", () => {
  const emptySnapshot: MissionRepositorySnapshot = { missions: [], teams: [], skillEvidence: [], contextPacks: [], analytics: [], recoveredDomains: [] };

  it("isolates actors and quarantines malformed state", () => {
    const local = storage({ [missionStorageKeys("actor-a").missions]: "{broken" });
    const actorA = loadMissionRepository("actor-a", local);
    const actorB = loadMissionRepository("actor-b", local);
    expect(actorA.missions).toEqual([]);
    expect(actorA.recoveredDomains).toContain("missions");
    expect(local.values.get(`${missionStorageKeys("actor-a").missions}:quarantine`)).toBe("{broken");
    expect(actorB.recoveredDomains).toEqual([]);
  });

  it("rolls back all domains when a bounded repository write fails", () => {
    const keys = missionStorageKeys("actor");
    const local = storage({ [keys.missions]: "old-missions", [keys.teams]: "old-teams" }, keys.skills);
    expect(saveMissionRepository("actor", emptySnapshot, local)).toBe(false);
    expect(local.getItem(keys.missions)).toBe("old-missions");
    expect(local.getItem(keys.teams)).toBe("old-teams");
  });

  it("does not alter pre-Version 1.8 storage while adding isolated Mission domains", () => {
    const legacyKey = "shabis-ai-academy:guest-profile:v1";
    const local = storage({ [legacyKey]: "{\"schemaVersion\":1,\"preserved\":true}" });
    expect(saveMissionRepository("actor", emptySnapshot, local)).toBe(true);
    expect(local.getItem(legacyKey)).toBe("{\"schemaVersion\":1,\"preserved\":true}");
  });

  it("accepts only allowlisted content-free mission analytics fields", () => {
    expect(validateMissionAnalyticsEvent({ type: "mission_created", timestamp: "2026-07-29T08:00:00Z", category: "simulate" })).toBe(true);
    expect(validateMissionAnalyticsEvent({ type: "mission_created", timestamp: "now", missionId: "private-id" })).toBe(false);
    expect(validateMissionAnalyticsEvent({ type: "mission_created", timestamp: "now", content: "private goal" })).toBe(false);
  });

  it("validates bounded local-private Context Packs and rejects permission escalation", () => {
    const valid = {
      schemaVersion: 1,
      id: "context-1",
      name: { he: "הקשר", en: "Context" },
      description: "Bounded local context",
      note: "No secrets",
      sourceIds: ["mission-1"],
      excludedSourceIds: [],
      allowedAgentIds: ["conductor"],
      sensitivity: "local-private",
      owner: "actor",
      sizeBytes: 20,
      validationStatus: "valid",
      freshness: "current",
      references: [],
      createdAt: "2026-07-29T08:00:00Z",
      updatedAt: "2026-07-29T08:00:00Z",
    } as const;
    expect(validateContextPack(valid)).toBe(true);
    expect(validateContextPack({ ...valid, allowedAgentIds: ["unknown-agent"] })).toBe(false);
    expect(validateContextPack({ ...valid, sizeBytes: 2_000_001 })).toBe(false);
  });
});
