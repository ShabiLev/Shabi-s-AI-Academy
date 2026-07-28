import type {
  GuestImportPreview,
  GuestImportResult,
  GuestImportStrategy,
  GuestProfile,
  GuestProfileExport,
  RadarItemReference,
  RecommendationFeedback,
  SavedRadarSearch,
} from "./types";

export const GUEST_PROFILE_STORAGE_KEY = "shabis-ai-academy:guest-profile:v1";
export const GUEST_PROFILE_CORRUPT_KEY = "shabis-ai-academy:guest-profile:corrupt:v1";
export const GUEST_PROFILE_MAX_BYTES = 512_000;
export const GUEST_PROFILE_LIMITS = {
  topics: 24,
  sources: 40,
  keywords: 30,
  favorites: 500,
  readItems: 1_000,
  dismissed: 500,
  savedSearches: 30,
  recentViews: 250,
  feedback: 500,
} as const;

const safeId = /^[a-z0-9][a-z0-9._:-]{1,119}$/i;
const checksumPattern = /^sha256:[a-f0-9]{64}$/;
const iso = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value));
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.length <= max
  && ![...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 && code !== 9 && code !== 10 && code !== 13;
  });
const uniqueStrings = (value: unknown, limit: number, max = 120): string[] =>
  Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => text(item, max) && item.trim().length > 0))].slice(0, limit)
    : [];
const safeReference = (value: unknown): RadarItemReference | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  return text(item.id, 120) && safeId.test(item.id) && text(item.checksum, 80)
    && checksumPattern.test(item.checksum) && iso(item.at)
    ? { id: item.id, checksum: item.checksum, at: item.at }
    : undefined;
};
const safeFeedback = (value: unknown): RecommendationFeedback | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  return text(item.itemId, 120) && safeId.test(item.itemId)
    && (item.value === "useful" || item.value === "not-useful") && iso(item.at)
    ? { itemId: item.itemId, value: item.value, at: item.at }
    : undefined;
};
const safeSearch = (value: unknown): SavedRadarSearch | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  if (!text(item.id, 120) || !safeId.test(item.id) || !text(item.name, 80)
    || !text(item.query, 160) || !text(item.topic, 80) || !text(item.sourceId, 120)
    || !text(item.view, 40) || !iso(item.createdAt) || !iso(item.updatedAt)) return undefined;
  return {
    id: item.id,
    name: item.name.trim(),
    query: item.query.trim(),
    topic: item.topic,
    sourceId: item.sourceId,
    view: item.view,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const nowIso = () => new Date().toISOString();
const randomId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
};

export function createGuestProfile(now = nowIso, id = randomId): GuestProfile {
  const timestamp = now();
  return {
    schemaVersion: 1,
    anonymousProfileId: id(),
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSeenAt: timestamp,
    locale: "he",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jerusalem",
    experienceMode: "beginner",
    selectedTopics: [],
    selectedSources: [],
    followedKeywords: [],
    favoriteIds: [],
    readItems: [],
    dismissedIds: [],
    savedSearches: [],
    recentViews: [],
    recommendationFeedback: [],
    briefingPreferences: { enabled: true, locale: "he", includePracticalIdeas: true },
    notificationPreferences: { inApp: true, quietHoursStart: "22:00", quietHoursEnd: "07:00" },
    consent: { analytics: false, feedbackContext: false, updatedAt: timestamp },
    retention: { policyVersion: 1, historiesDays: 90, lastAppliedAt: timestamp },
  };
}

export function parseGuestProfile(value: unknown, fallback?: GuestProfile): GuestProfile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  if (item.schemaVersion !== 1 || !text(item.anonymousProfileId, 120)
    || !safeId.test(item.anonymousProfileId) || !iso(item.createdAt)
    || !iso(item.updatedAt) || !iso(item.lastSeenAt)) return undefined;
  const base = fallback ?? createGuestProfile();
  const briefing = item.briefingPreferences && typeof item.briefingPreferences === "object"
    ? item.briefingPreferences as Record<string, unknown> : {};
  const notifications = item.notificationPreferences && typeof item.notificationPreferences === "object"
    ? item.notificationPreferences as Record<string, unknown> : {};
  const consent = item.consent && typeof item.consent === "object"
    ? item.consent as Record<string, unknown> : {};
  const retention = item.retention && typeof item.retention === "object"
    ? item.retention as Record<string, unknown> : {};
  const cutoff = Date.now() - 90 * 86_400_000;
  const references = (input: unknown, limit: number) => {
    if (!Array.isArray(input)) return [];
    return input.map(safeReference)
      .filter((reference): reference is RadarItemReference => reference !== undefined)
      .filter((reference) => Date.parse(reference.at) >= cutoff)
      .slice(-limit);
  };
  return {
    schemaVersion: 1,
    anonymousProfileId: item.anonymousProfileId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lastSeenAt: item.lastSeenAt,
    locale: item.locale === "en" ? "en" : "he",
    timezone: text(item.timezone, 80) && item.timezone.trim() ? item.timezone : base.timezone,
    experienceMode: item.experienceMode === "advanced" ? "advanced" : "beginner",
    selectedTopics: uniqueStrings(item.selectedTopics, GUEST_PROFILE_LIMITS.topics, 80),
    selectedSources: uniqueStrings(item.selectedSources, GUEST_PROFILE_LIMITS.sources),
    followedKeywords: uniqueStrings(item.followedKeywords, GUEST_PROFILE_LIMITS.keywords, 80),
    favoriteIds: uniqueStrings(item.favoriteIds, GUEST_PROFILE_LIMITS.favorites),
    readItems: references(item.readItems, GUEST_PROFILE_LIMITS.readItems),
    dismissedIds: uniqueStrings(item.dismissedIds, GUEST_PROFILE_LIMITS.dismissed),
    savedSearches: Array.isArray(item.savedSearches)
      ? item.savedSearches.map(safeSearch).filter(Boolean).slice(-GUEST_PROFILE_LIMITS.savedSearches) as SavedRadarSearch[]
      : [],
    recentViews: references(item.recentViews, GUEST_PROFILE_LIMITS.recentViews),
    recommendationFeedback: Array.isArray(item.recommendationFeedback)
      ? item.recommendationFeedback.map(safeFeedback).filter(Boolean).slice(-GUEST_PROFILE_LIMITS.feedback) as RecommendationFeedback[]
      : [],
    briefingPreferences: {
      enabled: briefing.enabled !== false,
      locale: briefing.locale === "en" ? "en" : "he",
      includePracticalIdeas: briefing.includePracticalIdeas !== false,
    },
    notificationPreferences: {
      inApp: notifications.inApp !== false,
      quietHoursStart: text(notifications.quietHoursStart, 5) ? notifications.quietHoursStart : "22:00",
      quietHoursEnd: text(notifications.quietHoursEnd, 5) ? notifications.quietHoursEnd : "07:00",
    },
    consent: {
      analytics: consent.analytics === true,
      feedbackContext: consent.feedbackContext === true,
      updatedAt: iso(consent.updatedAt) ? consent.updatedAt : item.updatedAt,
    },
    retention: {
      policyVersion: 1,
      historiesDays: 90,
      lastAppliedAt: iso(retention.lastAppliedAt) ? retention.lastAppliedAt : item.updatedAt,
    },
  };
}

export function profileChecksum(value: unknown): string {
  const serialized = JSON.stringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function exportWithoutChecksum(envelope: Omit<GuestProfileExport, "checksum">) {
  return envelope;
}

export function exportGuestProfile(profile: GuestProfile, now = nowIso): GuestProfileExport {
  const envelope = {
    schemaVersion: 1 as const,
    kind: "shabis-ai-academy-guest-profile" as const,
    appVersion: "1.7.0-beta.4",
    exportedAt: now(),
    profile,
  };
  return { ...envelope, checksum: profileChecksum(exportWithoutChecksum(envelope)) };
}

function hasDangerousKeys(value: unknown, depth = 0): boolean {
  if (depth > 30) return true;
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => hasDangerousKeys(item, depth + 1));
  const record = value as Record<string, unknown>;
  return Object.keys(record).some((key) =>
    ["__proto__", "prototype", "constructor"].includes(key)
    || /api.?key|secret|password|token|authorization|credential/i.test(key))
    || Object.values(record).some((item) => hasDangerousKeys(item, depth + 1));
}

export function previewGuestImport(raw: string, current: GuestProfile): GuestImportPreview {
  if (new Blob([raw]).size > GUEST_PROFILE_MAX_BYTES) {
    return { valid: false, errors: ["oversized-import"], changes: {} };
  }
  try {
    const envelope = JSON.parse(raw) as GuestProfileExport;
    const errors: string[] = [];
    if (envelope?.schemaVersion !== 1 || envelope?.kind !== "shabis-ai-academy-guest-profile") {
      errors.push("invalid-envelope");
    }
    if (hasDangerousKeys(envelope)) errors.push("dangerous-or-secret-shaped-key");
    const profile = parseGuestProfile(envelope?.profile);
    if (!profile) errors.push("invalid-profile");
    const unsigned = envelope ? {
      schemaVersion: envelope.schemaVersion,
      kind: envelope.kind,
      appVersion: envelope.appVersion,
      exportedAt: envelope.exportedAt,
      profile: envelope.profile,
    } : undefined;
    if (!envelope || envelope.checksum !== profileChecksum(unsigned)) errors.push("checksum-mismatch");
    return {
      valid: errors.length === 0,
      errors,
      incoming: errors.length === 0 ? profile : undefined,
      changes: profile ? {
        topics: profile.selectedTopics.filter((item) => !current.selectedTopics.includes(item)).length,
        sources: profile.selectedSources.filter((item) => !current.selectedSources.includes(item)).length,
        favorites: profile.favoriteIds.filter((item) => !current.favoriteIds.includes(item)).length,
        searches: profile.savedSearches.filter((item) => !current.savedSearches.some((search) => search.id === item.id)).length,
      } : {},
    };
  } catch {
    return { valid: false, errors: ["malformed-json"], changes: {} };
  }
}

const byId = <T extends { id: string }>(left: readonly T[], right: readonly T[], limit: number): T[] => {
  const map = new Map(left.map((item) => [item.id, item]));
  right.forEach((item) => map.set(item.id, item));
  return [...map.values()].slice(-limit);
};

export function mergeGuestProfiles(current: GuestProfile, incoming: GuestProfile, now = nowIso): GuestProfile {
  const feedback = new Map(current.recommendationFeedback.map((item) => [item.itemId, item]));
  incoming.recommendationFeedback.forEach((item) => feedback.set(item.itemId, item));
  return {
    ...current,
    updatedAt: now(),
    selectedTopics: uniqueStrings([...current.selectedTopics, ...incoming.selectedTopics], GUEST_PROFILE_LIMITS.topics, 80),
    selectedSources: uniqueStrings([...current.selectedSources, ...incoming.selectedSources], GUEST_PROFILE_LIMITS.sources),
    followedKeywords: uniqueStrings([...current.followedKeywords, ...incoming.followedKeywords], GUEST_PROFILE_LIMITS.keywords, 80),
    favoriteIds: uniqueStrings([...current.favoriteIds, ...incoming.favoriteIds], GUEST_PROFILE_LIMITS.favorites),
    readItems: byId(current.readItems, incoming.readItems, GUEST_PROFILE_LIMITS.readItems),
    dismissedIds: uniqueStrings([...current.dismissedIds, ...incoming.dismissedIds], GUEST_PROFILE_LIMITS.dismissed),
    savedSearches: byId(current.savedSearches, incoming.savedSearches, GUEST_PROFILE_LIMITS.savedSearches),
    recentViews: byId(current.recentViews, incoming.recentViews, GUEST_PROFILE_LIMITS.recentViews),
    recommendationFeedback: [...feedback.values()].slice(-GUEST_PROFILE_LIMITS.feedback),
  };
}

export interface GuestProfileRepository {
  load(): GuestProfile;
  save(profile: GuestProfile): boolean;
  reset(): GuestProfile;
  applyImport(preview: GuestImportPreview, strategy: GuestImportStrategy): GuestImportResult;
}

export function createGuestProfileRepository(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem"> = localStorage,
  now = nowIso,
): GuestProfileRepository {
  const persist = (profile: GuestProfile): boolean => {
    try {
      const normalized = parseGuestProfile(profile);
      if (!normalized) return false;
      const serialized = JSON.stringify(normalized);
      if (new Blob([serialized]).size > GUEST_PROFILE_MAX_BYTES) return false;
      storage.setItem(GUEST_PROFILE_STORAGE_KEY, serialized);
      return true;
    } catch {
      return false;
    }
  };
  const load = (): GuestProfile => {
    const raw = storage.getItem(GUEST_PROFILE_STORAGE_KEY);
    if (!raw) {
      const profile = createGuestProfile(now);
      persist(profile);
      return profile;
    }
    if (new Blob([raw]).size <= GUEST_PROFILE_MAX_BYTES) {
      try {
        const parsed = parseGuestProfile(JSON.parse(raw));
        if (parsed) return parsed;
      } catch {
        // The bounded raw value is retained for explicit support inspection.
      }
    }
    try {
      storage.setItem(GUEST_PROFILE_CORRUPT_KEY, raw.slice(0, GUEST_PROFILE_MAX_BYTES));
      storage.removeItem(GUEST_PROFILE_STORAGE_KEY);
    } catch {
      // Recovery still continues in memory.
    }
    const recovered = createGuestProfile(now);
    persist(recovered);
    return recovered;
  };
  return {
    load,
    save: persist,
    reset: () => {
      const next = createGuestProfile(now);
      try {
        storage.removeItem(GUEST_PROFILE_STORAGE_KEY);
        storage.removeItem(GUEST_PROFILE_CORRUPT_KEY);
      } catch {
        // In-memory reset still succeeds.
      }
      persist(next);
      return next;
    },
    applyImport: (preview, strategy) => {
      if (!preview.valid || !preview.incoming) {
        return { ok: false, rolledBack: false, errors: preview.errors };
      }
      const snapshot = storage.getItem(GUEST_PROFILE_STORAGE_KEY);
      try {
        const current = load();
        const next = strategy === "merge"
          ? mergeGuestProfiles(current, preview.incoming, now)
          : { ...preview.incoming, anonymousProfileId: current.anonymousProfileId, updatedAt: now() };
        if (!persist(next)) throw new Error("write-failed");
        return { ok: true, rolledBack: false, errors: [], profile: next };
      } catch {
        try {
          if (snapshot === null) storage.removeItem(GUEST_PROFILE_STORAGE_KEY);
          else storage.setItem(GUEST_PROFILE_STORAGE_KEY, snapshot);
        } catch {
          return { ok: false, rolledBack: false, errors: ["write-failed", "rollback-failed"] };
        }
        return { ok: false, rolledBack: true, errors: ["write-failed"] };
      }
    },
  };
}
