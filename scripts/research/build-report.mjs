import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { jsonFilesIn, readJsonSafe, ensureDir, repoRoot } from "./research-lib.mjs";
import { validateSources } from "./validate-source.mjs";
import { findDuplicates } from "./deduplicate-sources.mjs";
import { checkAllFreshness } from "./check-freshness.mjs";

function countReviewStatuses(files) {
  const counts = {};
  for (const file of files) {
    const { ok, data } = readJsonSafe(file);
    if (!ok) continue;
    const status = data.reviewStatus ?? "unknown";
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

export function buildReport(nowIso = new Date().toISOString()) {
  const sourceValidation = validateSources();
  const dupResult = findDuplicates();
  const freshness = checkAllFreshness(nowIso);
  const candidateFiles = jsonFilesIn("candidates");
  const reviewFiles = jsonFilesIn("reviews");
  const publishedFiles = jsonFilesIn("published");

  const candidateStatuses = countReviewStatuses(candidateFiles);
  const freshnessCounts = {};
  for (const f of freshness) freshnessCounts[f.freshness] = (freshnessCounts[f.freshness] ?? 0) + 1;

  const lines = [];
  lines.push(`# Research Pipeline Report`);
  lines.push("");
  lines.push(`Generated: ${nowIso}`);
  lines.push("");
  lines.push(`## Sources`);
  lines.push(`- Total: ${sourceValidation.fileCount}`);
  lines.push(`- Validation errors: ${sourceValidation.errors.length}`);
  lines.push(`- Possible duplicates: ${dupResult.duplicates.length}`);
  lines.push("");
  lines.push(`## Freshness`);
  for (const [status, count] of Object.entries(freshnessCounts)) {
    lines.push(`- ${status}: ${count}`);
  }
  if (freshness.length === 0) lines.push(`- No sources classified yet.`);
  lines.push("");
  lines.push(`## Candidates`);
  lines.push(`- Total: ${candidateFiles.length}`);
  for (const [status, count] of Object.entries(candidateStatuses)) {
    lines.push(`- ${status}: ${count}`);
  }
  lines.push("");
  lines.push(`## Reviews and published content`);
  lines.push(`- Review records: ${reviewFiles.length}`);
  lines.push(`- Published items: ${publishedFiles.length}`);
  lines.push("");
  if (sourceValidation.errors.length > 0) {
    lines.push(`## Validation errors`);
    for (const e of sourceValidation.errors) lines.push(`- ${e}`);
    lines.push("");
  }

  return lines.join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const text = buildReport();
  console.log(text);
  const outDir = ensureDir("reports");
  const outFile = path.join(outDir, "latest-research-report.md");
  writeFileSync(outFile, text, "utf8");
  console.log(`\nSaved to ${path.relative(repoRoot, outFile)}`);
  process.exit(0);
}
