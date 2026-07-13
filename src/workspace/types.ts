export type WorkspaceEntityType = "lesson" | "prompt" | "agent" | "project" | "document" | "run" | "workflow" | "help" | "documentation";
export type ActivityKind = "opened" | "edited" | "run" | "searched" | "created" | "imported" | "completed";
export interface EntityActivity { id: string; entityId: string; entityType: WorkspaceEntityType; kind: ActivityKind; title: string; route: string; timestamp: string }
export interface EntityPreference { entityId: string; entityType: WorkspaceEntityType; favorite: boolean; pinned: boolean; updatedAt: string }
export type NotificationType = "success" | "warning" | "information" | "actionRequired" | "release" | "quality" | "storage";
export interface WorkspaceNotification { id: string; type: NotificationType; title: { he: string; en: string }; message: { he: string; en: string }; createdAt: string; read: boolean; actionRoute?: string }
export type AnalyticsEventType = "routeViewed" | "lessonOpened" | "lessonCompleted" | "promptCreated" | "promptImported" | "promptRun" | "agentCreated" | "agentImported" | "agentRun" | "projectCreated" | "documentAdded" | "workflowRun" | "searchPerformed" | "commandExecuted";
export interface AnalyticsEvent { id: string; type: AnalyticsEventType; timestamp: string; category?: string; quality?: number }
export interface WorkspaceState { schemaVersion: 1; appVersion: string; analyticsEnabled: boolean; activities: EntityActivity[]; preferences: EntityPreference[]; notifications: WorkspaceNotification[]; analytics: AnalyticsEvent[] }

