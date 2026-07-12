import type { PromptCategory } from "../types";

export type CatalogLanguage = "he" | "en" | "mixed" | "unknown";
export type SafetyReviewStatus = "approved" | "rejected" | "needsReview";

export interface CatalogEntry {
  id: string;
  sourceId: "prompts-chat";
  sourceOriginalId: string;
  title: string;
  prompt: string;
  description: string;
  language: CatalogLanguage;
  category: PromptCategory;
  tags: string[];
  sourceName: "prompts.chat";
  sourceRepository: "https://github.com/f/prompts.chat";
  sourceLicense: "CC0-1.0";
  sourceImportedAt: string;
  sourceOriginalTitle: string;
  sourceContentHash: string;
  isCurated: true;
  curationNotes: string;
  originalContent: string;
  curatedContent?: string;
  curatedTranslation?: string;
  safetyReviewStatus: SafetyReviewStatus;
}

export interface CatalogFilters {
  search: string;
  category: PromptCategory | "all";
  language: CatalogLanguage | "all";
  sort: "title" | "category";
}
