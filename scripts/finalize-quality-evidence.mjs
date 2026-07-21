import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isEvidenceMetadataPath } from "./evidence-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const latest = path.join(root, "quality", "execution", "latest");
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

if (git("status", "--porcelain=v1")) {
  throw new Error("Commit the generated Evidence and Agent Memory files before finalizing evidenceCommit.");
}

const summaryPath = path.join(latest, "summary.json");
const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
const testedCommit = summary.identity?.testedCommit;
const evidenceCommit = git("rev-parse", "HEAD");
const parentCommit = git("rev-parse", "HEAD^");
const changedPaths = git("diff", "--name-only", testedCommit, evidenceCommit)
  .split(/\r?\n/)
  .filter(Boolean);
const disallowed = changedPaths.filter((file) => !isEvidenceMetadataPath(file));

if (!testedCommit || disallowed.length) {
  throw new Error(
    `Evidence commit contains non-metadata changes: ${disallowed.join(", ") || "testedCommit is missing"}`,
  );
}

summary.identity.evidenceCommit = evidenceCommit;
summary.identity.parentCommit = parentCommit;
summary.identity.generatedAt = new Date().toISOString();
summary.identity.integrityValidation = "pendingPostEvidenceCommit";
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

for (const file of ["summary.md", "README.md"]) {
  const target = path.join(latest, file);
  let text = readFileSync(target, "utf8");
  text = text
    .replace(/(^- Evidence commit: ).*$/m, `$1${evidenceCommit}`)
    .replace(/(^- Parent commit: ).*$/m, `$1${parentCommit}`)
    .replace(/(^- Generated at: ).*$/m, `$1${summary.identity.generatedAt}`);
  if (!text.includes("Integrity validation:"))
    text = text.replace(
      /(^- Working tree clean at test:.*$)/m,
      "$1\n- Integrity validation: pending post-evidence commit",
    );
  writeFileSync(target, text, "utf8");
}

console.log(`Finalized evidence identity for ${evidenceCommit}; tested commit ${testedCommit}.`);
