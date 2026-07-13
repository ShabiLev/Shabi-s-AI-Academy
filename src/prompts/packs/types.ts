import type { LocalizedText } from "../../course/types";
import type { PromptCategory, PromptLanguage } from "../types";

export type PromptDifficulty = "beginner" | "intermediate" | "advanced";

export interface PromptPackDefinition {
  readonly id: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly count: number;
  readonly category: PromptCategory;
}

export interface PackedPrompt {
  readonly id: string;
  readonly packId: string;
  readonly title: LocalizedText;
  readonly description: LocalizedText;
  readonly contentLanguage: PromptLanguage;
  readonly category: PromptCategory;
  readonly tags: readonly string[];
  readonly difficulty: PromptDifficulty;
  readonly role: LocalizedText;
  readonly task: LocalizedText;
  readonly context: LocalizedText;
  readonly constraints: LocalizedText;
  readonly outputFormat: LocalizedText;
  readonly examples: LocalizedText;
  readonly variables: readonly string[];
  readonly expectedOutput: LocalizedText;
  readonly usageNotes: LocalizedText;
  readonly safetyNotes: LocalizedText;
  readonly source: { readonly name: "Shabi's AI Academy"; readonly version: 1 };
}
