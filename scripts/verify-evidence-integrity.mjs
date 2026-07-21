import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assessEvidenceIntegrity } from "./evidence-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const summary = JSON.parse(
  readFileSync(path.join(root, "quality", "execution", "latest", "summary.json"), "utf8"),
);
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const succeeds = (...args) => {
  try {
    execFileSync("git", args, { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
const identity = summary.identity ?? {};
const headCommit = git("rev-parse", "HEAD");
const changedPaths = identity.testedCommit
  ? git("diff", "--name-only", identity.testedCommit, headCommit)
      .split(/\r?\n/)
      .filter(Boolean)
  : [];
const result = assessEvidenceIntegrity({
  ...identity,
  headCommit,
  testedIsAncestor: succeeds("merge-base", "--is-ancestor", identity.testedCommit, headCommit),
  evidenceIsAncestor: succeeds("merge-base", "--is-ancestor", identity.evidenceCommit, headCommit),
  changedPaths,
});
if (git("status", "--porcelain=v1")) result.errors.push("working tree is dirty during integrity validation");
result.ok = result.errors.length === 0;
if (!result.ok) {
  result.errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exit(1);
}
console.log(
  `Evidence integrity passed: tested ${identity.testedCommit}; evidence ${identity.evidenceCommit}; HEAD ${headCommit}.`,
);
