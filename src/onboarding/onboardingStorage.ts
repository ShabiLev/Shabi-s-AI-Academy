import type { ExperienceLevel, Interest, MainGoal, OnboardingProfile } from "./types";

export const ONBOARDING_STORAGE_KEY = "shabis-ai-academy:onboarding:v1";
export const onboardingStorageKey = (userId: string) => `${ONBOARDING_STORAGE_KEY}:${userId}`;
const goals: MainGoal[] = ["learn", "productivity", "prompts", "agent", "explore"];
const levels: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const interests: Interest[] = ["qa", "sql", "product", "development", "promptEngineering", "agents", "automation", "research"];

export function emptyOnboardingProfile(): OnboardingProfile {
  return { schemaVersion: 1, mainGoal: "learn", experienceLevel: "beginner", interests: [], completed: false, recommendationId: "foundations", updatedAt: "" };
}

export function parseOnboardingProfile(value: unknown): OnboardingProfile {
  if (!value || typeof value !== "object") return emptyOnboardingProfile();
  const candidate = value as Partial<OnboardingProfile>;
  return {
    schemaVersion: 1,
    mainGoal: goals.includes(candidate.mainGoal as MainGoal) ? candidate.mainGoal as MainGoal : candidate.mainGoal === "workflow" ? "productivity" : "learn",
    experienceLevel: levels.includes(candidate.experienceLevel as ExperienceLevel) ? candidate.experienceLevel as ExperienceLevel : candidate.experienceLevel === "some" ? "intermediate" : "beginner",
    interests: Array.isArray(candidate.interests) ? [...new Set(candidate.interests.filter((item): item is Interest => interests.includes(item as Interest)))].slice(0, interests.length) : [],
    completed: candidate.completed === true,
    recommendationId: typeof candidate.recommendationId === "string" ? candidate.recommendationId.slice(0, 80) : "foundations",
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  };
}

export function loadOnboardingProfile(storage: Pick<Storage, "getItem"> = localStorage, userId?: string): OnboardingProfile {
  try {
    const scoped = userId ? storage.getItem(onboardingStorageKey(userId)) : null;
    const legacy = !userId || userId === "anonymous" || userId === "guest-user" ? storage.getItem(ONBOARDING_STORAGE_KEY) : null;
    return parseOnboardingProfile(JSON.parse(scoped ?? legacy ?? "null"));
  }
  catch { return emptyOnboardingProfile(); }
}

export function saveOnboardingProfile(profile: OnboardingProfile, storage: Pick<Storage, "setItem"> = localStorage, userId?: string): void {
  try { storage.setItem(userId ? onboardingStorageKey(userId) : ONBOARDING_STORAGE_KEY, JSON.stringify(parseOnboardingProfile(profile))); }
  catch { /* Onboarding remains usable in memory. */ }
}
