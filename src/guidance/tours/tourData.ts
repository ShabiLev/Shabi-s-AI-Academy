import type { LocalizedText } from "../types";

export type TourPlacement = "auto" | "top" | "bottom" | "start" | "end";
export type TourAction = "open-mobile-navigation";
export interface TourStep {
  title: LocalizedText;
  description: LocalizedText;
  target?: string;
  route?: string;
  placement?: TourPlacement;
  action?: TourAction;
}
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

export const firstVisitTour: TourDefinition = {
  id: "first-visit-v1",
  route: "/dashboard",
  title: t("סיור היכרות באקדמיה", "Academy first-visit tour"),
  steps: [
    {
      title: t("ברוכים הבאים לאקדמיה", "Welcome to the Academy"),
      description: t("סיור קצר יציג את אזורי הלמידה, היצירה, העדכונים והפרטיות. אפשר לעצור בכל עת ולהתחיל מחדש מעזרה או מהגדרות.", "This short tour introduces learning, building, updates, and privacy. You can stop any time and restart from Help or Settings."),
    },
    {
      title: t("ניווט ראשי", "Main navigation"),
      description: t("התפריט מרכז את המשימות העיקריות. בנייד נפתח אותו עכשיו כדי להמשיך בסיור.", "Navigation groups the main tasks. On mobile, we will open it now to continue the tour."),
      target: "navigation",
      action: "open-mobile-navigation",
      placement: "end",
    },
    {
      title: t("מצב מתחילים ומצב מתקדם", "Beginner and Advanced modes"),
      description: t("המצב משנה הסברים וחשיפה הדרגתית בלבד — לא הרשאות ולא נתונים.", "The mode changes guidance and progressive disclosure only — never permissions or data."),
      target: "experience-mode",
      placement: "end",
    },
    {
      title: t("שיעורים ומסלול למידה", "Lessons and learning path"),
      description: t("התחילו בשיעורים קצרים, עקבו אחר ההתקדמות וחזרו תמיד מהמקום שבו עצרתם.", "Start with short lessons, track progress, and continue where you left off."),
      target: "nav-lessons",
      placement: "end",
    },
    {
      title: t("פרומפטים וסוכנים", "Prompts and agents"),
      description: t("מצאו תבניות, בנו פרומפטים וסוכנים ושמרו עבודה מקומית בדפדפן.", "Find templates, build prompts and agents, and keep local work in this browser."),
      target: "nav-prompts",
      placement: "end",
    },
    {
      title: t("רדאר AI", "AI Radar"),
      description: t("קראו עדכונים ממקורות מזוהים. העדפות, שמירות והיסטוריה נשארות במכשיר הזה.", "Read updates from identified sources. Preferences, saves, and history stay on this device."),
      target: "nav-radar",
      placement: "end",
    },
    {
      title: t("פרופיל ופרטיות", "Profile and privacy"),
      description: t("הפרופיל מציג את מצב החשבון. הגדרות מאפשרות גיבוי, איפוס ושליטה בנתונים המקומיים.", "Profile shows account state. Settings provides backup, reset, and control over local data."),
      target: "profile",
      placement: "end",
    },
    {
      title: t("עזרה והתחלה מחדש", "Help and restart"),
      description: t("מרכז העזרה כולל מדריכים וסיורים. אפשר להפעיל את הסיור הזה מחדש בלי למחוק עבודה.", "Help contains guides and tours. You can restart this tour without deleting your work."),
      target: "nav-help",
      placement: "end",
    },
  ],
};

export function findTour(id: string) {
  return id === firstVisitTour.id ? firstVisitTour : guidedTours.find((tour) => tour.id === id);
}
