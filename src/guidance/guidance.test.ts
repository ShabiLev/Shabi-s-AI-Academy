import { describe, expect, it } from "vitest";
import { getPageById, pageRegistry, resolvePageMetadata } from "./pageRegistry";
import { findTour, firstVisitTour } from "./tours/tourData";

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
  it("defines one global eight-step bilingual walkthrough", () => {
    expect(firstVisitTour.steps).toHaveLength(8);
    expect(firstVisitTour.steps.every((step) => step.title.he && step.title.en)).toBe(true);
    expect(firstVisitTour.steps.map((step) => step.target).filter(Boolean)).toEqual([
      "main-navigation",
      "experience-mode",
      "lessons",
      "creation-tools",
      "radar",
      "profile",
      "help",
    ]);
    expect(findTour(firstVisitTour.id)).toBe(firstVisitTour);
    expect(findTour("lessons")).toBeUndefined();
  });
});
