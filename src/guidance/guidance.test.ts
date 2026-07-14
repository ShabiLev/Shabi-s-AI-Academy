import { beforeEach, describe, expect, it } from "vitest";
import { getPageById, pageRegistry, resolvePageMetadata } from "./pageRegistry";
import { findTour, guidedTours } from "./tours/tourData";
import { readCompletedTours, writeCompletedTours } from "./tours/tourStorage";

describe("page guidance registry", () => {
  it("resolves nested routes to structured bilingual metadata", () => {
    expect(resolvePageMetadata("/agents/agent-1/simulate").id).toBe("agent-simulate");
    expect(resolvePageMetadata("/projects/project-1/settings").parent).toBe("projects");
    expect(pageRegistry.every((page) => page.title.he && page.title.en && page.summary.he && page.summary.en && page.helpId)).toBe(true);
  });
  it("links every declared parent to a real registry entry", () => {
    expect(pageRegistry.filter((page) => page.parent).every((page) => getPageById(page.parent!))).toBe(true);
  });
});

describe("guided tours", () => {
  beforeEach(() => localStorage.clear());
  it("defines the ten required optional tours with multiple bilingual steps", () => {
    expect(guidedTours).toHaveLength(10);
    expect(guidedTours.every((tour) => tour.steps.length >= 3 && tour.steps.every((step) => step.title.he && step.title.en))).toBe(true);
    expect(findTour("qa")?.route).toBe("/qa");
  });
  it("persists unique completion state and recovers from malformed storage", () => {
    writeCompletedTours(["dashboard", "dashboard", "lessons"]);
    expect(readCompletedTours()).toEqual(["dashboard", "lessons"]);
    localStorage.setItem("shabis-ai-academy-guided-tours-v1", "not-json");
    expect(readCompletedTours()).toEqual([]);
  });
});
