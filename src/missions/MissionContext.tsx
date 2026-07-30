/* eslint-disable react-refresh/only-export-components -- provider and hook share one mission boundary. */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { useGuestProfile } from "../guest-profile";
import { useWorkspace } from "../workspace";
import { agentCatalog, skillCatalog, teamPresets } from "./catalog";
import { createMission, deriveSkillProgress, transitionMission, type MissionAction } from "./missionEngine";
import { loadMissionRepository, resetMissionDomain, saveMissionRepository, type MissionRepositorySnapshot } from "./repository";
import type { AgentTeam, ContextPack, ExecutionLevel, GuidanceMode, Mission, SkillEvidence, SkillProgress } from "./types";
import { validateSkillEvidence, validateTeam } from "./validation";

interface CreateMissionInput {
  goal: string;
  team: AgentTeam;
  guidanceMode: GuidanceMode;
  executionLevel: ExecutionLevel;
  language: "he" | "en";
}

interface MissionContextValue {
  actorId: string;
  missions: Mission[];
  teams: AgentTeam[];
  contextPacks: ContextPack[];
  skillProgress: SkillProgress[];
  recoveredDomains: string[];
  currentMission?: Mission;
  create: (input: CreateMissionInput) => Mission;
  applyAction: (missionId: string, action: MissionAction) => { ok: boolean; reason?: string };
  copyPreset: (presetId: string) => AgentTeam | undefined;
  saveTeam: (team: AgentTeam) => boolean;
  createContextPack: (missionId: string, name: string, note: string) => ContextPack | undefined;
  replaceAgent: (missionId: string, phaseId: string, agentId: string) => boolean;
  addSpecialist: (missionId: string, agentId: string) => boolean;
  setGuidanceMode: (missionId: string, mode: GuidanceMode) => boolean;
  addEvaluationSkillEvidence: (evidence: SkillEvidence) => boolean;
  removeSkillEvidence: (evidenceId: string) => boolean;
  resetDomain: (domain: "missions" | "teams" | "skills" | "contextPacks" | "analytics") => void;
}

const MissionContext = createContext<MissionContextValue | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const guest = useGuestProfile();
  const workspace = useWorkspace();
  const actorId = user?.id ?? guest.profile.anonymousProfileId ?? "local-guest";
  const [snapshot, setSnapshot] = useState<MissionRepositorySnapshot>(() => loadMissionRepository(actorId));
  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    // Actor changes are an isolation boundary, not a merge.
    const next = loadMissionRepository(actorId);
    snapshotRef.current = next;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnapshot(next);
  }, [actorId]);

  const mutate = (change: (current: MissionRepositorySnapshot) => MissionRepositorySnapshot) => {
    const next = change(snapshotRef.current);
    const accepted = saveMissionRepository(actorId, next);
    if (accepted) {
      snapshotRef.current = next;
      setSnapshot(next);
    }
    return accepted;
  };

  const track = (current: MissionRepositorySnapshot, type: MissionRepositorySnapshot["analytics"][number]["type"], category?: string) =>
    workspace.state.analyticsEnabled
      ? { ...current, analytics: [...current.analytics, { type, timestamp: new Date().toISOString(), category }].slice(-500) }
      : current;

  const value = useMemo<MissionContextValue>(() => ({
    actorId,
    missions: snapshot.missions,
    teams: snapshot.teams,
    contextPacks: snapshot.contextPacks,
    skillProgress: deriveSkillProgress(snapshot.skillEvidence),
    recoveredDomains: snapshot.recoveredDomains,
    currentMission: [...snapshot.missions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0],
    create: (input) => {
      const mission = createMission({ actorId, ...input });
      mutate((current) => track({ ...current, missions: [...current.missions, mission].slice(-100) }, "mission_created", input.executionLevel));
      return mission;
    },
    applyAction: (missionId, action) => {
      let result: ReturnType<typeof transitionMission> | undefined;
      mutate((current) => {
        const mission = current.missions.find((item) => item.id === missionId);
        if (!mission) return current;
        result = transitionMission(mission, action);
        if (!result.ok && result.reason !== "resume-drift" && result.mission === mission) return current;
        const eventByAction = {
          "approve-plan": "mission_plan_approved",
          start: result.ok ? "mission_started" : "mission_blocked",
          pause: "mission_paused",
          continue: "mission_resumed",
          "complete-phase": result.mission.status === "completed" ? "mission_completed" : "quality_gate_passed",
          "fail-phase": "quality_gate_failed",
          retry: "mission_resumed",
          "provide-input": "mission_resumed",
          cancel: "mission_blocked",
        } as const;
        const completedNow = mission.status !== "completed" && result.mission.status === "completed";
        const skillEvidence = completedNow
          ? [...current.skillEvidence,
              { id: `skill-${crypto.randomUUID()}`, skillId: "orchestration", source: "mission" as const, sourceId: mission.id, completedAt: result.mission.updatedAt },
              { id: `skill-${crypto.randomUUID()}`, skillId: "qa", source: "mission" as const, sourceId: mission.id, completedAt: result.mission.updatedAt }]
          : current.skillEvidence;
        return track({
          ...current,
          skillEvidence: skillEvidence.slice(-500),
          missions: current.missions.map((item) => item.id === missionId ? result!.mission : item),
        }, eventByAction[action], result.mission.executionLevel);
      });
      return { ok: result?.ok ?? false, reason: result?.reason };
    },
    copyPreset: (presetId) => {
      const preset = teamPresets.find((item) => item.id === presetId);
      if (!preset) return undefined;
      const timestamp = new Date().toISOString();
      const copy: AgentTeam = { ...preset, id: `team-${crypto.randomUUID()}`, source: "user", sourcePresetId: preset.id, createdAt: timestamp, updatedAt: timestamp };
      const saved = mutate((current) => track({ ...current, teams: [...current.teams, copy].slice(-50) }, "team_preset_used", preset.id));
      return saved ? copy : undefined;
    },
    saveTeam: (team) => validateTeam(team) && mutate((current) => ({ ...current, teams: [...current.teams.filter((item) => item.id !== team.id), team].slice(-50) })),
    createContextPack: (missionId, name, note) => {
      const cleanName = name.trim().slice(0, 120);
      const cleanNote = note.trim().slice(0, 2_000);
      if (!cleanName || !snapshot.missions.some((mission) => mission.id === missionId)) return undefined;
      const timestamp = new Date().toISOString();
      const pack: ContextPack = {
        schemaVersion: 1,
        id: `context-${crypto.randomUUID()}`,
        name: { he: cleanName, en: cleanName },
        description: cleanNote.slice(0, 500),
        note: cleanNote,
        sourceIds: [missionId],
        excludedSourceIds: [],
        allowedAgentIds: snapshot.missions.find((mission) => mission.id === missionId)?.phases.map((phase) => phase.ownerAgentId).filter((id, index, ids) => ids.indexOf(id) === index).slice(0, 8) ?? [],
        sensitivity: "local-private",
        owner: actorId,
        sizeBytes: new Blob([cleanName, cleanNote]).size,
        validationStatus: "valid",
        freshness: "current",
        references: [{ entityType: "mission", entityId: missionId, label: cleanName }],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return mutate((current) => ({
        ...current,
        contextPacks: [...current.contextPacks, pack].slice(-50),
        missions: current.missions.map((mission) => mission.id === missionId
          ? { ...mission, contextPackIds: [...new Set([...mission.contextPackIds, pack.id])], updatedAt: timestamp }
          : mission),
      })) ? pack : undefined;
    },
    replaceAgent: (missionId, phaseId, agentId) => {
      let changed = false;
      const saved = mutate((current) => {
        const mission = current.missions.find((item) => item.id === missionId);
        const phase = mission?.phases.find((item) => item.id === phaseId);
        const agent = agentCatalog.find((item) => item.id === agentId);
        const team = mission ? [...teamPresets, ...current.teams].find((item) => item.id === mission.teamId) : undefined;
        if (!mission || !phase || !team?.memberAgentIds.includes(agentId) || !agent?.permissions.includes(phase.requiredPermission) || phase.reviewerAgentId === agentId) return current;
        changed = true;
        return track({
          ...current,
          missions: current.missions.map((item) => item.id === missionId
            ? { ...item, phases: item.phases.map((candidate) => candidate.id === phaseId ? { ...candidate, ownerAgentId: agentId } : candidate), updatedAt: new Date().toISOString() }
            : item),
        }, "agent_added");
      });
      return changed && saved;
    },
    addSpecialist: (missionId, agentId) => {
      let changed = false;
      const saved = mutate((current) => {
        const mission = current.missions.find((item) => item.id === missionId);
        const sourceTeam = mission ? [...teamPresets, ...current.teams].find((team) => team.id === mission.teamId) : undefined;
        if (!mission || !sourceTeam || sourceTeam.memberAgentIds.includes(agentId) || sourceTeam.memberAgentIds.length >= 8 || !agentCatalog.some((agent) => agent.id === agentId)) return current;
        const timestamp = new Date().toISOString();
        const team: AgentTeam = {
          ...sourceTeam,
          id: sourceTeam.source === "system" ? `team-${crypto.randomUUID()}` : sourceTeam.id,
          source: "user",
          sourcePresetId: sourceTeam.source === "system" ? sourceTeam.id : sourceTeam.sourcePresetId,
          memberAgentIds: [...sourceTeam.memberAgentIds, agentId],
          createdAt: sourceTeam.source === "system" ? timestamp : sourceTeam.createdAt,
          updatedAt: timestamp,
        };
        if (!validateTeam(team)) return current;
        changed = true;
        return track({
          ...current,
          teams: [...current.teams.filter((item) => item.id !== team.id), team].slice(-50),
          missions: current.missions.map((item) => item.id === missionId ? { ...item, teamId: team.id, updatedAt: timestamp } : item),
        }, "agent_added");
      });
      return changed && saved;
    },
    setGuidanceMode: (missionId, mode) => mutate((current) => track({
      ...current,
      missions: current.missions.map((mission) => mission.id === missionId ? { ...mission, guidanceMode: mode, updatedAt: new Date().toISOString() } : mission),
    }, "learning_mode_selected", mode)),
    addEvaluationSkillEvidence: (evidence) => {
      if (evidence.source !== "evaluation" || !skillCatalog.some((skill) => skill.id === evidence.skillId)
        || !validateSkillEvidence(evidence)) return false;
      return mutate((current) => current.skillEvidence.some((item) => item.id === evidence.id)
        ? current
        : { ...current, skillEvidence: [...current.skillEvidence, evidence].slice(-500) });
    },
    removeSkillEvidence: (evidenceId) => mutate((current) => ({
      ...current,
      skillEvidence: current.skillEvidence.filter((item) => item.id !== evidenceId),
    })),
    resetDomain: (domain) => {
      resetMissionDomain(actorId, domain);
      const next = loadMissionRepository(actorId);
      snapshotRef.current = next;
      setSnapshot(next);
    },
  // mutate and track intentionally close over the current actor and consent state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [actorId, snapshot, workspace.state.analyticsEnabled]);

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMissions() {
  const value = useContext(MissionContext);
  if (!value) throw new Error("useMissions must be used within MissionProvider");
  return value;
}
