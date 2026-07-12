export function normalizeCatalogText(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Stable FNV-1a content fingerprint; this is duplicate detection, not cryptography. */
export function catalogContentHash(value: string): string {
  let hash = 0x811c9dc5;
  for (const character of normalizeCatalogText(value)) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
