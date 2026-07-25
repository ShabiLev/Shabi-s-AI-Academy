import { describe, expect, it } from "vitest";
import { navigationGroups } from "./components/layout/navigation";
import { loadExperiencePreferences, saveExperiencePreferences } from "./experience/experienceStorage";
import { emptyOnboardingProfile, loadOnboardingProfile, saveOnboardingProfile } from "./onboarding/onboardingStorage";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
}

describe("Version 1.6 simplification and user isolation", () => {
  it("exposes exactly eight beginner destinations and keeps advanced tools separate", () => {
    const beginner = navigationGroups.flatMap((group) => group.items).filter((item) => !item.visibility);
    expect(beginner.map((item) => item.to)).toEqual(["/dashboard", "/lessons", "/prompts", "/agents", "/projects", "/radar", "/history", "/help"]);
    expect(navigationGroups.flatMap((group) => group.items).filter((item) => item.visibility === "advanced")).toHaveLength(10);
  });

  it("isolates experience preferences between user IDs", () => {
    const storage = memoryStorage();
    saveExperiencePreferences({ schemaVersion: 1, mode: "advanced", developerModeEnabled: false }, storage, "user-a");
    expect(loadExperiencePreferences(storage, "user-a").mode).toBe("advanced");
    expect(loadExperiencePreferences(storage, "user-b").mode).toBe("beginner");
  });

  it("isolates onboarding and safely migrates legacy choices", () => {
    const storage = memoryStorage();
    saveOnboardingProfile({ ...emptyOnboardingProfile(), completed: true }, storage, "user-a");
    expect(loadOnboardingProfile(storage, "user-a").completed).toBe(true);
    expect(loadOnboardingProfile(storage, "user-b").completed).toBe(false);
    storage.setItem("shabis-ai-academy:onboarding:v1:guest-user", JSON.stringify({ mainGoal: "workflow", experienceLevel: "some" }));
    expect(loadOnboardingProfile(storage, "guest-user")).toMatchObject({ mainGoal: "productivity", experienceLevel: "intermediate" });
  });
});
