export type RoadmapStatus = "completed" | "inProgress" | "planned";
export interface RoadmapItem { version: string; status: RoadmapStatus; title: { he: string; en: string }; summary: { he: string; en: string } }
export const roadmapItems: readonly RoadmapItem[] = [
  { version: "0.6.1", status: "completed", title: { he: "יסודות האקדמיה", en: "Academy foundation" }, summary: { he: "שיעורים, פרומפטים, סוכנים ופלטפורמת איכות.", en: "Lessons, prompts, agents, and quality platform." } },
  { version: "0.7.0-alpha.1", status: "completed", title: { he: "מנוע Runtime", en: "Runtime Engine" }, summary: { he: "Mock, Dry Run, אישורים, ניסיונות והיסטוריה.", en: "Mock, Dry Run, approvals, retries, and history." } },
  { version: "1.0.0-beta.1", status: "completed", title: { he: "בטא מלאה", en: "Complete beta" }, summary: { he: "תוכן מלא, קטלוגים, Playgrounds, פרויקטים ומאגר ידע.", en: "Full content, catalogs, Playgrounds, Projects, and Knowledge Base." } },
  { version: "1.1.0-beta.1", status: "completed", title: { he: "סביבת עבודה חכמה", en: "AI Workspace and Command Center" }, summary: { he: "חיפוש, פקודות, עוזר מקומי, בונים מתקדמים, תהליכי עבודה, פעילות וגיבוי.", en: "Search, commands, Local Assistant, advanced builders, workflows, activity, and backup." } },
  { version: "1.2.0", status: "planned", title: { he: "שיתוף פעולה מקומי", en: "Local collaboration and orchestration" }, summary: { he: "תכנון תזמור רב-סוכנים, תבניות תהליך ושיתוף מבוקר לפני חיבור ספקים חיים.", en: "Design multi-agent orchestration, workflow templates, and controlled sharing before live providers." } },
  { version: "future", status: "planned", title: { he: "ספקים חיים מאובטחים", en: "Secure live providers" }, summary: { he: "גבול שרת, הסכמה, הגבלות ועלויות.", en: "Server boundary, consent, limits, and cost controls." } },
  { version: "future", status: "planned", title: { he: "MCP ומחברים", en: "MCP and connectors" }, summary: { he: "כלים חיצוניים רק לאחר מודל איומים ואישורים.", en: "External tools only after threat modeling and approvals." } },
] as const;
