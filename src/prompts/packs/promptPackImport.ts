import { createPrompt } from "../promptStorage";
import type { Prompt } from "../types";
import type { PackedPrompt } from "./types";

export const findPackedCopies = (prompts: readonly Prompt[], packedId: string) =>
  prompts.filter((prompt) => prompt.importedFromCatalog && prompt.sourceCatalogId === `academy-pack:${packedId}`);

export function importPackedPrompt(entry: PackedPrompt, language: "he" | "en"): Prompt {
  return createPrompt({
    title: entry.title[language],
    description: entry.description[language],
    language: entry.contentLanguage,
    category: entry.category,
    tags: [...entry.tags],
    role: entry.role[language],
    task: entry.task[language],
    context: entry.context[language],
    constraints: entry.constraints[language],
    outputFormat: entry.outputFormat[language],
    examples: entry.examples[language],
    notes: `${entry.usageNotes[language]} ${entry.safetyNotes[language]}`,
    importedFromCatalog: true,
    sourceCatalogId: `academy-pack:${entry.id}`,
    sourceId: "academy-prompt-packs",
    sourceName: entry.source.name,
    sourceLicense: "Academy built-in content",
    sourceImportedAt: new Date().toISOString(),
    sourceOriginalId: entry.id,
    sourceOriginalTitle: entry.title.en,
    sourceContentHash: `${entry.packId}:${entry.id}:v${entry.source.version}`,
  });
}
