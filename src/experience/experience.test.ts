import { describe, expect, it } from "vitest";
import { navigationGroups } from "../components/layout/navigation";
import { EXPERIENCE_STORAGE_KEY, loadExperiencePreferences, parseExperiencePreferences } from ".";

describe("guided experience preferences and navigation", () => {
  it("defaults new and malformed preferences to Beginner Mode", () => {
    expect(parseExperiencePreferences(null)).toMatchObject({ mode: "beginner", developerModeEnabled: false });
    expect(parseExperiencePreferences({ mode: "unknown", developerModeEnabled: true })).toMatchObject({ mode: "beginner", developerModeEnabled: false });
  });

  it("preserves an explicit advanced preference without treating it as authorization", () => {
    const storage = { getItem: (key: string) => key === EXPERIENCE_STORAGE_KEY ? JSON.stringify({ schemaVersion: 1, mode: "advanced", developerModeEnabled: true }) : null };
    expect(loadExperiencePreferences(storage)).toEqual({ schemaVersion: 1, mode: "advanced", developerModeEnabled: true });
  });

  it("organizes every visible route once across five user-goal groups", () => {
    expect(navigationGroups.map((group) => group.id)).toEqual(["home", "learn", "build", "workspace", "more"]);
    const routes = navigationGroups.flatMap((group) => group.items.map((item) => item.to));
    expect(new Set(routes).size).toBe(routes.length);
    expect(routes).toContain("/radar");
    expect(routes).toContain("/developer");
  });
});
