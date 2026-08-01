import { agentCatalog } from "./catalog";
import type {
  AgentPermission,
  AgentTeam,
  ContextPack,
  Mission,
  MissionAnalyticsEvent,
  SkillEvidence,
} from "./types";

const ID = /^[a-z0-9][a-z0-9._-]{0,79}$/i;
const permissions = new Set<AgentPermission>(["observe", "recommend", "plan", "implement", "validate", "approve", "execute-local", "execute-connected"]);
const missionStatuses = new Set(["draft", "awaiting-plan-approval", "ready", "running", "paused", "needs-input", "needs-work", "completed", "cancelled", "blocked"]);
const phaseStatuses = new Set(["pending", "active", "passed", "failed", "paused", "skipped"]);
const analyticsTypes = new Set(["mission_created", "mission_plan_approved", "mission_started", "mission_paused", "mission_resumed", "mission_completed", "mission_blocked", "team_preset_used", "agent_added", "agent_removed", "quality_gate_failed", "quality_gate_passed", "learning_mode_selected"]);

export const boundedString = (value: unknown, max = 500): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

export function hasDangerousKeys(value: unknown, depth = 0): boolean {
  if (depth > 20) return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => hasDangerousKeys(item, depth + 1));
  const record = value as Record<string, unknown>;
  if (["__proto__", "prototype", "constructor"].some((key) => Object.prototype.hasOwnProperty.call(record, key))) return true;
  return Object.values(record).some((item) => hasDangerousKeys(item, depth + 1));
}

const validLocalized = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  const localized = value as Record<string, unknown>;
  return boundedString(localized.he, 160) && boundedString(localized.en, 160);
};

export function validateTeam(value: unknown, allowSystem = false): value is AgentTeam {
  if (!value || typeof value !== "object" || hasDangerousKeys(value)) return false;
  const team = value as AgentTeam;
  const knownAgents = new Set(agentCatalog.map((agent) => agent.id));
  const members = agentCatalog.filter((agent) => team.memberAgentIds?.includes(agent.id));
  const operational = members.some((agent) => agent.id !== "conductor" && (agent.permissions.includes("implement") || agent.permissions.includes("recommend")));
  const validators = members.filter((agent) => agent.permissions.includes("validate"));
  const independentApprover = validators.some((validator) =>
    members.some((agent) => agent.id !== validator.id && agent.permissions.includes("approve")));
  return team.schemaVersion === 1
    && ID.test(team.id)
    && validLocalized(team.name)
    && validLocalized(team.description)
    && (team.source === "user" || (allowSystem && team.source === "system"))
    && ID.test(team.conductorAgentId)
    && team.conductorAgentId === "conductor"
    && Array.isArray(team.memberAgentIds)
    && team.memberAgentIds.length >= 2
    && team.memberAgentIds.length <= 8
    && new Set(team.memberAgentIds).size === team.memberAgentIds.length
    && team.memberAgentIds.includes(team.conductorAgentId)
    && team.memberAgentIds.every((id) => knownAgents.has(id))
    && operational
    && validators.length > 0
    && independentApprover
    && Array.isArray(team.phaseIds)
    && team.phaseIds.length > 0
    && team.phaseIds.length <= 12
    && new Set(team.phaseIds).size === team.phaseIds.length
    && team.phaseIds.every((id) => typeof id === "string" && ID.test(id))
    && boundedString(team.createdAt, 40)
    && boundedString(team.updatedAt, 40);
}

export function validateMission(value: unknown, actorId: string): value is Mission {
  if (!value || typeof value !== "object" || hasDangerousKeys(value)) return false;
  const mission = value as Mission;
  if (mission.schemaVersion !== 1 || !ID.test(mission.id) || mission.actorId !== actorId || !boundedString(mission.title, 160) || !["he", "en"].includes(mission.language)) return false;
  if (!missionStatuses.has(mission.status) || !ID.test(mission.teamId) || !["teach", "guided", "expert", "audit-only"].includes(mission.guidanceMode)) return false;
  if (!["explain", "simulate", "dry-run", "local-execute", "connected-execute"].includes(mission.executionLevel)) return false;
  if (!mission.interpretation || !boundedString(mission.interpretation.goal, 2_000) || !validLocalized(mission.interpretation.summary)) return false;
  if (!Array.isArray(mission.interpretation.acceptanceCriteria) || mission.interpretation.acceptanceCriteria.length < 1 || mission.interpretation.acceptanceCriteria.length > 12) return false;
  if (!mission.interpretation.acceptanceCriteria.every((item) => validLocalized(item))) return false;
  if (!Array.isArray(mission.phases) || mission.phases.length < 2 || mission.phases.length > 12 || mission.currentPhaseIndex < 0 || mission.currentPhaseIndex >= mission.phases.length) return false;
  if (mission.currentPhaseId !== undefined && mission.currentPhaseId !== mission.phases[mission.currentPhaseIndex]?.id) return false;
  if (!Array.isArray(mission.contextPackIds) || mission.contextPackIds.length > 20 || mission.contextPackIds.some((id) => !ID.test(id))) return false;
  if (!Array.isArray(mission.evidence) || mission.evidence.length > 200 || mission.evidence.some((item) =>
    !ID.test(item.id) || !ID.test(item.phaseId) || !["interpretation", "plan", "handoff", "gate", "learning", "system"].includes(item.kind)
    || !["PASS", "FAIL", "INFO"].includes(item.result) || !validLocalized(item.summary) || !boundedString(item.recordedAt, 40))) return false;
  const agentById = new Map(agentCatalog.map((agent) => [agent.id, agent]));
  return mission.phases.every((phase) => ID.test(phase.id)
    && validLocalized(phase.title)
    && agentById.has(phase.ownerAgentId)
    && (!phase.reviewerAgentId || (agentById.has(phase.reviewerAgentId) && phase.reviewerAgentId !== phase.ownerAgentId))
    && permissions.has(phase.requiredPermission)
    && phaseStatuses.has(phase.status)
    && boundedString(phase.inputSummary, 1_000)
    && boundedString(phase.gate, 120));
}

export function validateContextPack(value: unknown): value is ContextPack {
  if (!value || typeof value !== "object" || hasDangerousKeys(value)) return false;
  const pack = value as ContextPack;
  return pack.schemaVersion === 1 && ID.test(pack.id) && validLocalized(pack.name)
    && typeof pack.description === "string" && pack.description.length <= 500
    && (pack.note === "" || boundedString(pack.note, 2_000))
    && Array.isArray(pack.sourceIds) && pack.sourceIds.length <= 20 && pack.sourceIds.every((id) => ID.test(id))
    && Array.isArray(pack.excludedSourceIds) && pack.excludedSourceIds.length <= 20 && pack.excludedSourceIds.every((id) => ID.test(id))
    && Array.isArray(pack.allowedAgentIds) && pack.allowedAgentIds.length <= 8 && pack.allowedAgentIds.every((id) => ID.test(id) && agentCatalog.some((agent) => agent.id === id))
    && ["public", "local-private", "connected-private"].includes(pack.sensitivity)
    && boundedString(pack.owner, 80) && Number.isInteger(pack.sizeBytes) && pack.sizeBytes >= 0 && pack.sizeBytes <= 2_000_000
    && ["valid", "invalid"].includes(pack.validationStatus)
    && ["current", "stale", "unknown"].includes(pack.freshness)
    && Array.isArray(pack.references) && pack.references.length <= 20
    && pack.references.every((reference) => ID.test(reference.entityId) && boundedString(reference.label, 160)
      && ["lesson", "prompt", "agent", "project", "document", "mission"].includes(reference.entityType));
}

export function validateSkillEvidence(value: unknown): value is SkillEvidence {
  if (!value || typeof value !== "object" || hasDangerousKeys(value)) return false;
  const evidence = value as SkillEvidence;
  const baseValid = ID.test(evidence.id) && ID.test(evidence.skillId)
    && ["lesson", "exercise", "mission", "evaluation"].includes(evidence.source)
    && ID.test(evidence.sourceId) && boundedString(evidence.completedAt, 40);
  if (!baseValid) return false;
  if (evidence.source !== "evaluation") {
    return evidence.outcome === undefined && evidence.evaluatorId === undefined
      && evidence.confidence === undefined && evidence.evidenceIds === undefined;
  }
  return ["practice", "demonstrated"].includes(evidence.outcome ?? "")
    && ID.test(evidence.evaluatorId ?? "")
    && ["low", "medium", "high"].includes(evidence.confidence ?? "")
    && Array.isArray(evidence.evidenceIds)
    && evidence.evidenceIds.length <= 50
    && evidence.evidenceIds.every((id) => ID.test(id));
}

export function validateMissionAnalyticsEvent(value: unknown): value is MissionAnalyticsEvent {
  if (!value || typeof value !== "object" || hasDangerousKeys(value)) return false;
  const event = value as MissionAnalyticsEvent;
  const keys = Object.keys(event);
  return keys.every((key) => ["type", "timestamp", "category", "quality"].includes(key))
    && analyticsTypes.has(event.type) && boundedString(event.timestamp, 40)
    && (event.category === undefined || boundedString(event.category, 40))
    && (event.quality === undefined || (Number.isFinite(event.quality) && event.quality >= 0 && event.quality <= 100));
}
