import { catalogContentHash, normalizeCatalogText } from "./catalogHash";
import type { CatalogEntry } from "./types";

export function validateCatalogEntry(value: unknown): string[] {
  if (!value || typeof value !== "object") return ["Malformed record"];
  const entry = value as CatalogEntry;
  const errors: string[] = [];
  if (!entry.title?.trim()) errors.push("Missing title");
  if (!entry.prompt?.trim()) errors.push("Missing prompt");
  if (entry.title?.trim() && !entry.prompt?.trim())
    errors.push("Title-only record");
  if (entry.sourceLicense !== "CC0-1.0") errors.push("Invalid license");
  if (entry.safetyReviewStatus !== "approved")
    errors.push("Entry is not approved");
  if (
    entry.originalContent &&
    entry.sourceContentHash !== catalogContentHash(entry.originalContent)
  )
    errors.push("Hash mismatch");
  return errors;
}

export function validateCatalog(entries: readonly CatalogEntry[]): string[] {
  const errors = entries.flatMap((entry, index) =>
    validateCatalogEntry(entry).map((error) => `${index}: ${error}`),
  );
  const ids = new Set<string>();
  const bodies = new Set<string>();
  for (const entry of entries) {
    if (ids.has(entry.sourceOriginalId))
      errors.push(`Duplicate source ID: ${entry.sourceOriginalId}`);
    ids.add(entry.sourceOriginalId);
    const body = normalizeCatalogText(entry.prompt);
    if (bodies.has(body)) errors.push(`Duplicate prompt body: ${entry.title}`);
    bodies.add(body);
  }
  return errors;
}
