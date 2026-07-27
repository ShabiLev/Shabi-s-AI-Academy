import { describe, expect, it } from "vitest";
import {
  createGuestProfile,
  createGuestProfileRepository,
  exportGuestProfile,
  GUEST_PROFILE_CORRUPT_KEY,
  GUEST_PROFILE_LIMITS,
  GUEST_PROFILE_STORAGE_KEY,
  parseGuestProfile,
  previewGuestImport,
} from "./repository";

function storage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const fixedNow = () => "2026-07-26T12:00:00.000Z";
const fixedId = () => "local-profile-1";

describe("guest profile repository", () => {
  it("creates a versioned profile with consent disabled and bounded collections", () => {
    const profile = createGuestProfile(fixedNow, fixedId);
    expect(profile).toMatchObject({
      schemaVersion: 1,
      anonymousProfileId: "local-profile-1",
      locale: "he",
      consent: { analytics: false, feedbackContext: false },
    });
    const parsed = parseGuestProfile({
      ...profile,
      selectedTopics: Array.from({ length: 100 }, (_, index) => `topic-${index}`),
      unexpected: "discarded",
    });
    expect(parsed?.selectedTopics).toHaveLength(GUEST_PROFILE_LIMITS.topics);
    expect(parsed).not.toHaveProperty("unexpected");
  });

  it("recovers corrupt state without reusing it as the active profile", () => {
    const local = storage({ [GUEST_PROFILE_STORAGE_KEY]: "{broken" });
    const repository = createGuestProfileRepository(local, fixedNow);
    const recovered = repository.load();
    expect(recovered.schemaVersion).toBe(1);
    expect(local.getItem(GUEST_PROFILE_CORRUPT_KEY)).toBe("{broken");
    expect(parseGuestProfile(JSON.parse(local.getItem(GUEST_PROFILE_STORAGE_KEY)!))).toBeTruthy();
  });

  it("previews checksum-protected imports and rolls back failed writes", () => {
    const current = createGuestProfile(fixedNow, fixedId);
    const incoming = { ...current, anonymousProfileId: "import-profile-2", selectedTopics: ["agents"] };
    const exported = exportGuestProfile(incoming, fixedNow);
    const preview = previewGuestImport(JSON.stringify(exported), current);
    expect(preview).toMatchObject({ valid: true, changes: { topics: 1 } });
    expect(previewGuestImport(JSON.stringify({ ...exported, checksum: "changed" }), current).valid).toBe(false);
  });

  it("keeps the local identity when replacing imported preferences", () => {
    const local = storage();
    const repository = createGuestProfileRepository(local, fixedNow);
    const current = { ...repository.load(), anonymousProfileId: "local-profile-1" };
    repository.save(current);
    const incoming = { ...current, anonymousProfileId: "foreign-profile-2", selectedTopics: ["qa"] };
    const preview = previewGuestImport(JSON.stringify(exportGuestProfile(incoming, fixedNow)), current);
    const result = repository.applyImport(preview, "replace");
    expect(result.profile?.anonymousProfileId).toBe("local-profile-1");
    expect(result.profile?.selectedTopics).toEqual(["qa"]);
  });

  it("rejects oversized and dangerous imports and rolls back a failed write", () => {
    const current = createGuestProfile(fixedNow, fixedId);
    expect(previewGuestImport("x".repeat(512_001), current).errors).toContain("oversized-import");
    const exported = exportGuestProfile(current, fixedNow);
    const dangerous = JSON.stringify({
      ...exported,
      profile: { ...exported.profile, token: "do-not-import" },
    });
    expect(previewGuestImport(dangerous, current).errors).toContain("dangerous-or-secret-shaped-key");

    const values = new Map<string, string>();
    let failNextWrite = false;
    const local = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (failNextWrite) {
          failNextWrite = false;
          throw new Error("quota");
        }
        values.set(key, value);
      },
      removeItem: (key: string) => values.delete(key),
    };
    const repository = createGuestProfileRepository(local, fixedNow);
    const stored = repository.load();
    const preview = previewGuestImport(JSON.stringify(exportGuestProfile({
      ...stored,
      selectedTopics: ["agents"],
    }, fixedNow)), stored);
    const before = local.getItem(GUEST_PROFILE_STORAGE_KEY);
    failNextWrite = true;
    const result = repository.applyImport(preview, "merge");
    expect(result).toMatchObject({ ok: false, rolledBack: true });
    expect(local.getItem(GUEST_PROFILE_STORAGE_KEY)).toBe(before);
  });
});
