import { classifyIntent } from "./intentClassifier";
import { createAssistantAction } from "./assistantActions";
import { explainRoute } from "./assistantContext";
import type { AssistantEntity, AssistantResponse } from "./types";
export interface AssistantWorkspace { route: string; entities: AssistantEntity[]; now?: () => string; nextId?: () => string }
const responseText = (he: string, en: string) => ({ he, en });
function queryTerms(input: string) { return input.toLocaleLowerCase().split(/\s+/).filter((word) => word.length > 2 && !["find", "search", "prompt", "agent", "lesson", "מצא", "חפש", "פרומפט", "סוכן", "שיעור"].includes(word)); }
export function respondToAssistant(input: string, workspace: AssistantWorkspace): AssistantResponse {
  const intent = classifyIntent(input); const now = workspace.now?.() ?? new Date().toISOString(); const id = workspace.nextId?.() ?? crypto.randomUUID(); const base = { id, intent, entities: [], createdAt: now };
  if (intent === "explainScreen") return { ...base, type: "informational", text: explainRoute(workspace.route) };
  if (["findPrompt", "findAgent", "findLesson"].includes(intent)) { const type = intent === "findPrompt" ? "prompt" : intent === "findAgent" ? "agent" : "lesson"; const terms = queryTerms(input); const entities = workspace.entities.filter((entity) => entity.type === type && (!terms.length || terms.some((term) => `${entity.title} ${entity.summary}`.toLocaleLowerCase().includes(term)))).slice(0, 5); return { ...base, type: "searchResults", entities, text: entities.length ? responseText("נמצאו תוצאות מקומיות מתאימות.", "I found matching local workspace results.") : responseText("לא נמצאה התאמה מקומית. נסה מונח אחר.", "No local match was found. Try another term.") }; }
  if (intent === "createProject") { const name = input.replace(/create|new|project|צור|יצירת|פרויקט/giu, " ").replace(/\s+/g, " ").trim().slice(0, 120) || "AI Workspace Project"; return { ...base, type: "actionConfirmation", text: responseText(`ליצור פרויקט מקומי בשם „${name}”?`, `Create a local project named “${name}”?`), action: createAssistantAction("createProject", { name }) }; }
  const actions = { createPrompt: ["createDraftPrompt", "/prompts/new"], createAgent: ["createDraftAgent", "/agents/new"], startMockRun: ["startMockRun", ""], startDryRun: ["startDryRun", ""], openQaReport: ["navigate", "/qa"], exportWorkspace: ["export", ""], showHelp: ["openHelp", "/how-to"], openRoute: ["search", input] } as const;
  const mapped = actions[intent as keyof typeof actions]; if (mapped) return { ...base, type: mapped[0] === "export" ? "warning" : "commandSuggestion", text: mapped[0] === "export" ? responseText("ייצוא סביבת העבודה זמין דרך כלי הגיבוי המקומי כאשר הוא מופעל.", "Workspace export is available through the local backup tool when enabled.") : responseText("הכנתי פעולה בטוחה לבחירתך.", "I prepared a safe action for you."), action: createAssistantAction(mapped[0], mapped[1].startsWith("/") ? { route: mapped[1] } : { query: mapped[1] }) };
  if (intent === "showRecentActivity" || intent === "showProjectContents") return { ...base, type: "informational", text: responseText("המידע מוצג מתוך נתוני סביבת העבודה המקומית בלבד.", "This information comes only from local workspace data.") };
  return { ...base, type: "unsupportedRequest", text: responseText("הבקשה דורשת ספק AI פעיל או יכולת שאינה מחוברת.", "This request requires a live AI provider or a capability that is not connected.") };
}

