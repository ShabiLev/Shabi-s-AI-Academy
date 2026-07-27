import { describe, expect, it } from "vitest";
import {
  FIRST_VISIT_TOUR_ID,
  WALKTHROUGH_MAX_BYTES,
  createWalkthroughRecord,
  parseWalkthroughRecord,
  readWalkthroughRecord,
  walkthroughStorageKey,
  writeWalkthroughRecord,
} from "./walkthroughStorage";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    value: (key: string) => values.get(key),
  };
}

describe("first-visit walkthrough storage", () => {
  it("round-trips a bounded actor-scoped record", () => {
    const storage = memoryStorage();
    const record = {
      ...createWalkthroughRecord("he", () => "2026-07-26T12:00:00.000Z"),
      status: "in-progress" as const,
      currentStep: 3,
      startedAt: "2026-07-26T12:00:00.000Z",
    };
    expect(writeWalkthroughRecord("Guest User", record, storage)).toBe(true);
    expect(readWalkthroughRecord("Guest User", "en", storage)).toEqual(record);
    expect(storage.value(walkthroughStorageKey("Guest User"))).toContain(FIRST_VISIT_TOUR_ID);
  });

  it("recovers safely from malformed and oversized values", () => {
    const actor = "actor-a";
    const key = walkthroughStorageKey(actor);
    const malformed = memoryStorage({ [key]: "{" });
    expect(readWalkthroughRecord(actor, "en", malformed, () => "2026-07-26T12:00:00.000Z")).toMatchObject({
      status: "not-started",
      language: "en",
    });
    const oversized = memoryStorage({ [key]: "x".repeat(WALKTHROUGH_MAX_BYTES + 1) });
    expect(readWalkthroughRecord(actor, "he", oversized, () => "2026-07-26T12:00:00.000Z")).toMatchObject({
      status: "not-started",
      language: "he",
    });
  });

  it("does not leak a legacy completion or dismissal into a new actor", () => {
    const legacyCompleted = {
      ...createWalkthroughRecord("en", () => "2026-07-26T12:00:00.000Z"),
      status: "completed" as const,
      completedAt: "2026-07-26T12:00:00.000Z",
    };
    const storage = memoryStorage({
      "shabis-ai-academy:walkthrough:v1": JSON.stringify(legacyCompleted),
    });
    expect(readWalkthroughRecord("new-actor", "en", storage, () => "2026-07-26T12:01:00.000Z").status).toBe("not-started");
  });

  it("rejects invalid schema, step, status, and timestamp values", () => {
    const valid = createWalkthroughRecord("he", () => "2026-07-26T12:00:00.000Z");
    expect(parseWalkthroughRecord({ ...valid, schemaVersion: 2 })).toBeUndefined();
    expect(parseWalkthroughRecord({ ...valid, currentStep: 8 })).toBeUndefined();
    expect(parseWalkthroughRecord({ ...valid, status: "unknown" })).toBeUndefined();
    expect(parseWalkthroughRecord({ ...valid, updatedAt: "not-a-date" })).toBeUndefined();
  });
});
