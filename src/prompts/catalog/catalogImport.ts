import { createPrompt } from "../promptStorage";
import type { Prompt } from "../types";
import type { CatalogEntry } from "./types";

export function findImportedCopies(
  prompts: readonly Prompt[],
  catalogId: string,
): Prompt[] {
  return prompts.filter(
    (prompt) =>
      prompt.importedFromCatalog && prompt.sourceCatalogId === catalogId,
  );
}

export function importCatalogEntry(entry: CatalogEntry): Prompt {
  return createPrompt({
    title: entry.title,
    description: entry.description,
    language:
      entry.language === "he" || entry.language === "mixed"
        ? entry.language
        : "en",
    category: entry.category,
    tags: [...entry.tags],
    role: "",
    task: entry.curatedContent ?? entry.prompt,
    context: "",
    constraints: "Review source content and verify outputs before use.",
    outputFormat: "Return a clear, reviewable result.",
    examples: "",
    notes:
      "Imported from the read-only Starter Catalog; this local copy may be edited.",
    importedFromCatalog: true,
    sourceCatalogId: entry.id,
    sourceId: entry.sourceId,
    sourceName: entry.sourceName,
    sourceRepository: entry.sourceRepository,
    sourceLicense: entry.sourceLicense,
    sourceImportedAt: new Date().toISOString(),
    sourceOriginalId: entry.sourceOriginalId,
    sourceOriginalTitle: entry.sourceOriginalTitle,
    sourceContentHash: entry.sourceContentHash,
  });
}
