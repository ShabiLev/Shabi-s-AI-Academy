import type { ReactNode } from "react";

export type OutcomeLanguage = "he" | "en";
export type LocalizedOutcomeText = Record<OutcomeLanguage, string>;

export interface OutcomeReference {
  id: string;
  label: LocalizedOutcomeText;
  href?: string;
}

export interface OutcomeAction {
  id: string;
  label: LocalizedOutcomeText;
  description?: LocalizedOutcomeText;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  leadingIcon?: ReactNode;
}
