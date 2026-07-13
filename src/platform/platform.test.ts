import { describe, expect, it } from "vitest";
import { roadmapItems } from "./roadmap";
import { userDocs } from "./docsIndex";
import { courseLessons } from "../course/courseData";
import { packedPrompts } from "../prompts/packs";
import { starterAgents } from "../agents/catalog";
import { catalogCounts } from "../config/catalogCounts";
describe("beta platform data", () => {
  it("reports honest typed roadmap states", () => { expect(roadmapItems.some((item) => item.status === "completed" && item.version === "1.1.0-beta.1")).toBe(true); expect(roadmapItems.filter((item) => item.status === "planned").length).toBeGreaterThan(0); });
  it("indexes user documentation without engineering specifications", () => { expect(userDocs.length).toBeGreaterThanOrEqual(9); expect(userDocs.flat().join(" ")).not.toContain(".codex"); });
  it("exposes real catalog counts", () => { expect(courseLessons).toHaveLength(45); expect(packedPrompts).toHaveLength(catalogCounts.packedPrompts); expect(starterAgents).toHaveLength(catalogCounts.starterAgents); });
});
