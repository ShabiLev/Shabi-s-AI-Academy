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

    const candidateType = data.candidateType;
    if (!["knowledge", "lesson", "prompt", "agent", "workflow", "radar"].includes(candidateType)) {
      skipped.push(`${rel}: candidateType is missing or unsupported`);
      continue;
    }
    const candidateId = `candidate-${data.id ?? path.basename(file, ".json")}`;
    const date = nowIso.slice(0, 10);
    const base = {
      id: candidateId,
      title: data.statement?.slice(0, 80) ?? "Untitled candidate",
      summary: data.statement ?? "",
      sourceIds: [data.sourceId].filter(Boolean),
      reviewStatus: "pendingReview",
      freshnessStatus: "current",
      translationStatus: "notStarted",
      confidence: typeof data.confidence === "number" ? data.confidence : 0,
      generatedBy: { agent: "deterministic-research-pipeline", generatedDate: date },
      version: "1.0.0",
      createdDate: date,
    };
    const variants = {
      knowledge: () => {
        const { confidence, createdDate, ...knowledge } = base;
        return knowledge;
      },
      lesson: () => ({ ...base, lessonSlugSuggestion: candidateId.replace(/^candidate-/, "") }),
      prompt: () => ({ ...base, promptText: data.statement ?? "", category: "research-seed" }),
      agent: () => ({ ...base, role: data.statement ?? "", allowedTools: [], riskTier: "low" }),
      workflow: () => ({ ...base, steps: [{ order: 1, description: data.statement ?? "Review the cited source." }] }),
      radar: () => ({ ...base, radarCategory: "framework", impactLevel: "medium" }),
    };
    const candidate = variants[candidateType]();

    const isSeed = rel.split(path.sep).includes("seed");
    const outDir = ensureDir(isSeed ? path.join("candidates", "seed", candidateType) : path.join("candidates", candidateType));
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
