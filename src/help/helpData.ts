import type { HelpSection } from "./types";
const names = [
  ["getting-started", "Getting Started", "מתחילים", "/"],
  ["login", "Login", "כניסה", "/login"],
  ["dashboard", "Dashboard", "לוח הבקרה", "/"],
  ["lessons", "Lessons", "שיעורים", "/lessons"],
  ["prompt-workshop", "Prompt Workshop", "סדנת הפרומפטים", "/prompts/new"],
  ["prompt-library", "Prompt Library", "ספריית פרומפטים", "/prompts"],
  ["agent-builder", "Agent Builder", "בונה האייג׳נטים", "/agents/new"],
  ["agent-library", "Agent Library", "ספריית האייג׳נטים", "/agents"],
  ["agent-simulation", "Agent Simulation", "סימולציית אייג׳נט", "/agents"],
  ["projects", "Projects", "פרויקטים", "/projects"],
  ["ai-radar", "AI Radar", "רדאר AI", "/radar"],
  ["qa-center", "QA Center", "מרכז QA", "/qa"],
  ["settings", "Settings", "הגדרות", "/settings"],
  ["language", "Language and RTL/LTR", "שפה וכיוון", "/settings"],
  ["course-progress", "Course Progress", "התקדמות בקורס", "/lessons"],
  ["local-data", "Local Data and Privacy", "מידע מקומי ופרטיות", "/settings"],
  ["export-import", "Export and Import", "ייצוא וייבוא", "/prompts"],
  ["reset", "Reset Options", "אפשרויות איפוס", "/settings"],
  ["automated-tests", "Automated Tests", "בדיקות אוטומטיות", "/qa"],
  ["troubleshooting", "Troubleshooting", "פתרון תקלות", "/qa"],
  ["agent-blueprint", "Agent Blueprint", "תוכנית אייג׳נט", "/agents"],
];
export const helpSections: HelpSection[] = names.map(
  ([id, en, he, route], i) => ({
    id,
    slug: id,
    category: i < 4 ? "basics" : i < 10 ? "features" : "quality",
    titleHe: he,
    titleEn: en,
    summaryHe: `מדריך מעשי עבור ${he}.`,
    summaryEn: `Practical guidance for ${en}.`,
    stepsHe: [
      "פתחו את המסך מהניווט.",
      "בדקו את ההסבר והשלימו את השדות הנדרשים.",
      "שמרו או סקרו את התוצאה לפני פעולה נוספת.",
    ],
    stepsEn: [
      "Open the screen from navigation.",
      "Review the explanation and complete required fields.",
      "Save or review the result before the next action.",
    ],
    tipsHe: ["הנתונים נשמרים בדפדפן המקומי בלבד."],
    tipsEn: ["Data is stored in this local browser only."],
    warningsHe:
      id === "login"
        ? ["כניסת ההדגמה אינה אימות מאובטח לייצור."]
        : id === "agent-simulation"
          ? ["הסימולציה אינה מפעילה כלים חיצוניים."]
          : id === "qa-center"
            ? [
                "אוטומציה אינה מחליפה בדיקות נגישות ידניות; Lighthouse הוא מדד מעבדה.",
              ]
            : ["ניקוי אחסון הדפדפן מוחק נתונים מקומיים."],
    warningsEn:
      id === "login"
        ? ["Demo Login is not production authentication."]
        : id === "agent-simulation"
          ? ["Simulation does not execute external tools."]
          : id === "qa-center"
            ? [
                "Automation does not replace manual accessibility review; Lighthouse is a lab measurement.",
              ]
            : ["Clearing browser storage removes local data."],
    keywords: [id, en, he, "help", "guide"],
    relatedRoutes: [route],
    relatedHelpIds: [],
    order: i + 1,
  }),
);
