import { parseRadarRecord, type RadarRecord } from "./records";

const FAVORITES_KEY = "shabis-ai-academy:radar-favorites:v1";
const MAX_FAVORITES = 500;
const HISTORY_KEY = "shabis-ai-academy:radar-history:v1";
const MAX_HISTORY = 250;

export function parseRadarFavorites(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && /^[a-z0-9][a-z0-9._:-]{1,119}$/i.test(item)))].slice(0, MAX_FAVORITES);
}

export function loadRadarFavorites(storage: Pick<Storage, "getItem"> = localStorage): string[] {
  try { return parseRadarFavorites(JSON.parse(storage.getItem(FAVORITES_KEY) ?? "[]")); }
  catch { return []; }
}

export function saveRadarFavorites(ids: readonly string[], storage: Pick<Storage, "setItem"> = localStorage): boolean {
  try { storage.setItem(FAVORITES_KEY, JSON.stringify(parseRadarFavorites(ids))); return true; }
  catch { return false; }
}

export function toggleRadarFavorite(ids: readonly string[], id: string): string[] {
  const current = new Set(parseRadarFavorites(ids));
  if (current.has(id)) current.delete(id); else current.add(id);
  return [...current].slice(0, MAX_FAVORITES);
}

export function loadRadarHistory(storage: Pick<Storage, "getItem"> = localStorage): RadarRecord[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(HISTORY_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.slice(0, MAX_HISTORY).map(parseRadarRecord).filter((record): record is RadarRecord => Boolean(record));
  } catch { return []; }
}

export function saveRadarHistory(records: readonly RadarRecord[], storage: Pick<Storage, "setItem"> = localStorage): boolean {
  try { storage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_HISTORY))); return true; }
  catch { return false; }
}
