import type { HelpSection } from "./types";
export function searchHelp(
  items: HelpSection[],
  query: string,
  category = "all",
) {
  const q = query.trim().toLowerCase();
  return items.filter(
    (x) =>
      (category === "all" || x.category === category) &&
      (!q ||
        [x.titleHe, x.titleEn, x.summaryHe, x.summaryEn, ...x.keywords].some(
          (v) => v.toLowerCase().includes(q),
        )),
  );
}
export function findHelpAnchor(items: HelpSection[], id: string) {
  return items.find((x) => x.id === id);
}
