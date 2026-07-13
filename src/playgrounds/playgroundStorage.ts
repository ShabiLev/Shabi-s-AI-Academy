export const PROMPT_PLAYGROUND_KEY = "shabis-ai-academy.playground.prompts.v1";
export const AGENT_PLAYGROUND_KEY = "shabis-ai-academy.playground.agents.v1";
export const MAX_PLAYGROUND_HISTORY = 20;

export function saveBoundedWorkspace(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, value })); return true; } catch { return false; }
}
export function loadWorkspace<T>(key: string, fallback: T): T {
  try { const parsed = JSON.parse(localStorage.getItem(key) ?? "null") as { schemaVersion?: number; value?: T } | null; return parsed?.schemaVersion === 1 && parsed.value !== undefined ? parsed.value : fallback; } catch { return fallback; }
}
