import { readFileSync } from "node:fs";
export const selectionPath = new URL(
  "./prompt-catalog-selection.json",
  import.meta.url,
);
export const catalogPath = new URL(
  "../src/prompts/catalog/starterCatalog.ts",
  import.meta.url,
);
export function readSelection() {
  return JSON.parse(readFileSync(selectionPath, "utf8"));
}
export function inspectCommittedCatalog() {
  const selection = readSelection(),
    source = [
      readFileSync(catalogPath, "utf8"),
      readFileSync(
        new URL(
          "../src/prompts/catalog/originalSourceRecords.ts",
          import.meta.url,
        ),
        "utf8",
      ),
    ].join("\n"),
    errors = [];
  const missing = selection.acceptedTitles.filter(
    (title) => !source.includes(`\"${title}\",`),
  );
  const duplicates = selection.acceptedTitles.filter(
    (title, index, values) => values.indexOf(title) !== index,
  );
  if (selection.license !== "CC0-1.0")
    errors.push("Catalog selection license must be CC0-1.0.");
  if (
    selection.acceptedTitles.length < 20 ||
    selection.acceptedTitles.length > 40
  )
    errors.push("Catalog count must be between 20 and 40.");
  if (missing.length)
    errors.push(`Missing committed entries: ${missing.join(", ")}`);
  if (duplicates.length)
    errors.push(`Duplicate selections: ${duplicates.join(", ")}`);
  if (
    !source.includes("catalogContentHash(") ||
    !source.includes("originalContent")
  )
    errors.push("Catalog entries must calculate deterministic content hashes.");
  if (!source.includes('safetyReviewStatus: "approved"'))
    errors.push("Catalog entries must be approved.");
  return { selection, errors };
}
export function parseCsv(text) {
  const rows = [];
  let row = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"' && quoted && text[i + 1] === '"') {
      field += '"';
      i += 1;
    } else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((v) => v.trim());
  return rows
    .slice(1)
    .filter((v) => v.length === headers.length)
    .map((v) => Object.fromEntries(headers.map((h, i) => [h, v[i]])));
}
