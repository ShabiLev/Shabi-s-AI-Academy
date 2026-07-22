import type { RadarRecord } from "./records";

export const RADAR_RETENTION_DAYS = 7;
export const RADAR_MAX_RECORDS = 250;

export function retainRadarHistory(records: readonly RadarRecord[], today: string, savedIds: ReadonlySet<string>): RadarRecord[] {
  const cutoff = Date.parse(`${today}T00:00:00Z`) - (RADAR_RETENTION_DAYS - 1) * 86_400_000;
  const byCanonical = new Map<string, RadarRecord>();
  for (const record of records) {
    const saved = savedIds.has(record.canonicalId) || savedIds.has(record.id);
    if (!saved && Date.parse(`${record.publicationDate}T00:00:00Z`) < cutoff) continue;
    const normalized = { ...record, saved, historical: Date.parse(`${record.publicationDate}T00:00:00Z`) < cutoff };
    const existing = byCanonical.get(record.canonicalId);
    if (!existing || record.lastVerifiedAt > existing.lastVerifiedAt) byCanonical.set(record.canonicalId, normalized);
  }
  return [...byCanonical.values()]
    .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate) || b.relevanceScore - a.relevanceScore)
    .slice(0, RADAR_MAX_RECORDS);
}

export function groupRadarRecords(records: readonly RadarRecord[]): Map<string, RadarRecord[]> {
  const groups = new Map<string, RadarRecord[]>();
  for (const record of records) {
    const key = record.duplicateGroupId ?? record.canonicalId;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return groups;
}

