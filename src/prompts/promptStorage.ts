import {
  categories,
  emptyInput,
  type Prompt,
  type PromptFilters,
  type PromptInput,
  type PromptState,
} from "./types";
export const PROMPT_STORAGE_KEY = "shabi-ai-academy.prompt-library.v1";
export const defaultFilters: PromptFilters = {
  search: "",
  category: "all",
  language: "all",
  favoritesOnly: false,
  sort: "updated",
};
export const emptyState = (): PromptState => ({
  schemaVersion: 1,
  prompts: [],
  filters: { ...defaultFilters },
});
const valid = (p: unknown): p is Prompt =>
  Boolean(
    p &&
      typeof p === "object" &&
      typeof (p as Prompt).id === "string" &&
      typeof (p as Prompt).title === "string" &&
      typeof (p as Prompt).task === "string" &&
      categories.includes((p as Prompt).category),
  );
export function loadPromptState(): PromptState {
  try {
    const raw = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (!raw) return emptyState();
    const value = JSON.parse(raw) as PromptState;
    if (value?.schemaVersion !== 1 || !Array.isArray(value.prompts))
      return emptyState();
    const seen = new Set<string>(),
      prompts = value.prompts
        .filter(valid)
        .filter((p) => !seen.has(p.id) && Boolean(seen.add(p.id)));
    return {
      schemaVersion: 1,
      prompts,
      filters: { ...defaultFilters, ...value.filters },
      draft: value.draft,
      lastOpenedPromptId: value.lastOpenedPromptId,
    };
  } catch {
    return emptyState();
  }
}
export function savePromptState(s: PromptState) {
  try {
    localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* optional */
  }
}
export function createPrompt(input: PromptInput): Prompt {
  const now = new Date().toISOString();
  return {
    ...emptyInput,
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    version: 1,
    isFavorite: false,
  };
}
export function editPrompt(p: Prompt, input: PromptInput): Prompt {
  const changed = (Object.keys(emptyInput) as Array<keyof PromptInput>).some(
    (key) => JSON.stringify(p[key]) !== JSON.stringify(input[key]),
  );
  if (!changed) return p;
  return {
    ...p,
    ...input,
    version: p.version + 1,
    updatedAt: new Date().toISOString(),
  };
}
export function duplicatePrompt(p: Prompt, suffix: string): Prompt {
  return createPrompt({
    ...p,
    title: `${p.title} ${suffix}`,
    isFavorite: undefined as never,
  } as PromptInput);
}
