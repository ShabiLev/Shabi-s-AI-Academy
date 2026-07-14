const KEY = "shabis-ai-academy-guided-tours-v1";

export function readCompletedTours(): string[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]"); return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
  catch { return []; }
}
export function writeCompletedTours(ids: string[]) { try { localStorage.setItem(KEY, JSON.stringify([...new Set(ids)])); } catch { /* Optional persistence. */ } }
