import type { LocalizedText } from "../../course/types";
import type { PackedPrompt, PromptPackDefinition } from "./types";

const t = (he: string, en: string): LocalizedText => ({ he, en });

export const promptPacks: readonly PromptPackDefinition[] = [
  { id: "qa-testing", title: t("QA ובדיקות", "QA and Testing"), description: t("תכנון, ביצוע וסקירת בדיקות", "Plan, execute, and review testing"), count: 40, category: "qa" },
  { id: "sql-data", title: t("SQL ונתונים", "SQL and Data"), description: t("שאילתות, איכות נתונים וניתוח", "Queries, data quality, and analysis"), count: 30, category: "sql" },
  { id: "jira-release", title: t("Jira ושחרורים", "Jira and Release"), description: t("סיכונים, מוכנות ותיעוד שחרור", "Risk, readiness, and release documentation"), count: 25, category: "jira" },
  { id: "product", title: t("ניהול מוצר", "Product Management"), description: t("דרישות, ערך ותכנון מוצר", "Requirements, value, and product planning"), count: 20, category: "product" },
  { id: "development", title: t("פיתוח וסקירת קוד", "Development and Code Review"), description: t("קוד, ארכיטקטורה ותחזוקה", "Code, architecture, and maintainability"), count: 30, category: "development" },
  { id: "prompt-engineering", title: t("הנדסת פרומפטים", "Prompt Engineering"), description: t("כתיבה, שיפור והערכת פרומפטים", "Write, improve, and evaluate prompts"), count: 25, category: "learning" },
  { id: "agent-design", title: t("תכנון סוכנים", "Agent Design"), description: t("מטרות, כלים, זיכרון ובקרות", "Goals, tools, memory, and controls"), count: 25, category: "development" },
  { id: "communication", title: t("תקשורת מקצועית", "Professional Communication"), description: t("עדכונים, הודעות וסיכומים", "Updates, messages, and summaries"), count: 20, category: "customer" },
  { id: "learning-research", title: t("למידה ומחקר", "Learning and Research"), description: t("הסברים, תוכניות למידה ואימות מקורות", "Explanations, learning plans, and source verification"), count: 15, category: "learning" },
  { id: "automation", title: t("אוטומציה ותהליכים", "Automation and Workflows"), description: t("מיפוי תהליכים ואוטומציה בטוחה", "Workflow mapping and safe automation"), count: 10, category: "general" },
  { id: "security-risk", title: t("אבטחה וסקירת סיכונים", "Security and Risk Review"), description: t("מודלי איומים ובקרות", "Threat models and controls"), count: 10, category: "general" },
] as const;

const buildPrompt = (pack: PromptPackDefinition, index: number): PackedPrompt => {
  const number = index + 1;
  const topicHe = `${pack.title.he} — תרחיש ${number}`;
  const topicEn = `${pack.title.en} — Scenario ${number}`;
  return {
    id: `${pack.id}-${String(number).padStart(2, "0")}`,
    packId: pack.id,
    title: t(topicHe, topicEn),
    description: t(`נקודת פתיחה בדוקה לעבודה בנושא ${topicHe}.`, `A reviewed starting point for ${topicEn}.`),
    contentLanguage: number % 3 === 0 ? "mixed" : number % 2 === 0 ? "en" : "he",
    category: pack.category,
    tags: [pack.id, `scenario-${number}`, "reviewed"],
    difficulty: number % 5 === 0 ? "advanced" : number % 2 === 0 ? "intermediate" : "beginner",
    role: t(`פעלו כמומחים בתחום ${pack.title.he}.`, `Act as a ${pack.title.en} specialist.`),
    task: t(`נתחו את {{input}} עבור ${topicHe}, ציינו ממצאים ושאלות פתוחות.`, `Analyze {{input}} for ${topicEn}; identify findings and open questions.`),
    context: t("השתמשו רק בעובדות שסופקו וסמנו מידע חסר.", "Use only supplied facts and mark missing information."),
    constraints: t("אין להמציא מצב, הרשאה, מקור או תוצאה. אין לבצע פעולה חיצונית.", "Do not invent state, permission, sources, or results. Perform no external action."),
    outputFormat: t("החזירו סיכום, ממצאים לפי עדיפות, ראיות, שאלות וצעדי אימות.", "Return a summary, prioritized findings, evidence, questions, and verification steps."),
    examples: t(`קלט לדוגמה: תיאור קצר עבור תרחיש ${number}.`, `Example input: a short description for scenario ${number}.`),
    variables: ["input"],
    expectedOutput: t("תוצר מובנה שניתן לסקור ולאמת.", "A structured, reviewable, verifiable deliverable."),
    usageNotes: t("התאימו את ההקשר והקריטריונים לפני שימוש.", "Adapt context and criteria before use."),
    safetyNotes: t("אין להזין סודות או מידע אישי. יש לאמת לפני פעולה.", "Do not enter secrets or personal data. Verify before acting."),
    source: { name: "Shabi's AI Academy", version: 1 },
  };
};

export const packedPrompts: readonly PackedPrompt[] = Object.freeze(
  promptPacks.flatMap((pack) => Array.from({ length: pack.count }, (_, index) => buildPrompt(pack, index))),
);

export const getPromptPack = (packId: string) => promptPacks.find((pack) => pack.id === packId);
export const getPackedPrompt = (promptId: string) => packedPrompts.find((prompt) => prompt.id === promptId);
