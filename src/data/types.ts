export type DataDomain = "progress" | "prompts" | "agents" | "projects" | "knowledge" | "workflows" | "runtime" | "preferences";
export type SyncStatus = "local-only" | "synchronized" | "pending" | "synchronizing" | "offline" | "failed" | "conflict";
export interface DataRecord { id: string; userId?: string; createdAt: string; updatedAt: string; schemaVersion: number; version?: number; [key: string]: unknown }
export interface SyncMutation { id: string; domain: DataDomain; operation: "upsert" | "remove"; recordId: string; payload?: DataRecord; createdAt: string; attempts: number; nextAttemptAt: string }
export interface DataResult<T> { ok: boolean; data?: T; error?: "unavailable" | "offline" | "failed" | "conflict" }
