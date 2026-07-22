export type RadarSourceTier = 1 | 2 | 3 | 4;
export type RadarSourceType = "official-docs" | "release-notes" | "repository" | "paper" | "security-advisory" | "regulation" | "technical-publication";
export type RadarFreshness = "fresh" | "aging" | "stale";
export type RadarRecordStatus = "published" | "partial" | "unavailable";
export type RadarTranslationStatus = "complete" | "partial" | "not-started";

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
}

export interface RadarFeed {
  readonly schemaVersion: 1;
  readonly provider: string;
  readonly generatedAt: string;
  readonly records: readonly RadarRecord[];
  readonly partial: boolean;
}

const allowedSourceTypes: readonly RadarSourceType[] = ["official-docs", "release-notes", "repository", "paper", "security-advisory", "regulation", "technical-publication"];
const allowedFreshness: readonly RadarFreshness[] = ["fresh", "aging", "stale"];
const allowedStatuses: readonly RadarRecordStatus[] = ["published", "partial", "unavailable"];
const allowedTranslations: readonly RadarTranslationStatus[] = ["complete", "partial", "not-started"];
const allowedHosts = new Set(["openai.com", "www.anthropic.com", "deepmind.google", "huggingface.co", "www.nist.gov", "github.com", "arxiv.org", "www.gov.il", "digital-strategy.ec.europa.eu"]);
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

export function parseRadarRecord(value: unknown): RadarRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  if (!boundedString(item.id, 120) || !safeId.test(item.id) || !boundedString(item.canonicalId, 120) || !safeId.test(item.canonicalId)) return undefined;
  if (!localized(item.title, 240) || !localized(item.summary, 1_200) || !localized(item.whyItMatters, 800)) return undefined;
  if (!stringList(item.affectedAudiences, 20, 80) || !boundedString(item.sourceId, 120) || !boundedString(item.sourceName, 160)) return undefined;
  if (!boundedString(item.sourceUrl, 500)) return undefined;
  try {
    const url = new URL(item.sourceUrl);
    if (url.protocol !== "https:" || !allowedHosts.has(url.hostname) || url.username || url.password) return undefined;
  } catch { return undefined; }
  if (![1, 2, 3, 4].includes(Number(item.sourceTier)) || !allowedSourceTypes.includes(item.sourceType as RadarSourceType)) return undefined;
  if (!boundedString(item.category, 80) || !stringList(item.topics, 30, 80) || !["he", "en", "multilingual"].includes(String(item.language))) return undefined;
  if (!date(item.publicationDate) || !date(item.retrievalDate) || !date(item.lastVerifiedAt) || item.publicationDate > item.retrievalDate || item.retrievalDate > item.lastVerifiedAt) return undefined;
  if (!allowedFreshness.includes(item.freshness as RadarFreshness) || !score(item.confidence) || !score(item.relevanceScore)) return undefined;
  if (item.duplicateGroupId !== undefined && (!boundedString(item.duplicateGroupId, 120) || !safeId.test(item.duplicateGroupId))) return undefined;
  if (typeof item.historical !== "boolean" || typeof item.saved !== "boolean" || !boundedString(item.provider, 100) || !boundedString(item.checksum, 80) || !checksum.test(item.checksum)) return undefined;
  if (!allowedStatuses.includes(item.status as RadarRecordStatus) || typeof item.reviewed !== "boolean" || !allowedTranslations.includes(item.translationStatus as RadarTranslationStatus)) return undefined;
  return {
    id: item.id, canonicalId: item.canonicalId,
    title: { he: item.title.he, en: item.title.en },
    summary: { he: item.summary.he, en: item.summary.en },
    whyItMatters: { he: item.whyItMatters.he, en: item.whyItMatters.en },
    affectedAudiences: [...item.affectedAudiences], sourceId: item.sourceId, sourceName: item.sourceName,
    sourceUrl: item.sourceUrl, sourceTier: item.sourceTier as RadarSourceTier, sourceType: item.sourceType as RadarSourceType,
    category: item.category, topics: [...item.topics], language: item.language as RadarRecord["language"],
    publicationDate: item.publicationDate, retrievalDate: item.retrievalDate, lastVerifiedAt: item.lastVerifiedAt,
    freshness: item.freshness as RadarFreshness, confidence: item.confidence, relevanceScore: item.relevanceScore,
    duplicateGroupId: item.duplicateGroupId as string | undefined, historical: item.historical, saved: item.saved,
    provider: item.provider, checksum: item.checksum, status: item.status as RadarRecordStatus,
    reviewed: item.reviewed, translationStatus: item.translationStatus as RadarTranslationStatus,
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
    ids.add(record.id);
  }
  return { schemaVersion: 1, provider: feed.provider, generatedAt: feed.generatedAt, records: records as RadarRecord[], partial: feed.partial };
}

export function classifyRadarFreshness(lastVerifiedAt: string, today: string): RadarFreshness {
  const ageDays = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastVerifiedAt}T00:00:00Z`)) / 86_400_000);
  if (ageDays <= 2) return "fresh";
  if (ageDays <= 7) return "aging";
  return "stale";
}
