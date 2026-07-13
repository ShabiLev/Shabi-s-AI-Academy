import type { AssistantAction, AssistantActionType } from "./types";
const text = (he: string, en: string) => ({ he, en });
export function createAssistantAction(type: AssistantActionType, parameters: Record<string, string> = {}): AssistantAction {
  const medium = ["createProject", "linkToProject", "export"].includes(type); const high = false;
  return { id: `assistant:${type}:${Object.values(parameters).join(":") || "default"}`, type, title: text(type === "createProject" ? "יצירת פרויקט מקומי" : "ביצוע פעולה", type === "createProject" ? "Create local project" : "Run action"), description: text("הפעולה מתבצעת בדפדפן בלבד.", "This action runs in the browser only."), risk: high ? "high" : medium ? "medium" : "low", confirmationRequired: medium, requiredContext: [], parameters, undoSupported: type === "favorite" || type === "linkToProject" };
}
export function validateAssistantAction(action: AssistantAction): string[] { const errors: string[] = []; if (action.risk === "high") errors.push("high-risk-unsupported"); if (action.type === "navigate" && !action.parameters.route?.startsWith("/")) errors.push("invalid-route"); if (action.type === "createProject" && (!action.parameters.name || action.parameters.name.length > 120)) errors.push("invalid-project-name"); return errors; }

