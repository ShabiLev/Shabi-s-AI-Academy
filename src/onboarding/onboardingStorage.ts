import type { ExperienceLevel, Interest, MainGoal, OnboardingProfile } from "./types";

export const ONBOARDING_STORAGE_KEY = "shabis-ai-academy:onboarding:v1";
const goals: MainGoal[] = ["learn", "prompts", "agent", "workflow", "qa", "explore"];
const levels: ExperienceLevel[] = ["beginner", "some", "advanced"];
const interests: Interest[] = ["qa", "sql", "product", "development", "promptEngineering", "agents", "automation", "research"];

export function emptyOnboardingProfile(): OnboardingProfile {
  return { schemaVersion: 1, mainGoal: "learn", experienceLevel: "beginner", interests: [], completed: false, recommendationId: "foundations", updatedAt: "" };
}

export function parseOnboardingProfile(value: unknown): OnboardingProfile {
  if (!value || typeof value !== "object") return emptyOnboardingProfile();
  const candidate = value as Partial<OnboardingProfile>;
  return {
    schemaVersion: 1,
    mainGoal: goals.includes(candidate.mainGoal as MainGoal) ? candidate.mainGoal as MainGoal : "learn",
    experienceLevel: levels.includes(candidate.experienceLevel as ExperienceLevel) ? candidate.experienceLevel as ExperienceLevel : "beginner",
    interests: Array.isArray(candidate.interests) ? [...new Set(candidate.interests.filter((item): item is Interest => interests.includes(item as Interest)))].slice(0, interests.length) : [],
    completed: candidate.completed === true,
    recommendationId: typeof candidate.recommendationId === "string" ? candidate.recommendationId.slice(0, 80) : "foundations",
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  };
}

export function loadOnboardingProfile(storage: Pick<Storage, "getItem"> = localStorage): OnboardingProfile {
  try { return parseOnboardingProfile(JSON.parse(storage.getItem(ONBOARDING_STORAGE_KEY) ?? "null")); }
  catch { return emptyOnboardingProfile(); }
}

export function saveOnboardingProfile(profile: OnboardingProfile, storage: Pick<Storage, "setItem"> = localStorage): void {
  try { storage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(parseOnboardingProfile(profile))); }
  catch { /* Onboarding remains usable in memory. */ }
}
