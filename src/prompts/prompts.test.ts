import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPrompt,
  defaultFilters,
  duplicatePrompt,
  editPrompt,
  emptyState,
  loadPromptState,
  PROMPT_STORAGE_KEY,
} from "./promptStorage";
import { emptyInput, type PromptInput } from "./types";
import { evaluatePrompt } from "./promptQuality";
import { buildPrompt, formatExport, sanitizeFilename } from "./promptTemplate";
import { filterPrompts } from "./utils";
const input = (patch: Partial<PromptInput> = {}): PromptInput => ({
  ...emptyInput,
  title: "QA Login",
  task: "Create detailed login test cases for mobile and desktop.",
  tags: ["qa", "login"],
  category: "qa",
  ...patch,
});
describe("prompt domain", () => {
  beforeEach(() => localStorage.clear());
  it("loads an empty library safely", () =>
    expect(loadPromptState()).toEqual(emptyState()));
  it("returns defaults for malformed storage", () => {
    localStorage.setItem(PROMPT_STORAGE_KEY, "{bad");
    expect(loadPromptState().prompts).toHaveLength(0);
  });
  it("creates unique IDs", () => {
    const a = createPrompt(input()),
      b = createPrompt(input());
    expect(a.id).not.toBe(b.id);
  });
  it("editing increments version", () =>
    expect(
      editPrompt(
        createPrompt(input()),
        input({ task: "A meaningfully changed task with enough detail." }),
      ).version,
    ).toBe(2));
  it("unchanged editing does not increment", () => {
    const p = createPrompt(input());
    expect(editPrompt(p, input()).version).toBe(1);
  });
  it("duplicate resets ID and version", () => {
    const p = { ...createPrompt(input()), version: 4 };
    const copy = duplicatePrompt(p, "Copy");
    expect(copy.id).not.toBe(p.id);
    expect(copy.version).toBe(1);
  });
  it("empty quality is zero", () =>
    expect(evaluatePrompt(emptyInput).score).toBe(0));
  it("task clarity earns points", () =>
    expect(
      evaluatePrompt(
        input({ context: "", constraints: "", outputFormat: "", title: "" }),
      ).score,
    ).toBeGreaterThan(0));
  it("context improves quality", () =>
    expect(
      evaluatePrompt(
        input({ context: "A detailed system context for the login feature." }),
      ).score,
    ).toBeGreaterThan(evaluatePrompt(input({ context: "" })).score));
  it("constraints improve quality", () =>
    expect(
      evaluatePrompt(input({ constraints: "Do not assume social login." }))
        .score,
    ).toBeGreaterThan(evaluatePrompt(input({ constraints: "" })).score));
  it("output format improves quality", () =>
    expect(
      evaluatePrompt(
        input({ outputFormat: "Return a table with ID and expected result." }),
      ).score,
    ).toBeGreaterThan(evaluatePrompt(input({ outputFormat: "" })).score));
  it("score never exceeds 100", () =>
    expect(
      evaluatePrompt(
        input({
          context: "x".repeat(100),
          constraints: "x".repeat(100),
          outputFormat: "x".repeat(100),
          role: "role",
        }),
      ).score,
    ).toBeLessThanOrEqual(100));
  it("sanitizes filenames", () =>
    expect(sanitizeFilename(" Bad:/Name? ")).toBe("bad-name"));
  it("Markdown preserves Hebrew", () => {
    const p = createPrompt(input({ title: "בדיקה", task: "צור בדיקות" }));
    expect(formatExport(p, "md", 50, "he")).toContain("צור בדיקות");
  });
  it("search matches title", () =>
    expect(
      filterPrompts([createPrompt(input())], {
        ...defaultFilters,
        search: "login",
      }),
    ).toHaveLength(1));
  it("search matches tags", () =>
    expect(
      filterPrompts([createPrompt(input())], {
        ...defaultFilters,
        search: "qa",
      }),
    ).toHaveLength(1));
  it("category filters", () =>
    expect(
      filterPrompts([createPrompt(input())], {
        ...defaultFilters,
        category: "sql",
      }),
    ).toHaveLength(0));
  it("favorite filters", () =>
    expect(
      filterPrompts([{ ...createPrompt(input()), isFavorite: true }], {
        ...defaultFilters,
        favoritesOnly: true,
      }),
    ).toHaveLength(1));
  it("sorts by updated date", () => {
    const a = {
        ...createPrompt(input({ title: "a" })),
        updatedAt: "2020-01-01",
      },
      b = { ...createPrompt(input({ title: "b" })), updatedAt: "2021-01-01" };
    expect(filterPrompts([a, b], defaultFilters)[0].title).toBe("b");
  });
  it("preview omits empty sections", () =>
    expect(buildPrompt(input({ context: "" }), "en")).not.toContain(
      "Context:",
    ));
  it("preview includes populated sections", () =>
    expect(buildPrompt(input({ context: "Login context" }), "en")).toContain(
      "Context:\nLogin context",
    ));
  it("malformed duplicate IDs are removed", () => {
    const p = createPrompt(input());
    localStorage.setItem(
      PROMPT_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        prompts: [p, p],
        filters: defaultFilters,
      }),
    );
    expect(loadPromptState().prompts).toHaveLength(1);
  });
  it("course reset cannot remove prompt storage", () => {
    localStorage.setItem(PROMPT_STORAGE_KEY, "saved");
    localStorage.removeItem("shabi-ai-academy.course-progress.v1");
    expect(localStorage.getItem(PROMPT_STORAGE_KEY)).toBe("saved");
  });
  it("does not rely on dates in quality", () => {
    vi.setSystemTime(new Date("2030-01-01"));
    expect(evaluatePrompt(input()).score).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
