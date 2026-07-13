export type RoadmapStatus = "completed" | "inProgress" | "planned";
export interface RoadmapItem { version: string; status: RoadmapStatus; title: { he: string; en: string }; summary: { he: string; en: string } }
export const roadmapItems: readonly RoadmapItem[] = [
  { version: "0.6.1", status: "completed", title: { he: "יסודות האקדמיה", en: "Academy foundation" }, summary: { he: "שיעורים, פרומפטים, סוכנים ופלטפורמת איכות.", en: "Lessons, prompts, agents, and quality platform." } },
  { version: "0.7.0-alpha.1", status: "completed", title: { he: "מנוע Runtime", en: "Runtime Engine" }, summary: { he: "Mock, Dry Run, אישורים, ניסיונות והיסטוריה.", en: "Mock, Dry Run, approvals, retries, and history." } },
  { version: "1.0.0-beta.1", status: "completed", title: { he: "בטא מלאה", en: "Complete beta" }, summary: { he: "תוכן מלא, קטלוגים, Playgrounds, פרויקטים ומאגר ידע.", en: "Full content, catalogs, Playgrounds, Projects, and Knowledge Base." } },
  { version: "future", status: "planned", title: { he: "ספקים חיים מאובטחים", en: "Secure live providers" }, summary: { he: "גבול שרת, הסכמה, הגבלות ועלויות.", en: "Server boundary, consent, limits, and cost controls." } },
  { version: "future", status: "planned", title: { he: "MCP ומחברים", en: "MCP and connectors" }, summary: { he: "כלים חיצוניים רק לאחר מודל איומים ואישורים.", en: "External tools only after threat modeling and approvals." } },
] as const;
