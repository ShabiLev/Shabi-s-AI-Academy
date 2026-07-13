import type { Language } from "../i18n/types";

export type SearchEntityType =
  | "lesson" | "module" | "prompt" | "promptPack" | "agent" | "project"
  | "document" | "run" | "help" | "documentation" | "roadmap" | "changelog";
export type SearchAvailability = "available" | "planned" | "disabled";
export type SearchSource = "builtIn" | "user" | "workspace";
export type SearchMatchedField = "title" | "description" | "keywords" | "tags";

export interface SearchDocument {
  id: string;
  entityType: SearchEntityType;
  title: Record<Language, string>;
  description: Record<Language, string>;
  keywords: readonly string[];
  tags: readonly string[];
  route: string;
  availability: SearchAvailability;
  updatedAt: string;
  source: SearchSource;
  category?: string;
  language?: Language | "mixed";
  favorite?: boolean;
  recent?: boolean;
}

export interface SearchResult extends SearchDocument {
  score: number;
  matchedFields: SearchMatchedField[];
}

export interface SearchFilters {
  entityTypes: SearchEntityType[];
  category: string;
  language: Language | "mixed" | "all";
  favoritesOnly: boolean;
  recentOnly: boolean;
  availability: SearchAvailability | "all";
}

export interface SearchOptions {
  language: Language;
  filters?: Partial<SearchFilters>;
  limit?: number;
  recentIds?: readonly string[];
  favoriteIds?: readonly string[];
}

export interface SearchGroup { entityType: SearchEntityType; results: SearchResult[] }

export const emptySearchFilters: SearchFilters = {
  entityTypes: [], category: "all", language: "all", favoritesOnly: false,
  recentOnly: false, availability: "all",
};

