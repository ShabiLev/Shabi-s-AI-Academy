import type { Language } from "../i18n/types";
export type AssistantIntent = "findPrompt" | "findAgent" | "findLesson" | "openRoute" | "createPrompt" | "createAgent" | "createProject" | "explainScreen" | "showRecentActivity" | "showProjectContents" | "startMockRun" | "startDryRun" | "openQaReport" | "exportWorkspace" | "showHelp" | "unsupported";
export type AssistantResponseType = "informational" | "searchResults" | "commandSuggestion" | "actionConfirmation" | "navigation" | "entityPreview" | "warning" | "unsupportedRequest";
export type AssistantActionType = "navigate" | "search" | "createDraftPrompt" | "createDraftAgent" | "createProject" | "openPlayground" | "startMockRun" | "startDryRun" | "linkToProject" | "favorite" | "export" | "openHelp";
export type AssistantRisk = "informational" | "low" | "medium" | "high";
export interface AssistantAction { id: string; type: AssistantActionType; title: Record<Language, string>; description: Record<Language, string>; risk: AssistantRisk; confirmationRequired: boolean; requiredContext: string[]; parameters: Record<string, string>; undoSupported: boolean }
export interface AssistantEntity { id: string; type: "prompt" | "agent" | "lesson"; title: string; route: string; summary: string }
export interface AssistantResponse { id: string; intent: AssistantIntent; type: AssistantResponseType; text: Record<Language, string>; entities: AssistantEntity[]; action?: AssistantAction; createdAt: string }
export interface AssistantHistoryEntry { id: string; role: "user" | "assistant"; text: string; createdAt: string; response?: AssistantResponse }
export interface AssistantHistoryState { schemaVersion: 1; appVersion: string; entries: AssistantHistoryEntry[] }
export type AssistantMode = "collapsed" | "compact" | "expanded";

