import { pathToFileURL } from "node:url";
import path from "node:path";
import { jsonFilesIn, readJsonSafe, daysBetween, repoRoot } from "./research-lib.mjs";

// Implements the day-based rules from .agent/research/freshness-policy.md
// for the two source types that are purely age-driven (news, generic web
// content). Framework docs, repositories, papers, and standards need
// additional context this script cannot infer from a JSON file alone —
// those are flagged for manual classification instead of guessed.
export function classifyFreshness(source, nowIso) {
  const type = source.sourceType;
  const age = daysBetween(source.retrievalDate ?? source.publicationDate, nowIso);

  if (type === "paper") return "requiresManualReview: do not classify papers as stale by age alone";
  if (type === "standard") return "requiresManualReview: track version and effective date";
  if (type === "repository") return "requiresManualReview: classify by releases/commits/issue activity";
  if (type === "documentation") return "requiresManualReview: current only if it matches the latest supported major version";

  if (age === null) return "unknown: missing or invalid date";
  if (age <= 14) return "current";
  if (age <= 45) return "aging";
  return "stale";
}

export function checkAllFreshness(nowIso = new Date().toISOString()) {
  const files = jsonFilesIn("sources");
  const results = [];
  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const { ok, data } = readJsonSafe(file);
    if (!ok) continue;
    results.push({ file: rel, id: data.id, freshness: classifyFreshness(data, nowIso) });
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = checkAllFreshness();
  if (results.length === 0) {
    console.log("No sources to classify yet.");
  } else {
    for (const r of results) console.log(`${r.file} (${r.id ?? "no id"}): ${r.freshness}`);
  }
  process.exit(0);
}
