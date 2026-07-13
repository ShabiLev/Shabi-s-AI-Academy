import type { SearchDocument } from "./types";
export function createSearchIndex(groups: readonly (readonly SearchDocument[])[]): SearchDocument[] {
  const index = new Map<string, SearchDocument>();
  for (const document of groups.flat()) if (!index.has(document.id) && document.id && document.route.startsWith("/")) index.set(document.id, { ...document, keywords: [...new Set(document.keywords)], tags: [...new Set(document.tags)] });
  return [...index.values()];
}
export function localizedDocument(input: Omit<SearchDocument, "title" | "description"> & { title: { he: string; en: string }; description?: { he: string; en: string } }): SearchDocument {
  return { ...input, description: input.description ?? { he: "", en: "" } };
}

