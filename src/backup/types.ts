export type BackupDomain = "settings" | "courseProgress" | "prompts" | "agents" | "projects" | "knowledge" | "workflows" | "runHistory" | "promptPlayground" | "agentPlayground" | "assistantHistory" | "workspace" | "searchHistory" | "commandHistory";
export interface WorkspaceBackup { schemaVersion: 1; appVersion: string; exportedAt: string; domainVersions: Record<BackupDomain, number>; domains: Partial<Record<BackupDomain, unknown>>; checksum: string }
export type ImportStrategy = "merge" | "replace" | "skip";
export interface ImportPreviewDomain { domain: BackupDomain; incomingCount: number; existingCount: number; conflicts: number; supported: boolean }
export interface WorkspaceImportPreview { valid: boolean; errors: string[]; domains: ImportPreviewDomain[]; backup?: WorkspaceBackup }
export interface WorkspaceImportReport { ok: boolean; imported: BackupDomain[]; skipped: BackupDomain[]; errors: string[]; rolledBack: boolean }

