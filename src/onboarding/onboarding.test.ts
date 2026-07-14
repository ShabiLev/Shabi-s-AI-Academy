import { describe, expect, it } from "vitest";
import { emptyOnboardingProfile, loadOnboardingProfile, ONBOARDING_STORAGE_KEY, parseOnboardingProfile, recommendStartingPath } from ".";

describe("first-time onboarding", () => {
  it("recovers safely from malformed and legacy local state", () => {
    expect(parseOnboardingProfile({ mainGoal: "invalid", experienceLevel: "expert", interests: ["qa", "unknown", "qa"] })).toEqual({
      ...emptyOnboardingProfile(), interests: ["qa"],
    });
    expect(loadOnboardingProfile({ getItem: () => "{" })).toEqual(emptyOnboardingProfile());
  });

  it("creates deterministic recommendations from goals and interests", () => {
    expect(recommendStartingPath({ mainGoal: "agent", experienceLevel: "beginner", interests: [] }).id).toBe("starter-agent");
    expect(recommendStartingPath({ mainGoal: "explore", experienceLevel: "some", interests: ["qa"] }).id).toBe("qa-tour");
    expect(recommendStartingPath({ mainGoal: "prompts", experienceLevel: "advanced", interests: ["research"] }).route).toBe("/prompts/packs");
  });

  it("loads a completed profile without forcing onboarding again", () => {
    const profile = { ...emptyOnboardingProfile(), completed: true, recommendationId: "workflow", updatedAt: "2026-07-14T00:00:00.000Z" };
    const storage = { getItem: (key: string) => key === ONBOARDING_STORAGE_KEY ? JSON.stringify(profile) : null };
    expect(loadOnboardingProfile(storage)).toEqual(profile);
  });
});
