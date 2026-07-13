import { emptySearchFilters, type SearchDocument, type SearchGroup, type SearchOptions, type SearchResult } from "./types";
import { normalizeSearchText, rankDocument } from "./searchRanking";

export function searchDocuments(documents: readonly SearchDocument[], query: string, options: SearchOptions): SearchResult[] {
  const filters = { ...emptySearchFilters, ...options.filters };
  const normalizedQuery = normalizeSearchText(query);
  const recentIds = options.recentIds ?? [];
  const favoriteIds = options.favoriteIds ?? [];
  return documents.filter((document) => {
    if (filters.entityTypes.length && !filters.entityTypes.includes(document.entityType)) return false;
    if (filters.category !== "all" && document.category !== filters.category) return false;
    if (filters.language !== "all" && document.language && document.language !== "mixed" && document.language !== filters.language) return false;
    if (filters.favoritesOnly && !document.favorite && !favoriteIds.includes(document.id)) return false;
    if (filters.recentOnly && !document.recent && !recentIds.includes(document.id)) return false;
    return filters.availability === "all" || document.availability === filters.availability;
  }).map((document) => ({ ...document, ...rankDocument(document, normalizedQuery, options.language, recentIds, favoriteIds) }))
    .filter((result) => normalizedQuery ? result.score > 0 : result.recent || recentIds.includes(result.id))
    .sort((left, right) => right.score - left.score || right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id))
    .slice(0, Math.min(Math.max(options.limit ?? 80, 1), 200));
}

export function groupSearchResults(results: readonly SearchResult[]): SearchGroup[] {
  const groups = new Map<SearchResult["entityType"], SearchResult[]>();
  for (const result of results) groups.set(result.entityType, [...(groups.get(result.entityType) ?? []), result]);
  return [...groups].map(([entityType, values]) => ({ entityType, results: values }));
}

