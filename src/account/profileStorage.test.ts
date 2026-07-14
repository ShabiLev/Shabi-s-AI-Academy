import { describe, expect, it } from "vitest";
import { loadLocalProfile, saveLocalProfile } from "./profileStorage";
function memory(value: string | null = null) { let item = value; return { getItem: () => item, setItem: (_key: string, next: string) => { item = next; } }; }
describe("local profile storage", () => {
  it("recovers from malformed profile state", () => { expect(loadLocalProfile(memory("{")).schemaVersion).toBe(1); });
  it("bounds and normalizes user-authored profile fields", () => { const storage = memory(); const next = saveLocalProfile({ schemaVersion: 1, firstName: `  ${"a".repeat(100)}`, lastName: " Learner ", learningGoals: " Learn safely ", createdAt: "created", updatedAt: "old" }, storage); expect(next.firstName).toHaveLength(80); expect(next.lastName).toBe("Learner"); expect(loadLocalProfile(storage).learningGoals).toBe("Learn safely"); });
});
