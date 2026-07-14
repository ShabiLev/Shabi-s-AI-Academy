import type { Language } from "../i18n/types";

export interface LocalizedText { he: string; en: string }

export type ProductArea = "home" | "learn" | "build" | "workspace" | "more" | "account";

export interface PageMetadata {
  id: string;
  pattern: RegExp;
  route: string;
  area: ProductArea;
  title: LocalizedText;
  summary: LocalizedText;
  purpose: LocalizedText;
  primaryTask: LocalizedText;
  primaryAction?: { label: LocalizedText; to: string };
  secondaryAction?: { label: LocalizedText; to: string };
  helpId: string;
  glossaryTerms: string[];
  nextRoute?: string;
  visibility: "beginner" | "advanced" | "developer";
  access: "public" | "protected" | "authenticated" | "admin";
  parent?: string;
  tourId?: string;
}

export function localize(text: LocalizedText, language: Language) { return text[language]; }
