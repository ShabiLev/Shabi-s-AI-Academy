import { normalizeCatalogText } from "./catalogHash";
import type { CatalogEntry, CatalogFilters } from "./types";

export const defaultCatalogFilters: CatalogFilters = {
  search: "",
  category: "all",
  language: "all",
  sort: "title",
};

export function filterCatalog(
  entries: readonly CatalogEntry[],
  filters: CatalogFilters,
): CatalogEntry[] {
  const query = normalizeCatalogText(filters.search);
  return entries
    .filter(
      (entry) =>
        (!query ||
          [
            entry.title,
            entry.description,
            entry.prompt,
            entry.tags.join(" "),
          ].some((value) => normalizeCatalogText(value).includes(query))) &&
        (filters.category === "all" || entry.category === filters.category) &&
        (filters.language === "all" || entry.language === filters.language),
    )
    .sort((a, b) =>
      filters.sort === "category"
        ? a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
        : a.title.localeCompare(b.title),
    );
}
