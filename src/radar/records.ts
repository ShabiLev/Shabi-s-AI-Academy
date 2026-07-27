export type RadarSourceTier = 1 | 2 | 3 | 4;
export type RadarSourceType = "official-docs" | "release-notes" | "repository" | "paper" | "security-advisory" | "regulation" | "technical-publication";
export type RadarFreshness = "fresh" | "aging" | "stale";
export type RadarRecordStatus = "published" | "partial" | "unavailable";
export type RadarTranslationStatus = "complete" | "partial" | "not-started";
export type RadarSafetyState = "passed" | "flagged" | "quarantined";
export type RadarPublicationState =
  | "reviewed"
  | "trusted-source-auto-published"
  | "pending-review"
  | "held"
  | "rejected"
  | "corrected"
  | "archived";

export interface RadarSourceHealth {
  readonly sourceId: string;
  readonly status: "healthy" | "degraded" | "failed" | "disabled";
  readonly checkedAt: string;
  readonly lastSuccessfulAt?: string;
  readonly itemCount: number;
  readonly errorCode?: string;
}

export interface RadarRecord {
  readonly id: string;
  readonly canonicalId: string;
  readonly title: { readonly he: string; readonly en: string };
  readonly summary: { readonly he: string; readonly en: string };
  readonly whyItMatters: { readonly he: string; readonly en: string };
  readonly affectedAudiences: readonly string[];
  readonly sourceId: string;
  readonly sourceName: string;
  readonly sourceUrl: string;
  readonly sourceTier: RadarSourceTier;
  readonly sourceType: RadarSourceType;
  readonly category: string;
  readonly topics: readonly string[];
  readonly language: "he" | "en" | "multilingual";
  readonly publicationDate: string;
  readonly publishedAt?: string;
  readonly updatedAt?: string;
  readonly retrievalDate: string;
  readonly lastVerifiedAt: string;
  readonly freshness: RadarFreshness;
  readonly confidence: number;
  readonly relevanceScore: number;
  readonly duplicateGroupId?: string;
  readonly historical: boolean;
  readonly saved: boolean;
  readonly provider: string;
  readonly checksum: string;
  readonly status: RadarRecordStatus;
  readonly reviewed: boolean;
  readonly translationStatus: RadarTranslationStatus;
  readonly version?: number;
  readonly whatChanged?: { readonly he: string; readonly en: string };
  readonly israelRelevance?: number;
  readonly publicationState?: RadarPublicationState;
  readonly safetyState?: RadarSafetyState;
  readonly additionalSourceUrls?: readonly string[];
  readonly correctionHistory?: readonly {
    readonly correctedAt: string;
    readonly reason: string;
    readonly previousChecksum: string;
  }[];
}

export interface RadarFeed {
  readonly schemaVersion: 1;
  readonly provider: string;
  readonly generatedAt: string;
  readonly records: readonly RadarRecord[];
  readonly partial: boolean;
  readonly lastSuccessfulAt?: string;
  readonly sourceHealth?: readonly RadarSourceHealth[];
}

const allowedSourceTypes: readonly RadarSourceType[] = ["official-docs", "release-notes", "repository", "paper", "security-advisory", "regulation", "technical-publication"];
const allowedFreshness: readonly RadarFreshness[] = ["fresh", "aging", "stale"];
const allowedStatuses: readonly RadarRecordStatus[] = ["published", "partial", "unavailable"];
const allowedTranslations: readonly RadarTranslationStatus[] = ["complete", "partial", "not-started"];
const allowedPublicationStates: readonly RadarPublicationState[] = [
  "reviewed",
  "trusted-source-auto-published",
  "pending-review",
  "held",
  "rejected",
  "corrected",
  "archived",
];
export const RADAR_ALLOWED_HOSTS = new Set([
  "openai.com",
  "www.anthropic.com",
  "deepmind.google",
  "blog.google",
  "cloud.google.com",
  "huggingface.co",
  "www.nist.gov",
  "github.com",
  "arxiv.org",
  "export.arxiv.org",
  "www.gov.il",
  "innovationisrael.org.il",
  "www.innovationisrael.org.il",
  "digital-strategy.ec.europa.eu",
  "hakaveret.education.gov.il",
]);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const safeId = /^[a-z0-9][a-z0-9._:-]{1,119}$/i;
const checksum = /^sha256:[a-f0-9]{64}$/;

function boundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max
    && ![...value].some((character) => { const code = character.charCodeAt(0); return code <= 31 && code !== 9 && code !== 10 && code !== 13; });
}

function localized(value: unknown, max: number): value is RadarRecord["title"] {
  if (!value || typeof value !== "object") return false;
  const text = value as Record<string, unknown>;
  return boundedString(text.he, max) && boundedString(text.en, max);
}

function stringList(value: unknown, maxItems: number, maxLength: number): value is string[] {
  return Array.isArray(value) && value.length <= maxItems && value.every((item) => boundedString(item, maxLength));
}

function date(value: unknown): value is string {
  return typeof value === "string" && isoDate.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function score(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function safeHttpsUrl(value: unknown): value is string {
  if (!boundedString(value, 500)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && RADAR_ALLOWED_HOSTS.has(url.hostname)
      && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function parseRadarRecord(value: unknown): RadarRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  if (!boundedString(item.id, 120) || !safeId.test(item.id) || !boundedString(item.canonicalId, 120) || !safeId.test(item.canonicalId)) return undefined;
  if (!localized(item.title, 240) || !localized(item.summary, 1_200) || !localized(item.whyItMatters, 800)) return undefined;
  if (!stringList(item.affectedAudiences, 20, 80) || !boundedString(item.sourceId, 120) || !boundedString(item.sourceName, 160)) return undefined;
  if (!safeHttpsUrl(item.sourceUrl)) return undefined;
  if (![1, 2, 3, 4].includes(Number(item.sourceTier)) || !allowedSourceTypes.includes(item.sourceType as RadarSourceType)) return undefined;
  if (!boundedString(item.category, 80) || !stringList(item.topics, 30, 80) || !["he", "en", "multilingual"].includes(String(item.language))) return undefined;
  if (!date(item.publicationDate) || !date(item.retrievalDate) || !date(item.lastVerifiedAt) || item.publicationDate > item.retrievalDate || item.retrievalDate > item.lastVerifiedAt) return undefined;
  if (item.publishedAt !== undefined && (!boundedString(item.publishedAt, 40)
    || Number.isNaN(Date.parse(item.publishedAt)) || item.publishedAt.slice(0, 10) !== item.publicationDate)) return undefined;
  if (item.updatedAt !== undefined && (!boundedString(item.updatedAt, 40)
    || Number.isNaN(Date.parse(item.updatedAt))
    || Date.parse(item.updatedAt) < Date.parse(typeof item.publishedAt === "string" ? item.publishedAt : `${item.publicationDate}T00:00:00Z`))) return undefined;
  if (!allowedFreshness.includes(item.freshness as RadarFreshness) || !score(item.confidence) || !score(item.relevanceScore)) return undefined;
  if (item.duplicateGroupId !== undefined && (!boundedString(item.duplicateGroupId, 120) || !safeId.test(item.duplicateGroupId))) return undefined;
  if (typeof item.historical !== "boolean" || typeof item.saved !== "boolean" || !boundedString(item.provider, 100) || !boundedString(item.checksum, 80) || !checksum.test(item.checksum)) return undefined;
  if (!allowedStatuses.includes(item.status as RadarRecordStatus) || typeof item.reviewed !== "boolean" || !allowedTranslations.includes(item.translationStatus as RadarTranslationStatus)) return undefined;
  if (item.version !== undefined && (!Number.isInteger(item.version) || Number(item.version) < 1 || Number(item.version) > 10_000)) return undefined;
  if (item.whatChanged !== undefined && !localized(item.whatChanged, 800)) return undefined;
  if (item.israelRelevance !== undefined && !score(item.israelRelevance)) return undefined;
  if (item.publicationState !== undefined && !allowedPublicationStates.includes(item.publicationState as RadarPublicationState)) return undefined;
  if (item.safetyState !== undefined && !["passed", "flagged", "quarantined"].includes(String(item.safetyState))) return undefined;
  if (item.additionalSourceUrls !== undefined
    && (!Array.isArray(item.additionalSourceUrls) || item.additionalSourceUrls.length > 8
      || !item.additionalSourceUrls.every(safeHttpsUrl))) return undefined;
  if (item.correctionHistory !== undefined && (!Array.isArray(item.correctionHistory)
    || item.correctionHistory.length > 20 || !item.correctionHistory.every((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const correction = entry as Record<string, unknown>;
      return isoDate.test(String(correction.correctedAt).slice(0, 10))
        && boundedString(correction.reason, 500)
        && boundedString(correction.previousChecksum, 80)
        && checksum.test(correction.previousChecksum);
    }))) return undefined;
  return {
    id: item.id, canonicalId: item.canonicalId,
    title: { he: item.title.he, en: item.title.en },
    summary: { he: item.summary.he, en: item.summary.en },
    whyItMatters: { he: item.whyItMatters.he, en: item.whyItMatters.en },
    affectedAudiences: [...item.affectedAudiences], sourceId: item.sourceId, sourceName: item.sourceName,
    sourceUrl: item.sourceUrl, sourceTier: item.sourceTier as RadarSourceTier, sourceType: item.sourceType as RadarSourceType,
    category: item.category, topics: [...item.topics], language: item.language as RadarRecord["language"],
    publicationDate: item.publicationDate,
    publishedAt: item.publishedAt as string | undefined,
    updatedAt: item.updatedAt as string | undefined,
    retrievalDate: item.retrievalDate, lastVerifiedAt: item.lastVerifiedAt,
    freshness: item.freshness as RadarFreshness, confidence: item.confidence, relevanceScore: item.relevanceScore,
    duplicateGroupId: item.duplicateGroupId as string | undefined, historical: item.historical, saved: item.saved,
    provider: item.provider, checksum: item.checksum, status: item.status as RadarRecordStatus,
    reviewed: item.reviewed, translationStatus: item.translationStatus as RadarTranslationStatus,
    version: item.version as number | undefined,
    whatChanged: item.whatChanged as RadarRecord["whatChanged"],
    israelRelevance: item.israelRelevance as number | undefined,
    publicationState: item.publicationState as RadarPublicationState | undefined,
    safetyState: item.safetyState as RadarSafetyState | undefined,
    additionalSourceUrls: item.additionalSourceUrls as string[] | undefined,
    correctionHistory: item.correctionHistory as RadarRecord["correctionHistory"],
  };
}

export function parseRadarFeed(value: unknown, maxRecords = 250): RadarFeed | undefined {
  if (!value || typeof value !== "object") return undefined;
  const feed = value as Record<string, unknown>;
  if (feed.schemaVersion !== 1 || !boundedString(feed.provider, 100) || !boundedString(feed.generatedAt, 40) || Number.isNaN(Date.parse(feed.generatedAt)) || typeof feed.partial !== "boolean") return undefined;
  if (!Array.isArray(feed.records) || feed.records.length > maxRecords) return undefined;
  const records = feed.records.map(parseRadarRecord);
  if (records.some((record) => !record)) return undefined;
  const ids = new Set<string>();
  for (const record of records as RadarRecord[]) {
    if (ids.has(record.id)) return undefined;
    if (record.publicationState && ["pending-review", "held", "rejected"].includes(record.publicationState)) return undefined;
    if (record.safetyState === "flagged" || record.safetyState === "quarantined") return undefined;
    ids.add(record.id);
  }
  const lastSuccessfulAt = feed.lastSuccessfulAt;
  if (lastSuccessfulAt !== undefined && (!boundedString(lastSuccessfulAt, 40) || Number.isNaN(Date.parse(lastSuccessfulAt)))) return undefined;
  let sourceHealth: RadarSourceHealth[] | undefined;
  if (feed.sourceHealth !== undefined) {
    if (!Array.isArray(feed.sourceHealth) || feed.sourceHealth.length > 50) return undefined;
    sourceHealth = [];
    for (const value of feed.sourceHealth) {
      if (!value || typeof value !== "object") return undefined;
      const health = value as Record<string, unknown>;
      if (!boundedString(health.sourceId, 120) || !["healthy", "degraded", "failed", "disabled"].includes(String(health.status))
        || !boundedString(health.checkedAt, 40) || Number.isNaN(Date.parse(health.checkedAt))
        || !Number.isInteger(health.itemCount) || Number(health.itemCount) < 0 || Number(health.itemCount) > 1_000
        || (health.lastSuccessfulAt !== undefined && (!boundedString(health.lastSuccessfulAt, 40) || Number.isNaN(Date.parse(health.lastSuccessfulAt))))
        || (health.errorCode !== undefined && !boundedString(health.errorCode, 80))) return undefined;
      sourceHealth.push({
        sourceId: health.sourceId,
        status: health.status as RadarSourceHealth["status"],
        checkedAt: health.checkedAt,
        lastSuccessfulAt: health.lastSuccessfulAt as string | undefined,
        itemCount: health.itemCount as number,
        errorCode: health.errorCode as string | undefined,
      });
    }
  }
  return {
    schemaVersion: 1,
    provider: feed.provider,
    generatedAt: feed.generatedAt,
    records: records as RadarRecord[],
    partial: feed.partial,
    lastSuccessfulAt: lastSuccessfulAt as string | undefined,
    sourceHealth,
  };
}

export function classifyRadarFreshness(lastVerifiedAt: string, today: string): RadarFreshness {
  const ageDays = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastVerifiedAt}T00:00:00Z`)) / 86_400_000);
  if (ageDays <= 2) return "fresh";
  if (ageDays <= 7) return "aging";
  return "stale";
}
