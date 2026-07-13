import type { SearchDocument, SearchMatchedField } from "./types";

const HEBREW_MARKS = /[\u0591-\u05C7]/g;
const PUNCTUATION = /[^\p{L}\p{N}\s-]/gu;

export function normalizeSearchText(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(HEBREW_MARKS, "")
    .replace(/[ךםןףץ]/g, (letter) => ({ ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" })[letter] ?? letter)
    .replace(PUNCTUATION, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function editDistanceAtMostOne(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1 || Math.min(left.length, right.length) < 4) return false;
  let i = 0, j = 0, edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) { i += 1; j += 1; continue; }
    edits += 1; if (edits > 1) return false;
    if (left.length > right.length) i += 1; else if (right.length > left.length) j += 1; else { i += 1; j += 1; }
  }
  return edits + Number(i < left.length || j < right.length) <= 1;
}

function fieldScore(query: string, value: string, weight: number): number {
  const normalized = normalizeSearchText(value);
  if (!normalized || !query) return 0;
  if (normalized === query) return weight * 8;
  if (normalized.startsWith(query)) return weight * 5;
  if (normalized.includes(query)) return weight * 3;
  const words = normalized.split(" ");
  const queryWords = query.split(" ");
  const partials = queryWords.filter((part) => words.some((word) => word.startsWith(part))).length;
  const typos = queryWords.filter((part) => words.some((word) => editDistanceAtMostOne(part, word))).length;
  return partials * weight + typos * weight * 0.55;
}

export function rankDocument(document: SearchDocument, rawQuery: string, language: "he" | "en", recentIds: readonly string[] = [], favoriteIds: readonly string[] = []): { score: number; matchedFields: SearchMatchedField[] } {
  const query = normalizeSearchText(rawQuery);
  const fields: Array<[SearchMatchedField, string, number]> = [
    ["title", `${document.title[language]} ${document.title[language === "he" ? "en" : "he"]}`, 12],
    ["description", `${document.description[language]} ${document.description[language === "he" ? "en" : "he"]}`, 4],
    ["tags", document.tags.join(" "), 7], ["keywords", document.keywords.join(" "), 5],
  ];
  const matchedFields: SearchMatchedField[] = [];
  let score = 0;
  for (const [field, value, weight] of fields) { const next = fieldScore(query, value, weight); if (next > 0) matchedFields.push(field); score += next; }
  if (score > 0 && (document.favorite || favoriteIds.includes(document.id))) score += 18;
  if (score > 0 && (document.recent || recentIds.includes(document.id))) score += Math.max(4, 14 - Math.max(0, recentIds.indexOf(document.id)));
  if (!query && (document.recent || recentIds.includes(document.id))) score = Math.max(4, 14 - Math.max(0, recentIds.indexOf(document.id)));
  return { score, matchedFields };
}
