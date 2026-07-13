const KEY = "shabis-ai-academy:search:v1";
const MAX_QUERIES = 30;
const MAX_RECENTS = 80;
export interface SearchStorageState { schemaVersion: 1; appVersion: string; queries: string[]; recentIds: string[] }
const empty = (): SearchStorageState => ({ schemaVersion: 1, appVersion: "1.1.0-beta.1", queries: [], recentIds: [] });
const strings = (value: unknown, max: number) => Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.length <= 300))].slice(0, max) : [];
export function parseSearchStorage(value: unknown): SearchStorageState {
  if (!value || typeof value !== "object") return empty();
  const record = value as Record<string, unknown>;
  return { schemaVersion: 1, appVersion: typeof record.appVersion === "string" ? record.appVersion : "1.1.0-beta.1", queries: strings(record.queries, MAX_QUERIES), recentIds: strings(record.recentIds, MAX_RECENTS) };
}
export function loadSearchStorage(storage: Pick<Storage, "getItem"> = window.localStorage): SearchStorageState { try { return parseSearchStorage(JSON.parse(storage.getItem(KEY) ?? "null")); } catch { return empty(); } }
export function saveSearchStorage(state: SearchStorageState, storage: Pick<Storage, "setItem"> = window.localStorage): void { try { storage.setItem(KEY, JSON.stringify(parseSearchStorage(state))); } catch { /* Search history is optional. */ } }
export function rememberSearch(state: SearchStorageState, query: string): SearchStorageState { const value = query.trim().slice(0, 300); return value ? { ...state, queries: [value, ...state.queries.filter((item) => item !== value)].slice(0, MAX_QUERIES) } : state; }
export function rememberSearchResult(state: SearchStorageState, id: string): SearchStorageState { return { ...state, recentIds: [id, ...state.recentIds.filter((item) => item !== id)].slice(0, MAX_RECENTS) }; }
export function clearSearchStorage(storage: Pick<Storage, "removeItem"> = window.localStorage): void { try { storage.removeItem(KEY); } catch { /* optional */ } }
export const searchStorageKey = KEY;

