import type { Language } from "../../i18n/types";

export const FIRST_VISIT_TOUR_ID = "first-visit-v1";
export const FIRST_VISIT_TOUR_VERSION = "1.7";
export const WALKTHROUGH_SCHEMA_VERSION = 1 as const;
export const WALKTHROUGH_MAX_BYTES = 4_096;
export const WALKTHROUGH_KEY_PREFIX = "shabis-ai-academy:walkthrough:v1:";
const LEGACY_KEY = "shabis-ai-academy:walkthrough:v1";
const MAX_STEP = 7;

export type WalkthroughStatus = "not-started" | "in-progress" | "completed";
export type WalkthroughRunMode = "first-visit" | "resume" | "manual-replay";

export interface WalkthroughRecord {
  readonly schemaVersion: typeof WALKTHROUGH_SCHEMA_VERSION;
  readonly tourId: typeof FIRST_VISIT_TOUR_ID;
  readonly tourVersion: typeof FIRST_VISIT_TOUR_VERSION;
  readonly status: WalkthroughStatus;
  readonly currentStep: number;
  readonly firstStartedAt?: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
  readonly language?: Language;
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
    updatedAt: now(),
    language,
  };
}

export function parseWalkthroughRecord(value: unknown): WalkthroughRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const item = value as Record<string, unknown>;
  const statuses = ["not-started", "in-progress", "completed", "dismissed"];
  const firstStartedAt = isIso(item.firstStartedAt)
    ? item.firstStartedAt
    : isIso(item.startedAt)
      ? item.startedAt
      : undefined;
  if (
    item.schemaVersion !== WALKTHROUGH_SCHEMA_VERSION
    || item.tourId !== FIRST_VISIT_TOUR_ID
    || item.tourVersion !== FIRST_VISIT_TOUR_VERSION
    || !statuses.includes(item.status as string)
    || !Number.isInteger(item.currentStep)
    || Number(item.currentStep) < 0
    || Number(item.currentStep) > MAX_STEP
    || !isIso(item.updatedAt)
    || ![null, undefined].includes(item.firstStartedAt as null | undefined) && !isIso(item.firstStartedAt)
    || ![null, undefined].includes(item.startedAt as null | undefined) && !isIso(item.startedAt)
    || ![null, undefined].includes(item.completedAt as null | undefined) && !isIso(item.completedAt)
  ) return undefined;
  const status = item.status === "dismissed" ? "in-progress" : item.status as WalkthroughStatus;
  return {
    schemaVersion: WALKTHROUGH_SCHEMA_VERSION,
    tourId: FIRST_VISIT_TOUR_ID,
    tourVersion: FIRST_VISIT_TOUR_VERSION,
    status,
    currentStep: Number(item.currentStep),
    ...(firstStartedAt ? { firstStartedAt } : {}),
    updatedAt: item.updatedAt as string,
    ...(status === "completed" && isIso(item.completedAt) ? { completedAt: item.completedAt } : {}),
    ...(item.language === "he" || item.language === "en" ? { language: item.language } : {}),
  };
}

export function beginWalkthrough(
  record: WalkthroughRecord,
  mode: WalkthroughRunMode,
  language: Language,
  now = () => new Date().toISOString(),
): WalkthroughRecord {
  if (mode === "manual-replay") return record;
  const timestamp = now();
  return {
    ...record,
    status: "in-progress",
    currentStep: mode === "resume" ? record.currentStep : 0,
    firstStartedAt: record.firstStartedAt ?? timestamp,
    updatedAt: timestamp,
    language,
  };
}

export function updateWalkthroughStep(
  record: WalkthroughRecord,
  currentStep: number,
  mode: WalkthroughRunMode,
  language: Language,
  now = () => new Date().toISOString(),
): WalkthroughRecord {
  if (mode === "manual-replay") return record;
  const timestamp = now();
  return {
    ...record,
    status: "in-progress",
    currentStep,
    firstStartedAt: record.firstStartedAt ?? timestamp,
    updatedAt: timestamp,
    language,
  };
}

export function closeWalkthrough(
  record: WalkthroughRecord,
  currentStep: number,
  mode: WalkthroughRunMode,
  language: Language,
  now = () => new Date().toISOString(),
): WalkthroughRecord {
  return updateWalkthroughStep(record, currentStep, mode, language, now);
}

export function completeWalkthrough(
  record: WalkthroughRecord,
  language: Language,
  now = () => new Date().toISOString(),
): WalkthroughRecord {
  const timestamp = now();
  return {
    ...record,
    status: "completed",
    currentStep: MAX_STEP,
    firstStartedAt: record.firstStartedAt ?? timestamp,
    updatedAt: timestamp,
    completedAt: timestamp,
    language,
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
