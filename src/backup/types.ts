export type BackupDomain = "settings" | "courseProgress" | "prompts" | "agents" | "projects" | "knowledge" | "workflows" | "runHistory" | "promptPlayground" | "agentPlayground" | "assistantHistory" | "workspace" | "searchHistory" | "commandHistory" | "missions" | "agentTeams" | "skillMap" | "contextPacks" | "missionAnalytics" | "evaluationRubrics" | "evaluationExperiments" | "evaluationRuns" | "evaluationSuites" | "failureLibrary" | "entityVersions" | "connectedPreviews" | "evaluationEvidence" | "evaluationTraces";
export interface WorkspaceBackup { schemaVersion: 1 | 2; appVersion: string; actorId?: string; exportedAt: string; domainVersions: Record<BackupDomain, number>; domains: Partial<Record<BackupDomain, unknown>>; checksum: string }
export type ImportStrategy = "merge" | "replace" | "skip";
export interface ImportPreviewDomain { domain: BackupDomain; incomingCount: number; existingCount: number; conflicts: number; supported: boolean }
export interface WorkspaceImportPreview { valid: boolean; errors: string[]; domains: ImportPreviewDomain[]; backup?: WorkspaceBackup; sourceActorId?: string; targetActorId?: string; ownershipTransfer?: boolean }
export interface WorkspaceImportReport { ok: boolean; imported: BackupDomain[]; skipped: BackupDomain[]; errors: string[]; rolledBack: boolean }

