import type { ExperienceMode } from "../experience";
import type { Language } from "../i18n/types";

export const GUEST_PROFILE_SCHEMA_VERSION = 1 as const;

export interface RadarItemReference {
  readonly id: string;
  readonly checksum: string;
  readonly at: string;
}

export interface SavedRadarSearch {
  readonly id: string;
  readonly name: string;
  readonly query: string;
  readonly topic: string;
  readonly sourceId: string;
  readonly view: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RecommendationFeedback {
  readonly itemId: string;
  readonly value: "useful" | "not-useful";
  readonly at: string;
}

export interface GuestConsent {
  readonly analytics: boolean;
  readonly feedbackContext: boolean;
  readonly updatedAt: string;
}

export interface GuestProfile {
  readonly schemaVersion: typeof GUEST_PROFILE_SCHEMA_VERSION;
  readonly anonymousProfileId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastSeenAt: string;
  readonly locale: Language;
  readonly timezone: string;
  readonly experienceMode: ExperienceMode;
  readonly selectedTopics: readonly string[];
  readonly selectedSources: readonly string[];
  readonly followedKeywords: readonly string[];
  readonly favoriteIds: readonly string[];
  readonly readItems: readonly RadarItemReference[];
  readonly dismissedIds: readonly string[];
  readonly savedSearches: readonly SavedRadarSearch[];
  readonly recentViews: readonly RadarItemReference[];
  readonly recommendationFeedback: readonly RecommendationFeedback[];
  readonly briefingPreferences: {
    readonly enabled: boolean;
    readonly locale: Language;
    readonly includePracticalIdeas: boolean;
  };
  readonly notificationPreferences: {
    readonly inApp: boolean;
    readonly quietHoursStart: string;
    readonly quietHoursEnd: string;
  };
  readonly consent: GuestConsent;
  readonly retention: {
    readonly policyVersion: 1;
    readonly historiesDays: 90;
    readonly lastAppliedAt: string;
  };
}

export interface GuestProfileExport {
  readonly schemaVersion: 1;
  readonly kind: "shabis-ai-academy-guest-profile";
  readonly appVersion: string;
  readonly exportedAt: string;
  readonly profile: GuestProfile;
  readonly checksum: string;
}

export type GuestImportStrategy = "merge" | "replace";

export interface GuestImportPreview {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly incoming?: GuestProfile;
  readonly changes: Readonly<Record<string, number>>;
}

export interface GuestImportResult {
  readonly ok: boolean;
  readonly rolledBack: boolean;
  readonly errors: readonly string[];
  readonly profile?: GuestProfile;
}
