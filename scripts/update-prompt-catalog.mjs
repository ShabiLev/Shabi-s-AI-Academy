import { writeFileSync } from "node:fs";
import { inspectCommittedCatalog, parseCsv } from "./catalog-tools.mjs";
const sourceUrl =
    "https://raw.githubusercontent.com/f/prompts.chat/main/prompts.csv",
  response = await fetch(sourceUrl);
if (!response.ok)
  throw new Error(`Source fetch failed: HTTP ${response.status}`);
const records = parseCsv(await response.text()),
  { selection, errors } = inspectCommittedCatalog(),
  normalized = new Map(records.map((r) => [r.act?.trim().toLowerCase(), r])),
  matched = selection.acceptedTitles.filter((t) =>
    normalized.has(t.toLowerCase()),
  );
const report = {
  generatedAt: new Date().toISOString(),
  sourceUrl,
  sourceRecords: records.length,
  selected: selection.acceptedTitles.length,
  exactSourceTitleMatches: matched.length,
  missingExactTitles: selection.acceptedTitles.filter(
    (t) => !matched.includes(t),
  ),
  validationErrors: errors,
  note: "Review only: prompt text is never executed and this command never writes localStorage, commits, or pushes.",
};
writeFileSync(
  "scripts/prompt-catalog-update-report.json",
  `${JSON.stringify(report, null, 2)}\n`,
);
console.log(JSON.stringify(report, null, 2));
