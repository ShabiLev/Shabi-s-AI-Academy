import type { GuestProfile } from "../guest-profile";
import { rankRadarRecords } from "./personalization";
import type { RadarFeed, RadarRecord, RadarSourceHealth } from "./records";

export interface RadarBriefingSection {
  readonly id: "top" | "agents" | "qa" | "israel" | "tools";
  readonly records: readonly RadarRecord[];
}

export interface RadarBriefing {
  readonly generatedAt: string;
  readonly sourceCount: number;
  readonly partial: boolean;
  readonly cached: boolean;
  readonly sections: readonly RadarBriefingSection[];
  readonly practicalIdeas: readonly string[];
}

const sectionRecords = (records: readonly RadarRecord[], terms: readonly string[], max: number) =>
  records.filter((record) => {
    const haystack = `${record.category} ${record.topics.join(" ")}`.toLocaleLowerCase();
    return terms.some((term) => haystack.includes(term));
  }).slice(0, max);

export function buildRadarBriefing(
  feed: Pick<RadarFeed, "generatedAt" | "partial">,
  records: readonly RadarRecord[],
  profile: GuestProfile,
  cached: boolean,
): RadarBriefing {
  const ranked = rankRadarRecords(records, profile).map((entry) => entry.record);
  const sections: RadarBriefingSection[] = [
    { id: "top", records: ranked.slice(0, 5) },
    { id: "agents", records: sectionRecords(ranked, ["agent", "prompt"], 3) },
    { id: "qa", records: sectionRecords(ranked, ["evaluation", "testing", "qa", "safety"], 3) },
    { id: "israel", records: ranked.filter((record) => (record.israelRelevance ?? 0) >= 40).slice(0, 3) },
    { id: "tools", records: sectionRecords(ranked, ["tool", "open-source", "repository", "release"], 3) },
  ];
  const available = profile.briefingPreferences.enabled
    ? sections.filter((section) => section.records.length > 0)
    : [];
  return {
    generatedAt: feed.generatedAt,
    sourceCount: new Set(records.map((record) => record.sourceId)).size,
    partial: feed.partial,
    cached,
    sections: available,
    practicalIdeas: records.length && profile.briefingPreferences.enabled
      && profile.briefingPreferences.includePracticalIdeas
      ? ["compare-sources", "test-a-workflow", "update-a-quality-checklist"]
      : [],
  };
}

export function calculateWhatChanged(
  records: readonly RadarRecord[],
  profile: GuestProfile,
  options: { lastSeenAt?: string; sourceHealth?: readonly RadarSourceHealth[] } = {},
): {
  newImportant: RadarRecord[];
  updated: RadarRecord[];
  corrections: RadarRecord[];
  followed: RadarRecord[];
  impairedFollowedSources: RadarSourceHealth[];
} {
  const seen = new Map([...profile.readItems, ...profile.recentViews].map((item) => [item.id, item]));
  const lastSeen = Date.parse(options.lastSeenAt ?? profile.lastSeenAt);
  const publishedTime = (record: RadarRecord) =>
    Date.parse(record.publishedAt ?? `${record.publicationDate}T00:00:00Z`);
  const newSinceLastVisit = (record: RadarRecord) =>
    publishedTime(record) > lastSeen && !seen.has(record.canonicalId) && !record.historical;
  return {
    newImportant: records.filter((record) => newSinceLastVisit(record)
      && (record.relevanceScore >= 80 || record.category === "safety" || record.category === "governance")),
    updated: records.filter((record) => {
      const previous = seen.get(record.canonicalId);
      return Boolean(previous && previous.checksum !== record.checksum);
    }),
    corrections: records.filter((record) => record.publicationState === "corrected"
      || Boolean(record.correctionHistory?.length)),
    followed: records.filter((record) => newSinceLastVisit(record)
      && (record.topics.some((topic) => profile.selectedTopics.includes(topic))
        || profile.selectedSources.includes(record.sourceId))),
    impairedFollowedSources: (options.sourceHealth ?? []).filter((source) =>
      profile.selectedSources.includes(source.sourceId)
      && source.status !== "healthy" && source.status !== "disabled"),
  };
}
