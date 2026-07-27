import type { Language } from "../../i18n/types";

export const FIRST_VISIT_TOUR_ID = "first-visit-v1";
export const FIRST_VISIT_TOUR_VERSION = "1.7";
export const WALKTHROUGH_SCHEMA_VERSION = 1 as const;
export const WALKTHROUGH_MAX_BYTES = 4_096;
export const WALKTHROUGH_KEY_PREFIX = "shabis-ai-academy:walkthrough:v1:";
const LEGACY_KEY = "shabis-ai-academy:walkthrough:v1";
const MAX_STEP = 7;

export type WalkthroughStatus = "not-started" | "in-progress" | "completed" | "dismissed";

export interface WalkthroughRecord {
  readonly schemaVersion: typeof WALKTHROUGH_SCHEMA_VERSION;
  readonly tourId: typeof FIRST_VISIT_TOUR_ID;
  readonly tourVersion: typeof FIRST_VISIT_TOUR_VERSION;
  readonly status: WalkthroughStatus;
  readonly currentStep: number;
  readonly startedAt: string | null;
  readonly updatedAt: string;
  readonly completedAt: string | null;
  readonly dismissedAt: string | null;
  readonly language: Language;
}

const isIso = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));

export function normalizeWalkthroughActorId(actorId: string): string {
  const normalized = actorId.trim().toLocaleLowerCase().replace(/[^a-z0-9._:-]/g, "-").slice(0, 120);
  return normalized.length >= 2 ? normalized : "anonymous-local";
}

export function walkthroughStorageKey(actorId: string): string {
  return `${WALKTHROUGH_KEY_PREFIX}${normalizeWalkthroughActorId(actorId)}`;
}

export function createWalkthroughRecord(
  language: Language,
  now = () => new Date().toISOString(),
): WalkthroughRecord {
  return {
    schemaVersion: WALKTHROUGH_SCHEMA_VERSION,
    tourId: FIRST_VISIT_TOUR_ID,
    tourVersion: FIRST_VISIT_TOUR_VERSION,
    status: "not-started",
    currentStep: 0,
    startedAt: null,
    updatedAt: now(),
    completedAt: null,
    dismissedAt: null,
    language,
  };
}

export function parseWalkthroughRecord(value: unknown): WalkthroughRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const item = value as Record<string, unknown>;
  const statuses: WalkthroughStatus[] = ["not-started", "in-progress", "completed", "dismissed"];
  if (
    item.schemaVersion !== WALKTHROUGH_SCHEMA_VERSION
    || item.tourId !== FIRST_VISIT_TOUR_ID
    || item.tourVersion !== FIRST_VISIT_TOUR_VERSION
    || !statuses.includes(item.status as WalkthroughStatus)
    || !Number.isInteger(item.currentStep)
    || Number(item.currentStep) < 0
    || Number(item.currentStep) > MAX_STEP
    || !isIso(item.updatedAt)
    || ![null, undefined].includes(item.startedAt as null | undefined) && !isIso(item.startedAt)
    || ![null, undefined].includes(item.completedAt as null | undefined) && !isIso(item.completedAt)
    || ![null, undefined].includes(item.dismissedAt as null | undefined) && !isIso(item.dismissedAt)
  ) return undefined;
  return {
    schemaVersion: WALKTHROUGH_SCHEMA_VERSION,
    tourId: FIRST_VISIT_TOUR_ID,
    tourVersion: FIRST_VISIT_TOUR_VERSION,
    status: item.status as WalkthroughStatus,
    currentStep: Number(item.currentStep),
    startedAt: isIso(item.startedAt) ? item.startedAt : null,
    updatedAt: item.updatedAt as string,
    completedAt: isIso(item.completedAt) ? item.completedAt : null,
    dismissedAt: isIso(item.dismissedAt) ? item.dismissedAt : null,
    language: item.language === "en" ? "en" : "he",
  };
}

function boundedParse(raw: string | null): WalkthroughRecord | undefined {
  if (!raw || new Blob([raw]).size > WALKTHROUGH_MAX_BYTES) return undefined;
  try {
    return parseWalkthroughRecord(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export function readWalkthroughRecord(
  actorId: string,
  language: Language,
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage,
  now = () => new Date().toISOString(),
): WalkthroughRecord {
  const key = walkthroughStorageKey(actorId);
  const scoped = boundedParse(storage.getItem(key));
  if (scoped) return scoped;

  const legacy = boundedParse(storage.getItem(LEGACY_KEY));
  const initial = legacy && (legacy.status === "not-started" || legacy.status === "in-progress")
    ? { ...legacy, language, updatedAt: now() }
    : createWalkthroughRecord(language, now);
  writeWalkthroughRecord(actorId, initial, storage);
  try {
    if (storage.getItem(key) === null) storage.removeItem(key);
  } catch {
    // The validated in-memory record remains usable.
  }
  return initial;
}

export function writeWalkthroughRecord(
  actorId: string,
  record: WalkthroughRecord,
  storage: Pick<Storage, "setItem"> = localStorage,
): boolean {
  const parsed = parseWalkthroughRecord(record);
  if (!parsed) return false;
  const serialized = JSON.stringify(parsed);
  if (new Blob([serialized]).size > WALKTHROUGH_MAX_BYTES) return false;
  try {
    storage.setItem(walkthroughStorageKey(actorId), serialized);
    return true;
  } catch {
    return false;
  }
}
