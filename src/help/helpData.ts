import type { HelpSection } from "./types";
const names = [
  ["getting-started", "Getting Started", "מתחילים", "/"],
  ["login", "Login", "כניסה", "/login"],
  ["dashboard", "Dashboard", "לוח הבקרה", "/"],
  ["lessons", "Lessons", "שיעורים", "/lessons"],
  ["prompt-workshop", "Prompt Workshop", "סדנת הפרומפטים", "/prompts/new"],
  ["prompt-library", "Prompt Library", "ספריית פרומפטים", "/prompts"],
  ["starter-catalog", "Starter Catalog", "קטלוג התחלתי", "/prompts/catalog"],
  ["catalog-import", "Catalog Import", "ייבוא מהקטלוג", "/prompts/catalog"],
  [
    "catalog-duplicates",
    "Duplicate Catalog Imports",
    "ייבוא כפול מהקטלוג",
    "/prompts/catalog",
  ],
  [
    "catalog-attribution",
    "Prompt Source Attribution",
    "ייחוס מקור לפרומפט",
    "/prompts/catalog",
  ],
  ["agent-builder", "Agent Builder", "בונה האייג׳נטים", "/agents/new"],
  ["agent-library", "Agent Library", "ספריית האייג׳נטים", "/agents"],
  ["agent-simulation", "Agent Simulation", "סימולציית אייג׳נט", "/agents"],
  ["runtime-engine", "What is the Runtime Engine?", "מהו מנוע ההרצה?", "/runs"],
  ["mock-run", "Mock Run", "הרצת Mock", "/runs"],
  ["dry-run", "Dry Run", "תצוגת Dry Run", "/runs"],
  ["live-reserved", "Live Reserved", "הרצה חיה שמורה", "/runs"],
  ["run-history", "Run History", "היסטוריית הרצות", "/runs"],
  ["run-details", "Run Details", "פרטי הרצה", "/runs"],
  ["approval-flow", "Approval Flow", "תהליך אישור", "/runs"],
  [
    "retry-cancellation",
    "Retry and Cancellation",
    "ניסיון חוזר וביטול",
    "/runs",
  ],
  [
    "runtime-privacy",
    "Runtime Storage and Privacy",
    "אחסון ופרטיות Runtime",
    "/runs",
  ],
  ["planned-tools", "Planned Tools", "כלים מתוכננים", "/runs"],
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
  ["prompt-packs", "Prompt Packs", "חבילות פרומפטים", "/prompts/packs"],
  ["starter-agents", "Starter Agents", "סוכנים התחלתיים", "/agents/catalog"],
  ["prompt-playground", "Prompt Playground", "מגרש פרומפטים", "/playground/prompts"],
  ["agent-playground", "Agent Playground", "מגרש סוכנים", "/playground/agents"],
  ["knowledge-base", "Knowledge Base", "מאגר ידע", "/knowledge"],
  ["learning-journey", "Learning Journey", "מסע הלמידה", "/journey"],
  ["roadmap", "Roadmap", "מפת דרכים", "/roadmap"],
  ["release-center", "Release Center", "מרכז שחרור", "/release"],
  ["developer-mode", "Developer Mode", "מצב מפתחים", "/developer"],
  ["documentation", "Documentation Center", "מרכז תיעוד", "/docs"],
];
export const helpSections: HelpSection[] = names.map(
  ([id, en, he, route], i) => ({
    id,
    slug: id,
    category: i < 4 ? "basics" : i < 10 ? "features" : "quality",
    titleHe: he,
    titleEn: en,
    summaryHe:
      id === "starter-catalog"
        ? "הקטלוג הוא אוסף מובנה לקריאה בלבד; הפרומפטים שלי הם עותקים מקומיים וניתנים לעריכה."
        : id === "catalog-import"
          ? "ייבוא מפורש יוצר עותק מקומי חדש ושומר ייחוס מקור ורישיון."
          : id === "catalog-duplicates"
            ? "ייבוא חוזר דורש בחירה: פתיחת העותק הקיים, עותק נוסף או ביטול."
            : id === "catalog-attribution"
              ? "פרומפט שיובא מציג את prompts.chat, רישיון CC0-1.0, תאריך הייבוא והערה שהעותק עשוי להשתנות."
              : id === "runtime-engine"
                ? "מנוע ההרצה מפעיל סימולציות מקומיות ודטרמיניסטיות בלבד; אין חיבור לספק AI או לכלי חיצוני."
                : id === "mock-run"
                  ? "פלט Mock הוא סימולציה צפויה מראש ואינו תשובת מודל AI."
                  : id === "dry-run"
                    ? "Dry Run מאמת ומרכיב תצוגה מקדימה בלי להפעיל ספק או כלי."
                    : id === "live-reserved"
                      ? "הרצה חיה מושבתת מסיבות אבטחה ואינה מקבלת מפתחות API."
                      : id === "run-history" || id === "run-details"
                        ? "היסטוריית ההרצות נשמרת בדפדפן בלבד, מוגבלת ל-50 רשומות וניתנת למחיקה."
                        : id === "approval-flow"
                          ? "פעולה מסוכנת מדומה נעצרת עד לאישור מפורש וחדש לכל הרצה."
                          : id === "retry-cancellation"
                            ? "ניסיונות חוזרים מוגבלים; ביטול הוא סופי ומתועד בציר הזמן."
                            : id === "runtime-privacy"
                              ? "אין להזין מידע רגיש. אחסון פגום נטען כברירת מחדל בטוחה."
                              : id === "planned-tools"
                                ? "הכלים הם תיאורי תכנון בלבד: אינם מחוברים ואינם מופעלים."
                                : `מדריך מעשי עבור ${he}.`,
    summaryEn:
      id === "starter-catalog"
        ? "The Catalog is bundled read-only data; My Prompts are editable browser-local copies."
        : id === "catalog-import"
          ? "Explicit import creates a new local copy and preserves source and license attribution."
          : id === "catalog-duplicates"
            ? "A repeat import requires Open existing copy, Import another copy, or Cancel."
            : id === "catalog-attribution"
              ? "Imported details show prompts.chat, CC0-1.0, import date, and that the local copy may change."
              : id === "runtime-engine"
                ? "The Runtime runs deterministic browser-local simulations only; no AI provider or external tool is connected."
                : id === "mock-run"
                  ? "Mock output is predictable simulation, not an AI model response."
                  : id === "dry-run"
                    ? "Dry Run validates and assembles a preview without executing a provider or tool."
                    : id === "live-reserved"
                      ? "Live execution is security-disabled and accepts no API keys."
                      : id === "run-history" || id === "run-details"
                        ? "Run History is browser-local, limited to 50 records, and deletable."
                        : id === "approval-flow"
                          ? "A simulated risky action pauses for fresh explicit approval on every run."
                          : id === "retry-cancellation"
                            ? "Retries are bounded; cancellation is terminal and recorded in the timeline."
                            : id === "runtime-privacy"
                              ? "Do not enter sensitive data. Corrupted storage recovers to a safe default."
                              : id === "planned-tools"
                                ? "Tools are design-time descriptions only: not connected and never executed."
                                : `Practical guidance for ${en}.`,
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
