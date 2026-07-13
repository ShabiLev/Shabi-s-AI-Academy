import type { Language } from "../i18n/types";
export type CommandCategory = "navigation" | "creation" | "action" | "context";
export type CommandRisk = "informational" | "low" | "medium" | "high";
export type CommandAction =
  | { type: "navigate"; route: string }
  | { type: "switchLanguage" }
  | { type: "toggleMotion" }
  | { type: "clearRecents" }
  | { type: "showShortcuts" }
  | { type: "copyRoute" }
  | { type: "favoriteCurrent" }
  | { type: "exportWorkspace" };
export interface WorkspaceCommand {
  id: string; category: CommandCategory; title: Record<Language, string>;
  description: Record<Language, string>; aliases: readonly string[]; action: CommandAction;
  risk: CommandRisk; confirmationRequired: boolean; enabled: boolean; disabledReason?: Record<Language, string>;
}
export interface CommandRegistryContext { route: string; currentEntity: "prompt" | "agent" | "other"; backupAvailable: boolean }
export interface CommandExecutionContext {
  navigate: (route: string) => void; language: Language; setLanguage: (language: Language) => void;
  toggleMotion: () => void; clearRecents: () => void; showShortcuts: () => void;
  copyRoute: () => Promise<void>; favoriteCurrent: () => boolean; exportWorkspace: () => boolean;
}
export interface CommandExecutionResult { ok: boolean; commandId: string; message: string; route?: string }

