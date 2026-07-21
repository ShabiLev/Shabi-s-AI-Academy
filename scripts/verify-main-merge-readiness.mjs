import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { evaluateMainMergeReadiness } from "./release-readiness-lib.mjs";
import { assessEvidenceIntegrity } from "./evidence-utils.mjs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const packageJson = readJson("package.json");
const release = readJson(".agent/state/release-status.json");
const quality = readJson(".agent/state/quality-status.json");
const issues = readJson(".agent/state/known-issues.json");
let evidence = {};
try { evidence = readJson("quality/execution/latest/summary.json").identity ?? {}; } catch {}
let linuxBaselineCount = 0;
try { linuxBaselineCount = readdirSync(join("e2e", "specs", "__screenshots__")).filter((file) => file.endsWith("-linux.png")).length; } catch {}
const headCommit = git("rev-parse", "HEAD");
const succeeds = (...args) => {
  try { execFileSync("git", args, { stdio: "ignore" }); return true; } catch { return false; }
};
const changedPaths = evidence.testedCommit
  ? git("diff", "--name-only", evidence.testedCommit, headCommit).split(/\r?\n/).filter(Boolean)
  : [];
const evidenceIntegrity = assessEvidenceIntegrity({
  ...evidence,
  headCommit,
  testedIsAncestor: succeeds("merge-base", "--is-ancestor", evidence.testedCommit, headCommit),
  evidenceIsAncestor: succeeds("merge-base", "--is-ancestor", evidence.evidenceCommit, headCommit),
  changedPaths,
});

const result = evaluateMainMergeReadiness({
  packageVersion: packageJson.version,
  releaseVersion: release.version,
  releaseStatus: release,
  qualityStatus: quality,
  knownIssues: issues.active,
  evidenceIdentity: evidence,
  headCommit,
  evidenceIntegrityValid: evidenceIntegrity.ok,
  workingTreeClean: !git("status", "--porcelain=v1"),
  linuxBaselineCount,
});
if (!result.ready) {
  console.error(`Main merge readiness BLOCKED:\n- ${result.blockers.join("\n- ")}`);
  process.exit(1);
}
console.log("Main merge readiness passed.");
