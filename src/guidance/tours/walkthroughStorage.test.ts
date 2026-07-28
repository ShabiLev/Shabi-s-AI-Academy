import { describe, expect, it } from "vitest";
import {
  FIRST_VISIT_TOUR_ID,
  WALKTHROUGH_MAX_BYTES,
  beginWalkthrough,
  closeWalkthrough,
  completeWalkthrough,
  createWalkthroughRecord,
  parseWalkthroughRecord,
  readWalkthroughRecord,
  walkthroughStorageKey,
  writeWalkthroughRecord,
  updateWalkthroughStep,
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
      firstStartedAt: "2026-07-26T12:00:00.000Z",
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

  it("does not leak a legacy completion into a new actor", () => {
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

  it("migrates the beta.2 dismissed state to resumable in-progress state", () => {
    const actor = "returning-actor";
    const key = walkthroughStorageKey(actor);
    const storage = memoryStorage({
      [key]: JSON.stringify({
        ...createWalkthroughRecord("en", () => "2026-07-26T12:00:00.000Z"),
        status: "dismissed",
        currentStep: 4,
        startedAt: "2026-07-26T12:00:00.000Z",
        dismissedAt: "2026-07-26T12:05:00.000Z",
      }),
    });
    expect(readWalkthroughRecord(actor, "en", storage)).toMatchObject({
      status: "in-progress",
      currentStep: 4,
      firstStartedAt: "2026-07-26T12:00:00.000Z",
    });
  });

  it("starts fresh, closes, and resumes without completing", () => {
    const initial = createWalkthroughRecord("en", () => "2026-07-26T12:00:00.000Z");
    const started = beginWalkthrough(initial, "first-visit", "en", () => "2026-07-26T12:01:00.000Z");
    const progressed = updateWalkthroughStep(started, 3, "first-visit", "en", () => "2026-07-26T12:02:00.000Z");
    const closed = closeWalkthrough(progressed, 3, "first-visit", "en", () => "2026-07-26T12:03:00.000Z");
    const resumed = beginWalkthrough(closed, "resume", "en", () => "2026-07-26T12:04:00.000Z");
    expect(closed).toMatchObject({ status: "in-progress", currentStep: 3 });
    expect(resumed).toMatchObject({ status: "in-progress", currentStep: 3 });
  });

  it("completes only through the final completion transition", () => {
    const record = beginWalkthrough(
      createWalkthroughRecord("he", () => "2026-07-26T12:00:00.000Z"),
      "first-visit",
      "he",
      () => "2026-07-26T12:01:00.000Z",
    );
    expect(completeWalkthrough(record, "he", () => "2026-07-26T12:08:00.000Z")).toMatchObject({
      status: "completed",
      currentStep: 7,
      completedAt: "2026-07-26T12:08:00.000Z",
    });
  });

  it("manual replay preserves the completed record on step and close", () => {
    const completed = completeWalkthrough(
      createWalkthroughRecord("en", () => "2026-07-26T12:00:00.000Z"),
      "en",
      () => "2026-07-26T12:08:00.000Z",
    );
    expect(beginWalkthrough(completed, "manual-replay", "he")).toEqual(completed);
    expect(updateWalkthroughStep(completed, 2, "manual-replay", "he")).toEqual(completed);
    expect(closeWalkthrough(completed, 2, "manual-replay", "he")).toEqual(completed);
  });

  it("keeps actors isolated", () => {
    const storage = memoryStorage();
    const completed = completeWalkthrough(
      createWalkthroughRecord("en", () => "2026-07-26T12:00:00.000Z"),
      "en",
      () => "2026-07-26T12:08:00.000Z",
    );
    writeWalkthroughRecord("actor-a", completed, storage);
    expect(readWalkthroughRecord("actor-a", "en", storage).status).toBe("completed");
    expect(readWalkthroughRecord("actor-b", "en", storage).status).toBe("not-started");
  });

  it("rejects invalid schema, step, status, and timestamp values", () => {
    const valid = createWalkthroughRecord("he", () => "2026-07-26T12:00:00.000Z");
    expect(parseWalkthroughRecord({ ...valid, schemaVersion: 2 })).toBeUndefined();
    expect(parseWalkthroughRecord({ ...valid, currentStep: 8 })).toBeUndefined();
    expect(parseWalkthroughRecord({ ...valid, status: "unknown" })).toBeUndefined();
    expect(parseWalkthroughRecord({ ...valid, updatedAt: "not-a-date" })).toBeUndefined();
  });
});
