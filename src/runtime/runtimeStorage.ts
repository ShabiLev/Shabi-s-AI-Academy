import {
  MAX_RUNTIME_RUNS,
  RUNTIME_SCHEMA_VERSION,
  RUNTIME_STORAGE_KEY,
  RUNTIME_VERSION,
  type RuntimeHistoryRecord,
} from "./types";

export interface RuntimeStorage {
  load(): { records: RuntimeHistoryRecord[]; warning?: string };
  save(records: readonly RuntimeHistoryRecord[]): {
    ok: boolean;
    warning?: string;
  };
}
export function isRuntimeHistoryRecord(
  value: unknown,
): value is RuntimeHistoryRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<RuntimeHistoryRecord>;
  return (
    item.schemaVersion === RUNTIME_SCHEMA_VERSION &&
    item.runtimeVersion === RUNTIME_VERSION &&
    typeof item.id === "string" &&
    typeof item.createdAt === "string" &&
    Boolean(item.request && item.result)
  );
}
export function parseRuntimeHistory(raw: string | null) {
  if (!raw) return { records: [] as RuntimeHistoryRecord[] };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object")
      return {
        records: [] as RuntimeHistoryRecord[],
        warning: "Runtime history was corrupted and was not loaded.",
      };
    const payload = value as {
      schemaVersion?: unknown;
      runtimeVersion?: unknown;
      records?: unknown;
    };
    if (
      payload.schemaVersion !== RUNTIME_SCHEMA_VERSION ||
      payload.runtimeVersion !== RUNTIME_VERSION
    )
      return {
        records: [] as RuntimeHistoryRecord[],
        warning:
          "Runtime history uses an unsupported schema and was not loaded.",
      };
    if (
      !Array.isArray(payload.records) ||
      !payload.records.every(isRuntimeHistoryRecord)
    )
      return {
        records: [] as RuntimeHistoryRecord[],
        warning: "Runtime history was corrupted and was not loaded.",
      };
    return { records: payload.records.slice(0, MAX_RUNTIME_RUNS) };
  } catch {
    return {
      records: [] as RuntimeHistoryRecord[],
      warning: "Runtime history was corrupted and was not loaded.",
    };
  }
}
export class BrowserRuntimeStorage implements RuntimeStorage {
  constructor(private readonly storage: Storage = window.localStorage) {}
  load() {
    try {
      return parseRuntimeHistory(this.storage.getItem(RUNTIME_STORAGE_KEY));
    } catch {
      return { records: [], warning: "Runtime storage is unavailable." };
    }
  }
  save(records: readonly RuntimeHistoryRecord[]) {
    try {
      const bounded = records.slice(0, MAX_RUNTIME_RUNS);
      this.storage.setItem(
        RUNTIME_STORAGE_KEY,
        JSON.stringify({
          schemaVersion: RUNTIME_SCHEMA_VERSION,
          runtimeVersion: RUNTIME_VERSION,
          records: bounded,
        }),
      );
      return { ok: true };
    } catch {
      return { ok: false, warning: "Runtime storage is unavailable." };
    }
  }
}
