export type WorkspaceEntityType = "lesson" | "prompt" | "agent" | "project" | "document" | "run" | "workflow" | "mission" | "team" | "evaluation" | "suite" | "failureCase" | "help" | "documentation";
export type ActivityKind = "opened" | "edited" | "run" | "searched" | "created" | "imported" | "completed";
export interface EntityActivity { id: string; entityId: string; entityType: WorkspaceEntityType; kind: ActivityKind; title: string; route: string; timestamp: string }
export interface EntityPreference { entityId: string; entityType: WorkspaceEntityType; favorite: boolean; pinned: boolean; updatedAt: string }
export type NotificationType = "success" | "warning" | "information" | "actionRequired" | "release" | "quality" | "storage";
export interface WorkspaceNotification { id: string; type: NotificationType; title: { he: string; en: string }; message: { he: string; en: string }; createdAt: string; read: boolean; actionRoute?: string }
export const ANALYTICS_EVENT_TYPES = ["routeViewed", "lessonOpened", "lessonCompleted", "promptCreated", "promptImported", "promptRun", "agentCreated", "agentImported", "agentRun", "projectCreated", "documentAdded", "workflowRun", "searchPerformed", "commandExecuted", "evaluation_created", "evaluation_started", "evaluation_paused", "evaluation_completed", "evaluation_blocked", "rubric_created", "rubric_cloned", "regression_detected", "failure_case_created", "agent_version_created", "prompt_version_created", "suite_started", "suite_completed", "codex_export_generated", "connected_preview_created"] as const;
export type AnalyticsEventType = typeof ANALYTICS_EVENT_TYPES[number];
export interface AnalyticsEvent { id: string; type: AnalyticsEventType; timestamp: string; category?: string; quality?: number }
export interface WorkspaceState { schemaVersion: 1; appVersion: string; analyticsEnabled: boolean; activities: EntityActivity[]; preferences: EntityPreference[]; notifications: WorkspaceNotification[]; analytics: AnalyticsEvent[] }

