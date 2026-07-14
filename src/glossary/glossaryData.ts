import type { GlossaryTerm } from "./types";
const t = (he: string, en: string) => ({ he, en });
type TermSeed = [string, string, string, string, string, string?];
const terms: TermSeed[] = [
  ["ai", "AI", "בינה מלאכותית", "Systems that perform tasks associated with human intelligence.", "מערכות המבצעות משימות המקושרות לאינטליגנציה אנושית.", "The Local Assistant uses structured guidance, not generative AI."],
  ["llm", "LLM", "מודל שפה גדול", "A model trained to predict and generate language.", "מודל שאומן לחזות וליצור שפה.", "A provider may expose an LLM through an API."],
  ["prompt", "Prompt", "פרומפט", "Instructions and context given to a model or simulation.", "הוראות והקשר הניתנים למודל או לסימולציה.", "A reusable review checklist is a prompt."],
  ["system-prompt", "System Prompt", "פרומפט מערכת", "High-priority instructions that define behavior and boundaries.", "הוראות בעדיפות גבוהה המגדירות התנהגות וגבולות.", "An agent role can begin with a system prompt."],
  ["agent", "Agent", "סוכן", "Instructions, inputs, planned tools, and completion criteria combined for a task.", "שילוב הוראות, קלטים, כלים מתוכננים וקריטריוני השלמה למשימה.", "A release analyst agent checks a QA checklist."],
  ["workflow", "Workflow", "תהליך עבודה", "An ordered sequence of steps with inputs and outcomes.", "רצף מסודר של שלבים עם קלטים ותוצאות.", "Draft, review, and approve can form a workflow."],
  ["runtime", "Runtime", "מנוע הרצה", "The layer that validates and executes supported run modes.", "השכבה שמאמתת ומפעילה מצבי הרצה נתמכים.", "The Academy runtime records a local run timeline."],
  ["mock-run", "Mock Run", "הרצת דמה", "A deterministic simulation with predefined output.", "סימולציה דטרמיניסטית עם פלט מוגדר מראש.", "Preview an agent without contacting a provider."],
  ["dry-run", "Dry Run", "הרצה יבשה", "Validation and preview without performing live external actions.", "אימות ותצוגה מקדימה ללא פעולות חיצוניות חיות.", "Check workflow inputs before execution."],
  ["live-run", "Live Run", "הרצה חיה", "Execution that can contact a connected provider or tool.", "הרצה שעשויה ליצור קשר עם ספק או כלי מחובר.", "Live Run remains unavailable until a secure connection exists."],
  ["tool", "Tool", "כלי", "A declared capability an agent may request to use.", "יכולת מוצהרת שסוכן עשוי לבקש להשתמש בה.", "Search or calendar access can be tools."],
  ["memory", "Memory", "זיכרון", "Saved context used across interactions.", "הקשר שמור המשמש בין אינטראקציות.", "A preference can be remembered locally."],
  ["knowledge-base", "Knowledge Base", "מאגר ידע", "A curated collection of documents used as working context.", "אוסף מסמכים מאורגן המשמש כהקשר לעבודה.", "Store project notes in the Knowledge Base."],
  ["rag", "RAG", "אחזור מועשר", "Retrieving relevant sources before generating an answer.", "אחזור מקורות רלוונטיים לפני יצירת תשובה.", "Find a policy passage before answering."],
  ["mcp", "MCP", "פרוטוקול הקשר למודלים", "A protocol for exposing tools and context to AI applications.", "פרוטוקול לחשיפת כלים והקשר ליישומי AI.", "An MCP server can describe available resources."],
  ["token", "Token", "טוקן", "A unit of text processed by a language model.", "יחידת טקסט המעובדת בידי מודל שפה.", "A sentence is split into several tokens."],
  ["context-window", "Context Window", "חלון הקשר", "The maximum amount of information a model can consider at once.", "כמות המידע המרבית שמודל יכול לשקול בבת אחת.", "Long documents may exceed a context window."],
  ["human-approval", "Human Approval", "אישור אנושי", "An explicit decision required before a sensitive action continues.", "החלטה מפורשת הנדרשת לפני המשך פעולה רגישה.", "A simulated risky tool pauses for approval."],
  ["validation", "Validation", "אימות", "Checking data or behavior against declared rules.", "בדיקת נתונים או התנהגות מול כללים מוגדרים.", "A workflow validates required inputs."],
  ["retry", "Retry", "ניסיון חוזר", "A bounded repeat after a recoverable failure.", "חזרה מוגבלת לאחר כשל שניתן להתאושש ממנו.", "A run may retry once after a temporary error."],
  ["provider", "Provider", "ספק", "A service that supplies a model or external capability.", "שירות המספק מודל או יכולת חיצונית.", "Supabase provides optional account services."],
  ["local-storage", "Local Storage", "אחסון מקומי", "Browser storage that remains on the current device and profile.", "אחסון בדפדפן שנשאר במכשיר ובפרופיל הנוכחיים.", "Guest projects are saved in this browser."],
  ["cloud-sync", "Cloud Sync", "סנכרון ענן", "Copying eligible user data between local storage and an account backend.", "העתקת נתוני משתמש מתאימים בין אחסון מקומי לחשבון בענן.", "Cloud sync is optional and requires sign-in."],
];

export const glossaryTerms: GlossaryTerm[] = terms.map(([id, en, he, definitionEn, definitionHe, exampleEn]) => ({
  id, name: t(he, en), definition: t(definitionHe, definitionEn),
  example: t("דוגמה: השתמשו במושג במשימה מודרכת באקדמיה.", `Example: ${exampleEn ?? "Use the concept in a guided Academy task."}`),
  relatedLesson: "/lessons", relatedFeature: id.includes("run") || id === "runtime" || id === "retry" ? "/runs" : id === "agent" || id === "tool" ? "/agents" : id === "prompt" || id === "system-prompt" ? "/prompts" : "/help",
  availability: ["live-run", "mcp", "rag", "cloud-sync"].includes(id) ? t("הזמינות תלויה בחיבור מאובטח; אין להסיק שחיבור חי פעיל.", "Availability depends on a secure connection; no live connection is implied.") : undefined,
}));
export function getGlossaryTerm(id: string) { return glossaryTerms.find((term) => term.id === id); }
