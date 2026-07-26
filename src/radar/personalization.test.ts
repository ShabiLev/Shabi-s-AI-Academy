import { describe, expect, it } from "vitest";
import { createGuestProfile } from "../guest-profile";
import { buildRadarBriefing, calculateWhatChanged } from "./briefing";
import { rankRadarRecords } from "./personalization";
import type { RadarRecord } from "./records";

const base: RadarRecord = {
  id: "one", canonicalId: "one", title: { he: "עדכון", en: "Update" },
  summary: { he: "סיכום", en: "Summary" }, whyItMatters: { he: "חשוב", en: "Important" },
  affectedAudiences: ["developers"], sourceId: "openai", sourceName: "OpenAI",
  sourceUrl: "https://openai.com/index/example/", sourceTier: 1, sourceType: "release-notes",
  category: "models", topics: ["agents"], language: "multilingual",
  publicationDate: "2026-07-26", retrievalDate: "2026-07-26", lastVerifiedAt: "2026-07-26",
  freshness: "fresh", confidence: 95, relevanceScore: 90, historical: false, saved: false,
  provider: "test", checksum: `sha256:${"a".repeat(64)}`, status: "published", reviewed: true,
  translationStatus: "complete", israelRelevance: 70,
};

describe("local Radar personalization", () => {
  it("ranks deterministically from explicit preferences and keeps Latest independent", () => {
    const profile = { ...createGuestProfile(() => "2026-07-25T00:00:00Z", () => "profile-1"), selectedTopics: ["agents"] };
    const other = { ...base, id: "two", canonicalId: "two", topics: ["governance"], relevanceScore: 50 };
    const first = rankRadarRecords([other, base], profile, new Date("2026-07-26T12:00:00Z"));
    const second = rankRadarRecords([other, base], profile, new Date("2026-07-26T12:00:00Z"));
    expect(first).toEqual(second);
    expect(first[0].record.id).toBe("one");
    expect(first[0].reasons).toContain("topic:agents");
    expect([other, base].map((item) => item.id)).toEqual(["two", "one"]);
  });

  it("builds only from available feed records and detects checksum updates", () => {
    const profile = {
      ...createGuestProfile(() => "2026-07-25T00:00:00Z", () => "profile-1"),
      selectedTopics: ["agents"],
      readItems: [{ id: "one", checksum: `sha256:${"b".repeat(64)}`, at: "2026-07-25T00:00:00Z" }],
    };
    const briefing = buildRadarBriefing({ generatedAt: "2026-07-26T12:00:00Z", partial: true }, [base], profile, true);
    expect(briefing).toMatchObject({ sourceCount: 1, partial: true, cached: true });
    expect(briefing.sections[0].records[0].id).toBe("one");
    expect(calculateWhatChanged([base], profile).updated).toEqual([base]);
    expect(buildRadarBriefing({ generatedAt: "2026-07-26T12:00:00Z", partial: false }, [], profile, false).sections).toEqual([]);
  });

  it("diversifies repeated sources and excludes old or already-seen cache from what changed", () => {
    const profile = {
      ...createGuestProfile(() => "2026-07-26T09:00:00Z", () => "profile-1"),
      selectedSources: ["followed-source"],
      readItems: [{ id: "seen", checksum: `sha256:${"c".repeat(64)}`, at: "2026-07-26T09:05:00Z" }],
    };
    const sameSource = Array.from({ length: 4 }, (_, index) => ({
      ...base,
      id: `same-${index}`,
      canonicalId: `same-${index}`,
      relevanceScore: 100 - index,
      sourceId: "same-source",
    }));
    const diverse = { ...base, id: "diverse", canonicalId: "diverse", sourceId: "other-source", relevanceScore: 88 };
    expect(rankRadarRecords([...sameSource, diverse], profile, new Date("2026-07-26T12:00:00Z"))
      .findIndex((entry) => entry.record.id === "diverse")).toBeLessThan(3);

    const newFollowed = {
      ...base,
      id: "followed",
      canonicalId: "followed",
      sourceId: "followed-source",
      publishedAt: "2026-07-26T10:00:00Z",
    };
    const seen = { ...newFollowed, id: "seen", canonicalId: "seen" };
    const oldCache = { ...newFollowed, id: "old", canonicalId: "old", historical: true };
    const changed = calculateWhatChanged([newFollowed, seen, oldCache], profile, {
      sourceHealth: [{ sourceId: "followed-source", status: "failed", checkedAt: "2026-07-26T11:00:00Z", itemCount: 0 }],
    });
    expect(changed.followed).toEqual([newFollowed]);
    expect(changed.newImportant).toEqual([newFollowed]);
    expect(changed.impairedFollowedSources).toHaveLength(1);
  });
});
