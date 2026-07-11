export type PromptLanguage = "he" | "en" | "mixed";
export type PromptCategory =
  | "qa"
  | "sql"
  | "jira"
  | "release"
  | "product"
  | "customer"
  | "development"
  | "learning"
  | "general";
export interface Prompt {
  id: string;
  title: string;
  description: string;
  language: PromptLanguage;
  category: PromptCategory;
  tags: string[];
  role: string;
  task: string;
  context: string;
  constraints: string;
  outputFormat: string;
  examples: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isFavorite: boolean;
}
export interface PromptFilters {
  search: string;
  category: PromptCategory | "all";
  language: PromptLanguage | "all";
  favoritesOnly: boolean;
  sort: "updated" | "created" | "title" | "quality";
}
export interface PromptState {
  schemaVersion: 1;
  prompts: Prompt[];
  filters: PromptFilters;
  draft?: Partial<Prompt>;
  lastOpenedPromptId?: string;
}
export type PromptInput = Omit<
  Prompt,
  "id" | "createdAt" | "updatedAt" | "version" | "isFavorite"
>;
export const categories: PromptCategory[] = [
  "qa",
  "sql",
  "jira",
  "release",
  "product",
  "customer",
  "development",
  "learning",
  "general",
];
export const emptyInput: PromptInput = {
  title: "",
  description: "",
  language: "he",
  category: "general",
  tags: [],
  role: "",
  task: "",
  context: "",
  constraints: "",
  outputFormat: "",
  examples: "",
  notes: "",
};
