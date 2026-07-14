import type { LocalizedText } from "../types";

export interface TourStep { title: LocalizedText; description: LocalizedText }
export interface TourDefinition { id: string; route: string; title: LocalizedText; steps: TourStep[] }
const t = (he: string, en: string) => ({ he, en });
const definitions: Array<[string, string, string, string]> = [
  ["dashboard", "/dashboard", "לוח המשימות", "Task dashboard"], ["lessons", "/lessons", "שיעורים", "Lessons"],
  ["prompts", "/prompts", "ספריית הפרומפטים", "Prompt Library"], ["agents", "/agents", "ספריית הסוכנים", "Agent Library"],
  ["prompt-playground", "/playground/prompts", "מגרש הפרומפטים", "Prompt Playground"], ["agent-playground", "/playground/agents", "מגרש הסוכנים", "Agent Playground"],
  ["projects", "/projects", "פרויקטים", "Projects"], ["knowledge", "/knowledge", "מאגר ידע", "Knowledge Base"],
  ["workflows", "/workflows", "תהליכי עבודה", "Workflows"], ["qa", "/qa", "מרכז QA", "QA Center"],
];

export const guidedTours: TourDefinition[] = definitions.map(([id, route, he, en]) => ({
  id, route, title: t(he, en), steps: [
    { title: t("מטרת המסך", "Screen purpose"), description: t(`כאן עובדים עם ${he} בצורה ממוקדת.`, `Use ${en} here with a clear task in mind.`) },
    { title: t("הפעולה הבאה", "Next action"), description: t("התחילו מהפעולה הראשית, ופתחו עזרה אם נדרש הקשר נוסף.", "Start with the primary action, and open Help when you need more context.") },
    { title: t("שמירה ופרטיות", "Saving and privacy"), description: t("שינויים מקומיים נשמרים בדפדפן עד שתבחרו אחרת.", "Local changes stay in this browser unless you choose otherwise.") },
  ],
}));

export function findTour(id: string) { return guidedTours.find((tour) => tour.id === id); }
