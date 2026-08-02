import { beforeEach, describe, expect, it } from "vitest";
import { COURSE_PROGRESS_KEY, emptyProgress, loadProgress, saveProgress } from "./progress";

describe("course progress migration", () => {
  beforeEach(() => localStorage.clear());

  it("starts empty at schema 2 with no lessons", () => {
    expect(loadProgress()).toEqual(emptyProgress());
    expect(emptyProgress().version).toBe(2);
  });

  it("migrates schema 1 click-only completion forward as legacy and unverified, never promoted to verified", () => {
    localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify({
      version: 1,
      lessons: { "ai-llm-agent": { started: true, completed: true, quizScore: 1, lastUpdated: "2026-01-01T00:00:00.000Z" } },
      lastUpdated: "2026-01-01T00:00:00.000Z",
    }));
    const migrated = loadProgress();
    expect(migrated.version).toBe(2);
    expect(migrated.lessons["ai-llm-agent"]).toMatchObject({ completed: true, verified: false, quizScore: 1 });
  });

  it("recovers from malformed or unrecognized-version storage", () => {
    localStorage.setItem(COURSE_PROGRESS_KEY, "{");
    expect(loadProgress()).toEqual(emptyProgress());
    localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify({ version: 99, lessons: {} }));
    expect(loadProgress()).toEqual(emptyProgress());
  });

  it("round-trips schema 2 data including verified evidence-backed completion", () => {
    const progress = { version: 2 as const, lessons: { "ai-llm-agent": { started: true, completed: true, verified: true, quizScore: 1, lastUpdated: "2026-08-01T00:00:00.000Z" } }, lastUpdated: "2026-08-01T00:00:00.000Z" };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
});
