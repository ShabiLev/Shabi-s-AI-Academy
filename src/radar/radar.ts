import { radarSourceHosts } from "./catalog";
import type { RadarCategory, RadarHorizon, RadarItem } from "./types";

export interface RadarFilters {
  readonly query: string;
  readonly category: RadarCategory | "all";
  readonly horizon: RadarHorizon | "all";
}

export function filterRadarItems(items: readonly RadarItem[], filters: RadarFilters, language: "he" | "en") {
  const query = filters.query.trim().toLocaleLowerCase(language);
  return items.filter((item) => {
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.horizon !== "all" && item.horizon !== filters.horizon) return false;
    if (!query) return true;
    return [item.publisher, item.title[language], item.summary[language], item.implication[language]]
      .some((value) => value.toLocaleLowerCase(language).includes(query));
  });
}

export function newestVerification(items: readonly RadarItem[]) {
  return items.reduce((latest, item) => item.verifiedAt > latest ? item.verifiedAt : latest, "");
}

export function isRadarSnapshotStale(items: readonly RadarItem[], today: string, maxAgeDays = 90) {
  const latest = newestVerification(items);
  if (!latest) return true;
  const age = Date.parse(today + "T00:00:00Z") - Date.parse(latest + "T00:00:00Z");
  return age > maxAgeDays * 86_400_000;
}

export function validateRadarCatalog(items: readonly RadarItem[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) errors.push(`Duplicate id: ${item.id}`);
    ids.add(item.id);
    let url: URL | undefined;
    try { url = new URL(item.sourceUrl); } catch { errors.push(`Invalid URL: ${item.id}`); }
    if (url && (url.protocol !== "https:" || !radarSourceHosts.includes(url.hostname as (typeof radarSourceHosts)[number]))) errors.push(`Unapproved source: ${item.id}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.publishedAt) || !/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt)) errors.push(`Invalid date: ${item.id}`);
    if (!item.title.he.trim() || !item.title.en.trim() || !item.summary.he.trim() || !item.summary.en.trim() || !item.implication.he.trim() || !item.implication.en.trim()) errors.push(`Missing translation: ${item.id}`);
  }
  return errors;
}
