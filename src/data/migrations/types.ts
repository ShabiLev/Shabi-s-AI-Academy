import type { DataDomain, DataRecord } from "../types";
export type MigrationDomain = "progress"|"prompts"|"agents"|"projects"|"knowledge"|"workflows"|"runs"|"favorites"|"recentItems"|"settings"|"analytics";
export type MigrationStrategy = "copy"|"merge"|"replace"|"keep-local"|"cancel";
export type ConflictChoice = "keep-local"|"keep-cloud"|"keep-both"|"review-later";
export interface LocalDomainScan { domain: MigrationDomain; dataDomain?: DataDomain; storageKey: string; count: number; valid: boolean; error?: string; records: DataRecord[] }
export interface MigrationConflict { domain: MigrationDomain; recordId: string; localHash: string; cloudHash: string; localUpdatedAt: string; cloudUpdatedAt: string; localVersion: number; cloudVersion: number; choice: ConflictChoice }
export interface MigrationPreview { scans: LocalDomainScan[]; selected: MigrationDomain[]; conflicts: MigrationConflict[]; backupJson: string; localCount: number; cloudCount: number; writes: number; deletes: number }
export interface MigrationReport { ok: boolean; migrated: number; skipped: number; conflictsPending: number; errors: string[]; localPreserved: true; completedAt: string }
