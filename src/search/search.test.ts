import { describe, expect, it } from "vitest";
import { createSafeHighlight, createSearchIndex, localizedDocument, normalizeSearchText, parseSearchStorage, searchDocuments, type SearchDocument } from ".";
const docs: SearchDocument[] = [
  { id: "lesson:qa", entityType: "lesson", title: { he: "בדיקות איכות", en: "Quality testing" }, description: { he: "תכנון בדיקות", en: "Test planning" }, keywords: ["regression"], tags: ["qa"], route: "/lessons/qa", availability: "available", updatedAt: "2026-01-01", source: "builtIn" },
  { id: "prompt:sql", entityType: "prompt", title: { he: "סקירת SQL", en: "SQL review" }, description: { he: "", en: "Review a query" }, keywords: [], tags: ["database"], route: "/prompts/sql", availability: "available", updatedAt: "2026-01-02", source: "user", favorite: true },
];
describe("workspace search", () => {
  it("normalizes English accents and Hebrew marks/final letters", () => { expect(normalizeSearchText("Café")).toBe("cafe"); expect(normalizeSearchText("מֶלֶךְ")).toBe("מלכ"); });
  it("ranks exact titles and applies favorites", () => { const results = searchDocuments(docs, "SQL review", { language: "en" }); expect(results[0].id).toBe("prompt:sql"); expect(results[0].matchedFields).toContain("title"); });
  it("supports typo tolerance, filters, and empty-query recents", () => { expect(searchDocuments(docs, "regresion", { language: "en" })[0].id).toBe("lesson:qa"); expect(searchDocuments(docs, "review", { language: "en", filters: { entityTypes: ["lesson"] } })).toHaveLength(0); expect(searchDocuments(docs, "", { language: "en", recentIds: ["lesson:qa"] })[0].id).toBe("lesson:qa"); });
  it("creates inert highlight segments", () => { const parts = createSafeHighlight("<img onerror=x> SQL review", "SQL"); expect(parts.map((part) => part.text).join("")).toContain("<img"); expect(parts.some((part) => part.matched && part.text === "SQL")).toBe(true); });
  it("recovers and bounds malformed storage", () => { expect(parseSearchStorage(null).queries).toEqual([]); expect(parseSearchStorage({ queries: Array.from({ length: 50 }, (_, index) => String(index)), recentIds: [1, "ok"] }).queries).toHaveLength(30); expect(parseSearchStorage({ recentIds: [1, "ok"] }).recentIds).toEqual(["ok"]); });
  it("builds a unique safe index and supplies empty localized descriptions", () => { const indexed = createSearchIndex([docs, [{ ...docs[0], title: { he: "כפול", en: "Duplicate" } }, { ...docs[0], id: "unsafe", route: "https://example.com" }]]); expect(indexed).toHaveLength(2); expect(indexed[0].keywords).toEqual(["regression"]); expect(localizedDocument({ ...docs[0], description: undefined })).toMatchObject({ description: { he: "", en: "" } }); });
});
