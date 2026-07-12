import { beforeEach, describe, expect, it, vi } from "vitest";
import { formatExport } from "../promptTemplate";
import { editPrompt, PROMPT_STORAGE_KEY } from "../promptStorage";
import {
  catalogContentHash,
  defaultCatalogFilters,
  filterCatalog,
  findImportedCopies,
  importCatalogEntry,
  normalizeCatalogText,
  parseCatalogCsv,
  starterCatalog,
  validateCatalog,
  validateCatalogEntry,
} from ".";
import { catalogUi } from "./catalogUi";

describe("Starter Catalog", () => {
  beforeEach(() => localStorage.clear());
  it("ships a reviewed target-sized Catalog with complete CC0 source metadata", () => {
    expect(starterCatalog.length).toBeGreaterThanOrEqual(20);
    expect(starterCatalog.length).toBeLessThanOrEqual(40);
    expect(
      starterCatalog.every(
        (entry) =>
          entry.sourceId === "prompts-chat" &&
          entry.sourceLicense === "CC0-1.0" &&
          entry.sourceRepository.includes("f/prompts.chat") &&
          entry.safetyReviewStatus === "approved",
      ),
    ).toBe(true);
    expect(validateCatalog(starterCatalog)).toEqual([]);
  });
  it("has deterministic unique IDs, bodies, and hashes", () => {
    expect(
      new Set(starterCatalog.map((entry) => entry.sourceOriginalId)).size,
    ).toBe(starterCatalog.length);
    expect(
      new Set(starterCatalog.map((entry) => normalizeCatalogText(entry.prompt)))
        .size,
    ).toBe(starterCatalog.length);
    expect(
      starterCatalog.every(
        (entry) =>
          entry.sourceContentHash === catalogContentHash(entry.originalContent),
      ),
    ).toBe(true);
    expect(catalogContentHash(" A  prompt ")).toBe(
      catalogContentHash("a prompt"),
    );
  });
  it("rejects empty, title-only, malformed, unapproved, and wrongly licensed records", () => {
    expect(validateCatalogEntry(null)).toContain("Malformed record");
    expect(validateCatalogEntry({ title: "", prompt: "" })).toContain(
      "Missing prompt",
    );
    expect(validateCatalogEntry({ title: "Only title", prompt: "" })).toContain(
      "Title-only record",
    );
    expect(
      validateCatalogEntry({
        title: "x",
        prompt: "x",
        originalContent: "x",
        sourceLicense: "MIT",
        safetyReviewStatus: "needsReview",
        sourceContentHash: "bad",
      }),
    ).toEqual(
      expect.arrayContaining([
        "Invalid license",
        "Entry is not approved",
        "Hash mismatch",
      ]),
    );
  });
  it("searches title, description, and prompt text", () => {
    expect(
      filterCatalog(starterCatalog, {
        ...defaultCatalogFilters,
        search: "SQL Query",
      }).some((entry) => entry.category === "sql"),
    ).toBe(true);
    expect(
      filterCatalog(starterCatalog, {
        ...defaultCatalogFilters,
        search: "reviewed educational",
      }).length,
    ).toBe(starterCatalog.length);
    expect(
      filterCatalog(starterCatalog, {
        ...defaultCatalogFilters,
        search: "idempotency",
      }).map((entry) => entry.title),
    ).toContain("API Contract Reviewer");
  });
  it("filters category and language, sorts, and resets independently", () => {
    expect(
      filterCatalog(starterCatalog, {
        ...defaultCatalogFilters,
        category: "qa",
      }).every((entry) => entry.category === "qa"),
    ).toBe(true);
    expect(
      filterCatalog(starterCatalog, {
        ...defaultCatalogFilters,
        language: "he",
      }),
    ).toEqual([]);
    const sorted = filterCatalog(starterCatalog, {
      ...defaultCatalogFilters,
      sort: "category",
    });
    expect(
      sorted[0].category.localeCompare(sorted.at(-1)!.category),
    ).toBeLessThanOrEqual(0);
    expect(defaultCatalogFilters).toEqual({
      search: "",
      category: "all",
      language: "all",
      sort: "title",
    });
  });
  it("imports an editable attributed version-one local copy without mutating Catalog", () => {
    vi.stubGlobal("crypto", { randomUUID: () => "local-copy" });
    const source = starterCatalog[0],
      snapshot = JSON.stringify(source),
      prompt = importCatalogEntry(source);
    expect(prompt).toMatchObject({
      id: "local-copy",
      version: 1,
      importedFromCatalog: true,
      sourceCatalogId: source.id,
      sourceLicense: "CC0-1.0",
      sourceContentHash: source.sourceContentHash,
    });
    expect(prompt.createdAt).toBeTruthy();
    expect(prompt.updatedAt).toBeTruthy();
    expect(JSON.stringify(source)).toBe(snapshot);
    const edited = editPrompt(prompt, {
      ...prompt,
      task: `${prompt.task}\nLocal edit`,
    });
    expect(edited.version).toBe(2);
    expect(edited.sourceCatalogId).toBe(source.id);
    vi.unstubAllGlobals();
  });
  it("detects duplicate imports while allowing an explicit additional copy", () => {
    const first = importCatalogEntry(starterCatalog[0]);
    expect(findImportedCopies([first], starterCatalog[0].id)).toEqual([first]);
    const second = importCatalogEntry(starterCatalog[0]);
    expect(second.id).not.toBe(first.id);
    expect(
      findImportedCopies([first, second], starterCatalog[0].id),
    ).toHaveLength(2);
  });
  it("includes attribution in imported exports and safe bilingual labels", () => {
    const prompt = importCatalogEntry(starterCatalog[0]);
    const exported = formatExport(prompt, "md", 80, "en");
    expect(exported).toContain("Source: prompts.chat");
    expect(exported).toContain("Source license: CC0-1.0");
    expect(catalogUi.he.catalog).toBeTruthy();
    expect(catalogUi.en.catalog).toBe("Starter Catalog");
  });
  it("does not write Catalog entries to personal storage automatically", () => {
    expect(localStorage.getItem(PROMPT_STORAGE_KEY)).toBeNull();
    expect(
      starterCatalog.every((entry) => !entry.prompt.includes("<script")),
    ).toBe(true);
  });
  it("parses quoted source CSV and rejects malformed input safely", () => {
    expect(
      parseCatalogCsv('act,prompt\n"Reviewer","Review a, b, and c"'),
    ).toEqual([{ act: "Reviewer", prompt: "Review a, b, and c" }]);
    expect(parseCatalogCsv('act,prompt\n"broken,content')).toEqual([]);
    expect(parseCatalogCsv("wrong,headers\na,b")).toEqual([]);
  });
});
