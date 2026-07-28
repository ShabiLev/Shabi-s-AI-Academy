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

export const firstVisitTour: TourDefinition = {
  id: "first-visit-v1",
  route: "/dashboard",
  title: t("סיור היכרות באקדמיה", "Academy first-visit tour"),
  steps: [
    {
      title: t("ברוכים הבאים לאקדמיה", "Welcome to the Academy"),
      description: t("סיור קצר יציג את אזורי הלמידה, היצירה, העדכונים והפרטיות. אפשר לעצור בכל עת; בביקור הבא נמשיך מאותו שלב.", "This short tour introduces learning, building, updates, and privacy. You can stop at any time; your next visit resumes from the same step."),
    },
    {
      title: t("ניווט ראשי", "Main navigation"),
      description: t("התפריט מרכז את המשימות העיקריות. בנייד נפתח אותו עכשיו כדי להמשיך בסיור.", "Navigation groups the main tasks. On mobile, we will open it now to continue the tour."),
      target: "main-navigation",
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
      target: "lessons",
      placement: "end",
    },
    {
      title: t("פרומפטים וסוכנים", "Prompts and agents"),
      description: t("מצאו תבניות, בנו פרומפטים וסוכנים ושמרו עבודה מקומית בדפדפן.", "Find templates, build prompts and agents, and keep local work in this browser."),
      target: "creation-tools",
      placement: "end",
    },
    {
      title: t("רדאר AI", "AI Radar"),
      description: t("קראו עדכונים ממקורות מזוהים. העדפות, שמירות והיסטוריה נשארות במכשיר הזה.", "Read updates from identified sources. Preferences, saves, and history stay on this device."),
      target: "radar",
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
      target: "help",
      placement: "end",
    },
  ],
};

export function findTour(id: string) {
  return id === firstVisitTour.id ? firstVisitTour : undefined;
}
