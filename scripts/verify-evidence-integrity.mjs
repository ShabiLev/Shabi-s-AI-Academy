import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assessRuntimeEvidence } from "./evidence-utils.mjs";
import { readJson, validateAgainstSchema } from "./agent-memory-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const summaryPath = path.join(root, "quality", "runtime", "execution", "latest", "summary.json");
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();

if (!existsSync(summaryPath)) {
  console.error("ERROR: runtime evidence is not generated");
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
const result = assessRuntimeEvidence(summary, { expectedSha: head, workspace: root });
result.errors.push(
  ...validateAgainstSchema(summary, readJson(path.join(root, ".agent", "schemas", "evidence-run.schema.json"))),
);
for (const name of ["environment.json", "commands.json", "summary.json", "test-results.json", "coverage-summary.json", "git-state-before.txt", "git-state-after.txt"]) {
  if (!existsSync(path.join(root, "quality", "runtime", "execution", "latest", name)))
    result.errors.push(`required runtime output is missing: ${name}`);
}
if (execFileSync("git", ["status", "--porcelain=v1"], { cwd: root, encoding: "utf8" }).trim()) {
  result.errors.push("working tree is dirty during integrity validation");
}
if (result.errors.length) {
  result.errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}
console.log(`Runtime evidence integrity passed for exact HEAD ${head}.`);
