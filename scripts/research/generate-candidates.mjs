import { pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { jsonFilesIn, readJsonSafe, ensureDir, repoRoot } from "./research-lib.mjs";

// Turns verified claims into content candidates awaiting human review. This
// is a deterministic, explicit transform — not a generative/LLM step — so
// it is safe to run without approval. Every candidate starts at
// reviewStatus "pendingReview" and translationStatus "notTranslated"; no
// script may move a candidate to "published".
export function generateCandidates(nowIso = new Date().toISOString()) {
  const claimFiles = jsonFilesIn("claims");
  const created = [];
  const skipped = [];
  const outDir = ensureDir("candidates");

  for (const file of claimFiles) {
    const rel = path.relative(repoRoot, file);
    const { ok, data } = readJsonSafe(file);
    if (!ok) {
      skipped.push(`${rel}: invalid JSON`);
      continue;
    }
    if (data.verificationStatus !== "verified") {
      skipped.push(`${rel}: verificationStatus is "${data.verificationStatus ?? "unset"}", not "verified" — no candidate generated`);
      continue;
    }

    const candidateId = `candidate-${data.id ?? path.basename(file, ".json")}`;
    const candidate = {
      id: candidateId,
      title: data.statement?.slice(0, 80) ?? "Untitled candidate",
      summary: data.statement ?? "",
      sourceIds: [data.sourceId].filter(Boolean),
      reviewStatus: "pendingReview",
      freshnessStatus: "unknown",
      translationStatus: "notTranslated",
      confidence: data.confidence ?? "unspecified",
      generatedBy: "scripts/research/generate-candidates.mjs",
      version: "1.0.0",
      createdDate: nowIso,
    };

    const outFile = path.join(outDir, `${candidateId}.json`);
    writeFileSync(outFile, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
    created.push(path.relative(repoRoot, outFile));
  }

  return { created, skipped };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { created, skipped } = generateCandidates();
  console.log(`Generated ${created.length} candidate(s).`);
  for (const c of created) console.log(`  wrote ${c}`);
  for (const s of skipped) console.log(`  skipped: ${s}`);
  if (created.length === 0 && skipped.length === 0) {
    console.log("No claims found under research/claims/ yet — nothing to do.");
  }
  process.exit(0);
}
