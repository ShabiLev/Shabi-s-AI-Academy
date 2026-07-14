const KEY = "shabis-ai-academy:commands:v1"; const MAX = 30;
export interface CommandHistory { schemaVersion: 1; appVersion: string; commandIds: string[] }
export function parseCommandHistory(value: unknown): CommandHistory { const record = value && typeof value === "object" ? value as Record<string, unknown> : {}; const ids = Array.isArray(record.commandIds) ? [...new Set(record.commandIds.filter((id): id is string => typeof id === "string" && id.length <= 120))].slice(0, MAX) : []; return { schemaVersion: 1, appVersion: typeof record.appVersion === "string" ? record.appVersion : "1.3.0-beta.1", commandIds: ids }; }
export function loadCommandHistory(storage: Pick<Storage, "getItem"> = window.localStorage): CommandHistory { try { return parseCommandHistory(JSON.parse(storage.getItem(KEY) ?? "null")); } catch { return parseCommandHistory(null); } }
export function saveCommandHistory(value: CommandHistory, storage: Pick<Storage, "setItem"> = window.localStorage): void { try { storage.setItem(KEY, JSON.stringify(parseCommandHistory(value))); } catch { /* optional */ } }
export function rememberCommand(value: CommandHistory, id: string): CommandHistory { return { ...value, commandIds: [id, ...value.commandIds.filter((item) => item !== id)].slice(0, MAX) }; }

