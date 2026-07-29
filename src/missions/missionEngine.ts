import { agentCatalog, skillCatalog, teamPresets } from "./catalog";
import type {
  AgentTeam,
  ExecutionLevel,
  GuidanceMode,
  Mission,
  MissionEvidence,
  MissionInterpretation,
  MissionPhase,
  SkillEvidence,
  SkillLevel,
  SkillProgress,
} from "./types";

export type MissionAction = "approve-plan" | "start" | "pause" | "continue" | "complete-phase" | "fail-phase" | "retry" | "provide-input" | "cancel";

const nowIso = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function interpretMission(goal: string): MissionInterpretation {
  const normalized = goal.trim().replace(/\s+/g, " ").slice(0, 2_000);
  const localized = (he: string, en: string) => ({ he, en });
  return {
    goal: normalized,
    summary: {
      he: `המערכת הבינה שהמטרה היא: ${normalized}`,
      en: `The system understood the goal as: ${normalized}`,
    },
    goals: [localized(`השלמת המטרה: ${normalized}`, `Complete the goal: ${normalized}`)],
    acceptanceCriteria: [
      localized("התוצאה המבוקשת גלויה וניתנת לסקירה.", "The requested outcome is visible and reviewable."),
      localized("שערי בטיחות, נגישות ורגרסיה מפיקים ראיות מפורשות.", "Safety, accessibility, and regression gates produce explicit evidence."),
      localized("אין פעולה מחוברת או הרסנית ללא אישור אנושי חדש.", "No connected or destructive action occurs without fresh human approval."),
    ],
    assumptions: [localized("העבודה מתואמת ברצף בגרסה מקומית זו.", "Work is coordinated sequentially in this local-first release.")],
    missingInformation: [],
    risks: [localized("הקשר חסר עשוי לדרוש עצירה וקלט מפורש.", "Incomplete context may require a pause and explicit user input.")],
  };
}

function agentWithPermission(team: AgentTeam, permission: MissionPhase["requiredPermission"], exclude?: string): string | undefined {
  const agent = agentCatalog.find((candidate) => candidate.id !== exclude
    && team.memberAgentIds.includes(candidate.id)
    && candidate.permissions.includes(permission));
  return agent?.id;
}

export function buildMissionPhases(team: AgentTeam, goal: string): MissionPhase[] {
  const implementer = agentWithPermission(team, "implement", team.conductorAgentId)
    ?? agentWithPermission(team, "recommend", team.conductorAgentId)
    ?? team.memberAgentIds.find((id) => id !== team.conductorAgentId)
    ?? team.conductorAgentId;
  const implementationPermission = agentCatalog.find((agent) => agent.id === implementer)?.permissions.includes("implement")
    ? "implement" as const
    : "recommend" as const;
  const validator = agentWithPermission(team, "validate", implementer) ?? team.conductorAgentId;
  const approver = agentCatalog.find((candidate) => candidate.id !== validator
    && candidate.id !== team.conductorAgentId
    && team.memberAgentIds.includes(candidate.id)
    && candidate.permissions.includes("approve"))?.id
    ?? team.conductorAgentId;
  return [
    { id: "interpret", title: { he: "פירוש המשימה", en: "Mission interpretation" }, ownerAgentId: team.conductorAgentId, requiredPermission: "plan", status: "pending", inputSummary: goal, gate: "interpretation-reviewed" },
    { id: "plan", title: { he: "תכנית וקריטריונים", en: "Plan and criteria" }, ownerAgentId: team.conductorAgentId, reviewerAgentId: approver, requiredPermission: "plan", status: "pending", inputSummary: "Reviewed interpretation", gate: "human-plan-approval" },
    { id: "implement", title: { he: implementationPermission === "implement" ? "יישום מדומה" : "ניתוח והמלצה", en: implementationPermission === "implement" ? "Simulated implementation" : "Analysis and recommendation" }, ownerAgentId: implementer, reviewerAgentId: validator, requiredPermission: implementationPermission, status: "pending", inputSummary: "Approved plan", gate: "independent-validation" },
    { id: "validate", title: { he: "אימות עצמאי", en: "Independent validation" }, ownerAgentId: validator, reviewerAgentId: approver, requiredPermission: "validate", status: "pending", inputSummary: "Implementation handoff", gate: "evidence-pass" },
    { id: "learn", title: { he: "סיכום למידה", en: "Learning summary" }, ownerAgentId: team.conductorAgentId, reviewerAgentId: approver, requiredPermission: "recommend", status: "pending", inputSummary: "Validated evidence", gate: "learning-summary" },
  ];
}

export function missionFingerprint(mission: Mission): string {
  const stable = JSON.stringify({
    id: mission.id,
    status: mission.status,
    currentPhaseIndex: mission.currentPhaseIndex,
    transitionCount: mission.transitionCount,
    phases: mission.phases.map(({ id, ownerAgentId, reviewerAgentId, status, outputSummary }) => ({ id, ownerAgentId, reviewerAgentId, status, outputSummary })),
  });
  let hash = 0x811c9dc5;
  for (let index = 0; index < stable.length; index += 1) {
    hash ^= stable.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

const evidence = (phaseId: string, kind: MissionEvidence["kind"], result: MissionEvidence["result"], he: string, en: string, now: string): MissionEvidence => ({
  id: makeId("evidence"),
  phaseId,
  kind,
  result,
  summary: { he, en },
  recordedAt: now,
});

export function createMission(input: {
  actorId: string;
  goal: string;
  team?: AgentTeam;
  guidanceMode?: GuidanceMode;
  executionLevel?: ExecutionLevel;
  language?: "he" | "en";
  now?: string;
  id?: string;
}): Mission {
  const now = input.now ?? nowIso();
  const team = input.team ?? teamPresets[0];
  const interpretation = interpretMission(input.goal);
  const phases = buildMissionPhases(team, interpretation.goal);
  if (input.guidanceMode === "audit-only") {
    phases[2] = {
      ...phases[2],
      title: { he: "בדיקה לקריאה בלבד", en: "Read-only inspection" },
      ownerAgentId: phases[3].ownerAgentId,
      reviewerAgentId: phases[3].reviewerAgentId,
      requiredPermission: "validate",
      gate: "read-only-evidence",
    };
  }
  return {
    schemaVersion: 1,
    id: input.id ?? makeId("mission"),
    actorId: input.actorId,
    title: input.goal.trim().slice(0, 120),
    language: input.language ?? "he",
    interpretation,
    teamId: team.id,
    guidanceMode: input.guidanceMode ?? "guided",
    executionLevel: input.guidanceMode === "audit-only" ? "explain" : input.executionLevel ?? "simulate",
    status: "awaiting-plan-approval",
    phases,
    currentPhaseIndex: 0,
    currentPhaseId: "interpret",
    transitionCount: 0,
    evidence: [evidence("interpret", "interpretation", "INFO", "פירוש המשימה נוצר לבדיקה.", "Mission interpretation created for review.", now)],
    contextPackIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export interface TransitionResult {
  mission: Mission;
  ok: boolean;
  reason?: "invalid-transition" | "connected-disabled" | "self-approval" | "resume-drift";
}

export function transitionMission(mission: Mission, action: MissionAction, now = nowIso(), expectedFingerprint?: string): TransitionResult {
  if (mission.status === "completed" || mission.status === "cancelled" || mission.status === "blocked") return { mission, ok: false, reason: "invalid-transition" };
  if (mission.executionLevel === "connected-execute" && action === "start") return { mission: { ...mission, status: "blocked", blockedReason: "execution-level-unavailable", updatedAt: now }, ok: false, reason: "connected-disabled" };
  const phases = mission.phases.map((phase) => ({ ...phase }));
  const current = phases[mission.currentPhaseIndex];
  const nextBase = { ...mission, phases, transitionCount: mission.transitionCount + 1, updatedAt: now };

  if (action === "approve-plan" && mission.status === "awaiting-plan-approval") {
    phases[0] = { ...phases[0], status: "passed", completedAt: now, outputSummary: "Interpretation and plan approved by the user." };
    return { ok: true, mission: { ...nextBase, status: "ready", evidence: [...mission.evidence, evidence("plan", "plan", "PASS", "התכנית אושרה במפורש.", "The plan was explicitly approved.", now)] } };
  }
  if (action === "start" && mission.status === "ready") {
    phases[1] = { ...phases[1], status: "active", startedAt: now };
    return { ok: true, mission: { ...nextBase, status: "running", currentPhaseIndex: 1, currentPhaseId: phases[1].id } };
  }
  if (action === "pause" && mission.status === "running") {
    phases[mission.currentPhaseIndex] = { ...current, status: "paused" };
    const paused = { ...nextBase, status: "paused" as const };
    return { ok: true, mission: { ...paused, pausedAt: now, pauseCheckpoint: { phaseId: current.id, transitionCount: paused.transitionCount, fingerprint: missionFingerprint(paused), pausedAt: now }, evidence: [...mission.evidence, evidence(current.id, "system", "INFO", "המשימה הושהתה בנקודה בטוחה.", "Mission paused at a safe checkpoint.", now)] } };
  }
  if (action === "continue" && mission.status === "paused" && mission.pauseCheckpoint) {
    const actual = missionFingerprint({ ...mission, pauseCheckpoint: undefined });
    const expected = expectedFingerprint ?? mission.pauseCheckpoint.fingerprint;
    if (actual !== expected) return { ok: false, reason: "resume-drift", mission: { ...mission, status: "needs-input", blockedReason: "resume-drift", updatedAt: now } };
    phases[mission.currentPhaseIndex] = { ...current, status: "active" };
    return { ok: true, mission: { ...nextBase, status: "running", pausedAt: undefined, pauseCheckpoint: undefined, blockedReason: undefined } };
  }
  if (action === "fail-phase" && mission.status === "running") {
    phases[mission.currentPhaseIndex] = { ...current, status: "failed", completedAt: now, outputSummary: "The quality gate requires correction before continuing." };
    return {
      ok: true,
      mission: {
        ...nextBase,
        status: "needs-work",
        blockedReason: "quality-gate-failed",
        evidence: [...mission.evidence, evidence(current.id, "gate", "FAIL", "שער האיכות נכשל ונדרש תיקון.", "The quality gate failed and requires correction.", now)],
      },
    };
  }
  if (action === "complete-phase" && mission.status === "running") {
    if (current.reviewerAgentId === current.ownerAgentId) return { mission, ok: false, reason: "self-approval" };
    phases[mission.currentPhaseIndex] = { ...current, status: "passed", completedAt: now, outputSummary: `Deterministic ${mission.executionLevel} output reviewed at phase ${current.id}.` };
    const final = mission.currentPhaseIndex === phases.length - 1;
    const nextIndex = final ? mission.currentPhaseIndex : mission.currentPhaseIndex + 1;
    if (!final) phases[nextIndex] = { ...phases[nextIndex], status: "active", startedAt: now };
    return { ok: true, mission: {
      ...nextBase,
      phases,
      status: final ? "completed" : "running",
      currentPhaseIndex: nextIndex,
      currentPhaseId: phases[nextIndex].id,
      completedAt: final ? now : undefined,
      learningSummary: final ? {
        summary: { he: "תרגלת תזמור צוות, עצירות אישור ואימות מבוסס ראיות.", en: "You practised team orchestration, approval stops, and evidence-based validation." },
        demonstratedSkillIds: ["orchestration", "qa"],
        nextPracticeRoute: "/missions/new",
      } : undefined,
      evidence: [...mission.evidence, evidence(current.id, current.id === "learn" ? "learning" : "gate", "PASS", "השער הושלם עם ראיה.", "Gate completed with evidence.", now)],
    } };
  }
  if ((action === "retry" || action === "provide-input") && (mission.status === "needs-work" || mission.status === "needs-input")) {
    phases[mission.currentPhaseIndex] = { ...current, status: "active", startedAt: now };
    return { ok: true, mission: { ...nextBase, status: "running", blockedReason: undefined } };
  }
  if (action === "cancel") return { ok: true, mission: { ...nextBase, status: "cancelled", pauseCheckpoint: undefined } };
  return { mission, ok: false, reason: "invalid-transition" };
}

export function deriveSkillLevel(evidenceItems: SkillEvidence[]): SkillLevel {
  const unique = new Set(evidenceItems.map((item) => `${item.source}:${item.sourceId}`)).size;
  if (unique >= 6 && evidenceItems.some((item) => item.source === "mission")) return "mastered";
  if (unique >= 4 && evidenceItems.some((item) => item.source === "mission")) return "demonstrated";
  if (unique >= 2) return "practised";
  if (unique === 1) return "introduced";
  return "not-introduced";
}

export function deriveSkillProgress(items: SkillEvidence[]): SkillProgress[] {
  return skillCatalog.map((skill) => {
    const evidenceForSkill = items.filter((item) => item.skillId === skill.id);
    return { skillId: skill.id, evidence: evidenceForSkill, level: deriveSkillLevel(evidenceForSkill) };
  });
}
