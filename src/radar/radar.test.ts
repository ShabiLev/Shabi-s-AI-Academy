import { describe, expect, it } from "vitest";
import { filterRadarItems, isRadarSnapshotStale, newestVerification, radarItems, validateRadarCatalog } from ".";

describe("AI Radar catalog", () => {
  it("contains a valid bilingual official-source snapshot", () => {
    expect(radarItems.length).toBeGreaterThanOrEqual(8);
    expect(validateRadarCatalog(radarItems)).toEqual([]);
    expect(Object.isFrozen(radarItems)).toBe(true);
  });

  it("filters without mutating the catalog", () => {
    const original = [...radarItems];
    expect(filterRadarItems(radarItems, { query: "agent", category: "all", horizon: "all" }, "en").length).toBeGreaterThan(0);
    expect(filterRadarItems(radarItems, { query: "", category: "safety", horizon: "next" }, "en").every((item) => item.category === "safety" && item.horizon === "next")).toBe(true);
    expect(radarItems).toEqual(original);
  });

  it("reports snapshot freshness from the latest verification", () => {
    expect(newestVerification(radarItems)).toBe("2026-07-13");
    expect(isRadarSnapshotStale(radarItems, "2026-10-11")).toBe(false);
    expect(isRadarSnapshotStale(radarItems, "2026-10-12")).toBe(true);
  });
});
