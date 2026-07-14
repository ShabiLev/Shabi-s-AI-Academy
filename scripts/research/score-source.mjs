import { pathToFileURL } from "node:url";
import path from "node:path";
import { jsonFilesIn, readJsonSafe, repoRoot } from "./research-lib.mjs";

// Deterministic baseline scores by tier per source-ranking.md. These are a
// starting point an agent should adjust downward for archived/deprecated/
// low-activity sources — never upward beyond the tier ceiling.
const TIER_BASELINE = {
  tier1: { authorityScore: 95, relevanceScore: 80 },
  tier2: { authorityScore: 78, relevanceScore: 70 },
  tier3: { authorityScore: 55, relevanceScore: 60 },
  tier4: { authorityScore: 30, relevanceScore: 40 },
};

export function scoreSource(data) {
  const baseline = TIER_BASELINE[data.qualityTier] ?? TIER_BASELINE.tier4;
  let authorityScore = baseline.authorityScore;
  let relevanceScore = baseline.relevanceScore;

  if (data.archived) authorityScore -= 20;
  if (data.deprecated) authorityScore -= 15;
  if (data.securityStatus === "advisory") relevanceScore += 10;

  return {
    authorityScore: Math.max(0, Math.min(100, authorityScore)),
    relevanceScore: Math.max(0, Math.min(100, relevanceScore)),
  };
}

export function scoreAllSources() {
  const files = jsonFilesIn("sources");
  const results = [];
  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const { ok, data } = readJsonSafe(file);
    if (!ok) continue;
    results.push({ file: rel, id: data.id, ...scoreSource(data) });
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = scoreAllSources();
  if (results.length === 0) {
    console.log("No sources to score yet.");
  } else {
    for (const r of results) {
      console.log(`${r.file} (${r.id ?? "no id"}): authority=${r.authorityScore} relevance=${r.relevanceScore}`);
    }
  }
  console.log(
    "\nThese scores are a deterministic starting point per source-ranking.md tiers — review and adjust manually, do not treat as final without human review for any critical claim.",
  );
  process.exit(0);
}
