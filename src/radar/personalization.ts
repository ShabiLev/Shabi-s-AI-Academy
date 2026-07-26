import type { GuestProfile } from "../guest-profile";
import type { RadarRecord } from "./records";

export interface RankedRadarRecord {
  readonly record: RadarRecord;
  readonly score: number;
  readonly reasons: readonly string[];
}

export function rankRadarRecords(
  records: readonly RadarRecord[],
  profile: GuestProfile,
  now = new Date(),
): RankedRadarRecord[] {
  const feedback = new Map(profile.recommendationFeedback.map((item) => [item.itemId, item.value]));
  const recent = new Set(profile.recentViews.map((item) => item.id));
  const favorites = new Set(profile.favoriteIds);
  const ranked = records.map((record) => {
    const reasons: string[] = [];
    let score = record.relevanceScore * 0.35 + record.confidence * 0.2;
    const topicMatches = record.topics.filter((topic) => profile.selectedTopics.includes(topic));
    if (topicMatches.length) {
      score += Math.min(20, topicMatches.length * 8);
      reasons.push(`topic:${topicMatches[0]}`);
    }
    if (profile.selectedSources.includes(record.sourceId)) {
      score += 14;
      reasons.push(`source:${record.sourceName}`);
    }
    if (favorites.has(record.canonicalId)) {
      score += 10;
      reasons.push("saved");
    }
    if (recent.has(record.canonicalId)) score += 3;
    if (feedback.get(record.canonicalId) === "useful") {
      score += 8;
      reasons.push("useful-feedback");
    }
    if (feedback.get(record.canonicalId) === "not-useful") score -= 12;
    const text = `${record.title.en} ${record.title.he} ${record.topics.join(" ")}`.toLocaleLowerCase();
    if (profile.followedKeywords.some((keyword) => text.includes(keyword.toLocaleLowerCase()))) {
      score += 12;
      reasons.push("followed-keyword");
    }
    const ageDays = Math.max(0, (now.getTime() - Date.parse(`${record.publicationDate}T00:00:00Z`)) / 86_400_000);
    score += Math.max(0, 14 - ageDays * 2);
    score += (record.israelRelevance ?? 0) * 0.12;
    if ((record.israelRelevance ?? 0) >= 60) reasons.push("israel-relevance");
    if (record.category === "safety" || record.category === "governance") {
      score += 5;
      reasons.push("important-update");
    }
    return { record, score: Math.round(score * 100) / 100, reasons };
  }).sort((left, right) => right.score - left.score
    || right.record.publicationDate.localeCompare(left.record.publicationDate)
    || left.record.canonicalId.localeCompare(right.record.canonicalId));

  const sourceCounts = new Map<string, number>();
  const remaining = [...ranked];
  const diversified: RankedRadarRecord[] = [];
  while (remaining.length) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const repeatedSourceCount = sourceCounts.get(candidate.record.sourceId) ?? 0;
      const adjustedScore = candidate.score - Math.max(0, repeatedSourceCount - 1) * 8;
      if (adjustedScore > bestAdjustedScore) {
        bestIndex = index;
        bestAdjustedScore = adjustedScore;
      }
    }
    const [selected] = remaining.splice(bestIndex, 1);
    diversified.push(selected);
    sourceCounts.set(selected.record.sourceId, (sourceCounts.get(selected.record.sourceId) ?? 0) + 1);
  }
  return diversified;
}

export function recommendationExplanation(reasons: readonly string[], language: "he" | "en"): string {
  if (!reasons.length) return language === "he" ? "עדכון חדש ואמין ממקור מאושר" : "A fresh, reliable update from an approved source";
  const labels: Record<string, { he: string; en: string }> = {
    saved: { he: "שמרת עדכונים דומים", en: "You saved similar updates" },
    "useful-feedback": { he: "סימנת עדכונים דומים כמועילים", en: "You marked similar updates useful" },
    "followed-keyword": { he: "מתאים למילת מפתח שבמעקב", en: "Matches a followed keyword" },
    "israel-relevance": { he: "בעל רלוונטיות לישראל", en: "Relevant to Israel" },
    "important-update": { he: "עדכון בטיחות או מדיניות חשוב", en: "Important safety or policy update" },
  };
  const reason = reasons[0];
  if (reason.startsWith("topic:")) {
    const topic = reason.slice(6);
    return language === "he" ? `מתאים לתחום ${topic} שבחרת` : `Matches your ${topic} interest`;
  }
  if (reason.startsWith("source:")) {
    const source = reason.slice(7);
    return language === "he" ? `ממקור ${source} שבמעקב` : `From followed source ${source}`;
  }
  return labels[reason]?.[language] ?? labels["important-update"][language];
}
