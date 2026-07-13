import type { Language } from "../i18n/types";
const routes: Array<[RegExp, Record<Language, string>]> = [
  [/^\/$/, { he: "מרכז הפיקוד מחבר למידה, בנייה ופעילות מקומית.", en: "The Command Center connects learning, building, and local activity." }],
  [/^\/search/, { he: "החיפוש מאתר ישויות מקומיות וקטלוגים ללא רשת.", en: "Search finds local entities and catalogs without using the network." }],
  [/^\/prompts/, { he: "ספריית הפרומפטים מנהלת עותקים מקומיים וקטלוגים מובנים בנפרד.", en: "The Prompt Library keeps local copies separate from built-in catalogs." }],
  [/^\/agents/, { he: "מרחב הסוכנים מתכנן סוכנים וכלים לא מחוברים להרצות Mock ו-Dry Run.", en: "The Agent workspace designs agents and unconnected tools for Mock and Dry Runs." }],
  [/^\/workflows/, { he: "בונה התהליכים מפעיל רצפים מקומיים ודטרמיניסטיים בלבד.", en: "Workflow Builder runs deterministic local sequences only." }],
];
export function explainRoute(route: string): Record<Language, string> { return routes.find(([pattern]) => pattern.test(route))?.[1] ?? { he: "מסך זה הוא חלק מסביבת העבודה המקומית של האקדמיה.", en: "This screen is part of the Academy's local workspace." }; }

