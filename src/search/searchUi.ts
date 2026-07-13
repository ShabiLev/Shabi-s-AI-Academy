import { normalizeSearchText } from "./searchRanking";
export interface HighlightSegment { text: string; matched: boolean }
export function createSafeHighlight(value: string, query: string): HighlightSegment[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [{ text: value, matched: false }];
  const terms = normalizedQuery.split(" ").filter(Boolean).sort((a, b) => b.length - a.length);
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escaped.length) return [{ text: value, matched: false }];
  const pattern = new RegExp(`(${escaped.join("|")})`, "giu");
  return value.split(pattern).filter(Boolean).map((text) => ({ text, matched: terms.some((term) => normalizeSearchText(text) === term) }));
}

