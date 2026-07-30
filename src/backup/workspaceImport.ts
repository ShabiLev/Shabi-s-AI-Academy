import { BACKUP_MAX_BYTES, checksumPayload, containsSecretLikeKey, resolveBackupDomainKeys } from "./workspaceBackup";
import type { BackupDomain, ImportPreviewDomain, ImportStrategy, WorkspaceBackup, WorkspaceImportPreview, WorkspaceImportReport } from "./types";

const dangerous = (value: unknown, depth = 0): boolean => {
  if (depth > 30) return true;
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => dangerous(item, depth + 1));
  const record = value as Record<string, unknown>;
  return ["__proto__", "prototype", "constructor"].some((key) => Object.prototype.hasOwnProperty.call(record, key))
    || Object.values(record).some((item) => dangerous(item, depth + 1));
};
const count = (value: unknown): number => Array.isArray(value) ? value.length : value && typeof value === "object" ? (Object.values(value as Record<string,unknown>).find(Array.isArray) as unknown[] | undefined)?.length ?? Object.keys(value as object).length : value === undefined ? 0 : 1;
const ids = (value: unknown): Set<string> => {
  const array = Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value as Record<string,unknown>).find(Array.isArray) as unknown[] | undefined : undefined;
  return new Set((array ?? []).flatMap((item) => item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" ? [(item as { id: string }).id] : []));
};
function envelopeWithoutChecksum(backup: WorkspaceBackup) {
  return { schemaVersion: backup.schemaVersion, appVersion: backup.appVersion, exportedAt: backup.exportedAt, domainVersions: backup.domainVersions, domains: backup.domains };
}
function validateBackup(backup: WorkspaceBackup | undefined, storage: Pick<Storage, "getItem">): string[] {
  const errors: string[] = [];
  if (!backup || backup.schemaVersion !== 1 || !backup.domains || typeof backup.domains !== "object") return ["invalid-schema"];
  if (containsSecretLikeKey(backup?.domains)) errors.push("secret-shaped-key");
  if (dangerous(backup?.domains)) errors.push("executable-or-prototype-content");
  if (backup.checksum !== checksumPayload(envelopeWithoutChecksum(backup))) errors.push("checksum-mismatch");
  const supported = resolveBackupDomainKeys(storage);
  if (Object.keys(backup?.domains ?? {}).some((domain) => !(domain in supported))) errors.push("unsupported-domain");
  return errors;
}
export function previewWorkspaceImport(raw: string, storage: Pick<Storage,"getItem"> = localStorage): WorkspaceImportPreview {
  if (new Blob([raw]).size > BACKUP_MAX_BYTES) return { valid: false, errors: ["oversized-import"], domains: [] };
  try {
    const parsed = JSON.parse(raw) as WorkspaceBackup;
    const errors = validateBackup(parsed, storage);
    const backupDomainKeys = resolveBackupDomainKeys(storage);
    const domains: ImportPreviewDomain[] = Object.entries(parsed?.domains ?? {}).map(([name, incoming]) => {
      const domain = name as BackupDomain;
      const supported = domain in backupDomainKeys;
      let existing: unknown;
      if (supported) {
        const rawExisting = storage.getItem(backupDomainKeys[domain]);
        try { existing = domain === "settings" ? rawExisting : JSON.parse(rawExisting ?? "null"); } catch { existing = undefined; }
      }
      const incomingIds = ids(incoming);
      const existingIds = ids(existing);
      return { domain, incomingCount: count(incoming), existingCount: count(existing), conflicts: [...incomingIds].filter((id) => existingIds.has(id)).length, supported };
    });
    return { valid: errors.length === 0 && domains.every((domain) => domain.supported), errors, domains, backup: parsed };
  } catch {
    return { valid: false, errors: ["malformed-json"], domains: [] };
  }
}
function mergeValues(existing: unknown, incoming: unknown, preserveExisting = false): unknown {
  if (!existing || typeof existing !== "object" || !incoming || typeof incoming !== "object" || Array.isArray(existing) || Array.isArray(incoming)) return incoming;
  const left = existing as Record<string,unknown>;
  const right = incoming as Record<string,unknown>;
  const result = { ...left, ...right };
  for (const key of Object.keys(right)) {
    if (!Array.isArray(left[key]) || !Array.isArray(right[key])) continue;
    const map = new Map<string, unknown>();
    const ordered = preserveExisting ? [...right[key] as unknown[], ...left[key] as unknown[]] : [...left[key] as unknown[], ...right[key] as unknown[]];
    for (const item of ordered) {
      const id = item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" ? (item as { id: string }).id : JSON.stringify(item);
      map.set(id, item);
    }
    result[key] = [...map.values()];
  }
  return result;
}
const immutableDomains = new Set<BackupDomain>(["evaluationRuns", "evaluationSuites", "entityVersions"]);
export function applyWorkspaceImport(preview: WorkspaceImportPreview, strategies: Partial<Record<BackupDomain,ImportStrategy>>, storage: Pick<Storage,"getItem"|"setItem"|"removeItem"> = localStorage): WorkspaceImportReport {
  const validationErrors = validateBackup(preview.backup, storage);
  if (!preview.valid || !preview.backup || validationErrors.length > 0) return { ok: false, imported: [], skipped: [], errors: [...new Set([...preview.errors, ...validationErrors])], rolledBack: false };
  const backupDomainKeys = resolveBackupDomainKeys(storage);
  const snapshots = new Map<string,string|null>();
  const imported: BackupDomain[] = [];
  const skipped: BackupDomain[] = [];
  try {
    for (const [domain, incoming] of Object.entries(preview.backup.domains) as Array<[BackupDomain,unknown]>) {
      const strategy = strategies[domain] ?? "merge";
      const key = backupDomainKeys[domain];
      if (!key || strategy === "skip") { skipped.push(domain); continue; }
      snapshots.set(key, storage.getItem(key));
      let value = incoming;
      if ((strategy === "merge" || immutableDomains.has(domain)) && domain !== "settings") {
        let existing: unknown;
        try { existing = JSON.parse(storage.getItem(key) ?? "null"); } catch { existing = undefined; }
        value = mergeValues(existing, incoming, immutableDomains.has(domain));
      }
      storage.setItem(key, domain === "settings" ? String(value) : JSON.stringify(value));
      imported.push(domain);
    }
    return { ok: true, imported, skipped, errors: [], rolledBack: false };
  } catch {
    for (const [key, value] of snapshots) {
      try { if (value === null) storage.removeItem(key); else storage.setItem(key, value); } catch { /* best effort after a failed transaction */ }
    }
    return { ok: false, imported: [], skipped: [], errors: ["write-failed"], rolledBack: true };
  }
}
