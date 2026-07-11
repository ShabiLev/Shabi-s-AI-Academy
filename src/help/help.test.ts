import { describe, expect, it } from "vitest";
import { helpSections } from "./helpData";
import { searchHelp } from "./helpSearch";

describe("How To data", () => {
  it("searches English and Hebrew text and filters categories", () => {
    expect(searchHelp(helpSections, "Agent").length).toBeGreaterThan(0);
    expect(searchHelp(helpSections, "הגדרות").length).toBeGreaterThan(0);
    expect(
      searchHelp(helpSections, "", "basics").every(
        (x) => x.category === "basics",
      ),
    ).toBe(true);
  });

  it("has unique stable anchors and usable related routes", () => {
    expect(helpSections.length).toBeGreaterThanOrEqual(20);
    expect(new Set(helpSections.map((x) => x.id)).size).toBe(
      helpSections.length,
    );
    expect(
      helpSections.every(
        (x) =>
          /^[a-z0-9-]+$/.test(x.id) &&
          x.relatedRoutes.every((r) => r.startsWith("/")),
      ),
    ).toBe(true);
  });
});
