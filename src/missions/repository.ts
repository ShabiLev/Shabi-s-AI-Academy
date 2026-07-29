import type {
  AgentTeam,
  ContextPack,
  ContextPackStore,
  Mission,
  MissionAnalyticsEvent,
  MissionAnalyticsStore,
  MissionStore,
  SkillEvidence,
  SkillStore,
  TeamStore,
} from "./types";
import { deriveSkillProgress } from "./missionEngine";
import { validateContextPack, validateMission, validateMissionAnalyticsEvent, validateSkillEvidence, validateTeam } from "./validation";

const MAX_BYTES = 2_000_000;
export const MISSION_ACTOR_POINTER_KEY = "shabis-ai-academy:mission-actor:v1";
const sanitizeActor = (actorId: string) => actorId.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 80) || "local-guest";

export const missionStorageKeys = (actorId: string) => {
  const actor = sanitizeActor(actorId);
  return {
    missions: `shabis-ai-academy:missions:v1:${actor}`,
    teams: `shabis-ai-academy:agent-teams:v1:${actor}`,
    skills: `shabis-ai-academy:skill-map:v1:${actor}`,
    contextPacks: `shabis-ai-academy:context-packs:v1:${actor}`,
    analytics: `shabis-ai-academy:mission-analytics:v1:${actor}`,
  } as const;
};

export interface MissionRepositorySnapshot {
  missions: Mission[];
  teams: AgentTeam[];
  skillEvidence: SkillEvidence[];
  contextPacks: ContextPack[];
  analytics: MissionAnalyticsEvent[];
  recoveredDomains: string[];
}

const defaultSnapshot = (): MissionRepositorySnapshot => ({ missions: [], teams: [], skillEvidence: [], contextPacks: [], analytics: [], recoveredDomains: [] });

function readBounded(storage: Pick<Storage, "getItem" | "setItem">, key: string): unknown {
  const raw = storage.getItem(key);
  if (raw === null) return undefined;
  if (new Blob([raw]).size > MAX_BYTES) throw new Error("oversized");
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    try { storage.setItem(`${key}:quarantine`, raw.slice(0, 200_000)); } catch { /* Recovery does not depend on quarantine persistence. */ }
    throw new Error("malformed");
  }
}

export function loadMissionRepository(actorId: string, storage: Pick<Storage, "getItem" | "setItem"> = localStorage): MissionRepositorySnapshot {
  const keys = missionStorageKeys(actorId);
  const snapshot = defaultSnapshot();
  const load = <T>(domain: keyof typeof keys, extract: (value: Record<string, unknown>) => T[]) => {
    try {
      const value = readBounded(storage, keys[domain]);
      if (!value || typeof value !== "object") return [];
      return extract(value as Record<string, unknown>);
    } catch {
      snapshot.recoveredDomains.push(domain);
      return [];
    }
  };
  snapshot.missions = load("missions", (value) => Array.isArray(value.missions) ? value.missions.filter((item) => validateMission(item, actorId)).slice(-100) : []);
  snapshot.teams = load("teams", (value) => Array.isArray(value.teams) ? value.teams.filter((item) => validateTeam(item)).slice(-50) : []);
  const progress = load("skills", (value) => Array.isArray(value.progress) ? value.progress : []);
  snapshot.skillEvidence = progress.flatMap((item) => item && typeof item === "object" && Array.isArray((item as { evidence?: unknown }).evidence)
    ? (item as { evidence: unknown[] }).evidence.filter(validateSkillEvidence) : []).slice(-500);
  snapshot.contextPacks = load("contextPacks", (value) => Array.isArray(value.packs) ? value.packs.filter(validateContextPack).slice(-50) : []);
  snapshot.analytics = load("analytics", (value) => Array.isArray(value.events) ? value.events.filter(validateMissionAnalyticsEvent).slice(-500) : []);
  return snapshot;
}

const serialize = (value: unknown): string | undefined => {
  const raw = JSON.stringify(value);
  return new Blob([raw]).size <= MAX_BYTES ? raw : undefined;
};

export function saveMissionRepository(actorId: string, snapshot: MissionRepositorySnapshot, storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage): boolean {
  const keys = missionStorageKeys(actorId);
  const records: Array<[string, MissionStore | TeamStore | SkillStore | ContextPackStore | MissionAnalyticsStore]> = [
    [keys.missions, { schemaVersion: 1, missions: snapshot.missions.filter((item) => validateMission(item, actorId)).slice(-100) }],
    [keys.teams, { schemaVersion: 1, teams: snapshot.teams.filter((item) => validateTeam(item)).slice(-50) }],
    [keys.skills, { schemaVersion: 1, progress: deriveSkillProgress(snapshot.skillEvidence.filter(validateSkillEvidence).slice(-500)) }],
    [keys.contextPacks, { schemaVersion: 1, packs: snapshot.contextPacks.filter(validateContextPack).slice(-50) }],
    [keys.analytics, { schemaVersion: 1, events: snapshot.analytics.filter(validateMissionAnalyticsEvent).slice(-500) }],
  ];
  const encoded = records.map(([key, value]) => [key, serialize(value)] as const);
  if (encoded.some(([, value]) => value === undefined)) return false;
  const before = new Map(records.map(([key]) => [key, storage.getItem(key)]));
  try {
    for (const [key, value] of encoded) storage.setItem(key, value!);
    storage.setItem(MISSION_ACTOR_POINTER_KEY, sanitizeActor(actorId));
    return true;
  } catch {
    for (const [key, value] of before) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch { /* Best-effort rollback after storage failure. */ }
    }
    return false;
  }
}

export function resetMissionDomain(actorId: string, domain: keyof ReturnType<typeof missionStorageKeys>, storage: Pick<Storage, "removeItem"> = localStorage): void {
  storage.removeItem(missionStorageKeys(actorId)[domain]);
}
