import type { Interest } from "./types";

export const interests: readonly Interest[] = ["qa", "sql", "product", "development", "promptEngineering", "agents", "automation", "research"];

export const interestLabels: Record<Interest, { he: string; en: string }> = {
  qa: { he: "QA ובדיקות", en: "QA and testing" },
  sql: { he: "SQL ונתונים", en: "SQL and data" },
  product: { he: "ניהול מוצר", en: "Product management" },
  development: { he: "פיתוח", en: "Development" },
  promptEngineering: { he: "הנדסת פרומפטים", en: "Prompt Engineering" },
  agents: { he: "סוכני AI", en: "AI Agents" },
  automation: { he: "אוטומציה", en: "Automation" },
  research: { he: "מחקר", en: "Research" },
};

function humanizeIdentifier(identifier: string): string {
  const words = identifier.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").trim();
  if (!words) return "Unknown";
  return words.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function interestDisplayLabel(identifier: string, language: "he" | "en"): string {
  if (identifier in interestLabels) return interestLabels[identifier as Interest][language];
  return humanizeIdentifier(identifier);
}
