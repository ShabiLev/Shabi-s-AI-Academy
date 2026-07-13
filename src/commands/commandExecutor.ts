import type { CommandExecutionContext, CommandExecutionResult, WorkspaceCommand } from "./types";
export async function executeCommand(command: WorkspaceCommand, context: CommandExecutionContext): Promise<CommandExecutionResult> {
  if (!command.enabled || command.risk === "high") return { ok: false, commandId: command.id, message: command.disabledReason?.[context.language] ?? "Command unavailable" };
  const action = command.action;
  if (action.type === "navigate") { context.navigate(action.route); return { ok: true, commandId: command.id, message: "navigated", route: action.route }; }
  if (action.type === "switchLanguage") context.setLanguage(context.language === "he" ? "en" : "he");
  if (action.type === "toggleMotion") context.toggleMotion();
  if (action.type === "clearRecents") context.clearRecents();
  if (action.type === "showShortcuts") context.showShortcuts();
  if (action.type === "copyRoute") await context.copyRoute();
  if (action.type === "favoriteCurrent" && !context.favoriteCurrent()) return { ok: false, commandId: command.id, message: "No supported current entity" };
  if (action.type === "exportWorkspace" && !context.exportWorkspace()) return { ok: false, commandId: command.id, message: "Workspace backup unavailable" };
  return { ok: true, commandId: command.id, message: "completed" };
}

