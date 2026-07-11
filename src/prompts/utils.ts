import { evaluatePrompt } from "./promptQuality";
import type { Prompt, PromptFilters } from "./types";
export function filterPrompts(
  items: Prompt[],
  f: PromptFilters,
  categoryLabel = (s: string) => s,
) {
  const q = f.search.trim().toLowerCase();
  return items
    .filter(
      (p) =>
        (!q ||
          [
            p.title,
            p.description,
            p.task,
            p.tags.join(" "),
            categoryLabel(p.category),
          ].some((v) => v.toLowerCase().includes(q))) &&
        (f.category === "all" || p.category === f.category) &&
        (f.language === "all" || p.language === f.language) &&
        (!f.favoritesOnly || p.isFavorite),
    )
    .sort((a, b) =>
      f.sort === "title"
        ? a.title.localeCompare(b.title)
        : f.sort === "created"
          ? b.createdAt.localeCompare(a.createdAt)
          : f.sort === "quality"
            ? evaluatePrompt(b).score - evaluatePrompt(a).score
            : b.updatedAt.localeCompare(a.updatedAt),
    );
}
