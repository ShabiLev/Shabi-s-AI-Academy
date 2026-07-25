import type { ExperienceMode, ExperiencePreferences } from "./types";

export const EXPERIENCE_STORAGE_KEY = "shabis-ai-academy:experience:v1";
export const experienceStorageKey = (userId: string) => `${EXPERIENCE_STORAGE_KEY}:${userId}`;

const defaults: ExperiencePreferences = {
  schemaVersion: 1,
  mode: "beginner",
  developerModeEnabled: false,
};

export function parseExperiencePreferences(value: unknown): ExperiencePreferences {
  if (!value || typeof value !== "object") return defaults;
  const candidate = value as Partial<ExperiencePreferences>;
  const mode: ExperienceMode = candidate.mode === "advanced" ? "advanced" : "beginner";
  return { schemaVersion: 1, mode, developerModeEnabled: mode === "advanced" && candidate.developerModeEnabled === true };
}

export function loadExperiencePreferences(storage: Pick<Storage, "getItem"> = window.localStorage, userId?: string): ExperiencePreferences {
  try {
    const scoped = userId ? storage.getItem(experienceStorageKey(userId)) : null;
    const legacy = !userId || userId === "anonymous" || userId === "guest-user" ? storage.getItem(EXPERIENCE_STORAGE_KEY) : null;
    return parseExperiencePreferences(JSON.parse(scoped ?? legacy ?? "null"));
  }
  catch { return defaults; }
}

export function saveExperiencePreferences(value: ExperiencePreferences, storage: Pick<Storage, "setItem"> = window.localStorage, userId?: string): void {
  try { storage.setItem(userId ? experienceStorageKey(userId) : EXPERIENCE_STORAGE_KEY, JSON.stringify(parseExperiencePreferences(value))); }
  catch { /* Preferences remain available for this session when storage is unavailable. */ }
}
