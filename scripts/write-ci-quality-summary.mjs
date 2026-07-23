import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const gates = [
  ["Quality core", "QUALITY_CORE"],
  ["Functional E2E", "FUNCTIONAL_E2E"],
  ["Cross-browser E2E", "CROSS_BROWSER"],
  ["Accessibility", "ACCESSIBILITY"],
  ["Visual Linux", "VISUAL_LINUX"],
  ["Performance", "PERFORMANCE"],
];
const rows = gates.map(([label, key]) => ({ label, result: process.env[key] ?? "missing" }));
let reportRecommendation = "not available";
try {
  const report = JSON.parse(readFileSync("quality/generated/latest-quality-report.json", "utf8"));
  reportRecommendation = report.recommendation ?? report.releaseRecommendation ?? "not recorded";
} catch {}

// visual-linux-candidates is label-gated and intentionally not one of this
// job's required `needs` — it exists to produce reviewable screenshots, not
// to gate merge. It still uploads a small status artifact (see ci.yml) so
// this summary can say whether candidates exist for a human to review when
// the mandatory visual gate has failed, rather than being silent about it.
let candidateStatus = null;
try {
  const manifest = JSON.parse(
    readFileSync("quality/runtime/ci/visual-linux-candidates/manifest.json", "utf8"),
  );
  candidateStatus = manifest.conclusion ?? "unknown";
} catch {}
const visualFailed = (process.env.VISUAL_LINUX ?? "missing") !== "success";
let visualNote = null;
if (visualFailed) {
  visualNote = candidateStatus === "success"
    ? "Visual comparison failed; candidate generation succeeded — human visual approval required in the visual-linux-candidates artifact before this can be resolved. Release remains blocked."
    : candidateStatus
      ? `Visual comparison failed; candidate generation also did not succeed (${candidateStatus}) — inspect visual-linux-candidates directly, its screenshots cannot be trusted for review. Release remains blocked.`
      : "Visual comparison failed; no candidate-generation run is available for this SHA (add the generate-linux-visual-candidates label to a PR to produce one). Release remains blocked.";
}

const markdown = [
  "# CI quality summary",
  "",
  "| Mandatory gate | Result |",
  "| --- | --- |",
  ...rows.map(({ label, result }) => `| ${label} | ${result} |`),
  "",
  `Quality report recommendation: **${reportRecommendation}**`,
  "",
  ...(visualNote ? [visualNote, ""] : []),
].join("\n");
mkdirSync("quality/generated", { recursive: true });
writeFileSync("quality/generated/ci-quality-summary.md", markdown, "utf8");
writeFileSync("quality/generated/ci-quality-summary.json", `${JSON.stringify({
  schemaVersion: 1,
  repository: process.env.GITHUB_REPOSITORY ?? null,
  workflowName: process.env.GITHUB_WORKFLOW ?? null,
  workflowRunId: process.env.GITHUB_RUN_ID ?? null,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
  headSha: process.env.GITHUB_SHA ?? null,
  sourceBranch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || null,
  targetBranch: process.env.GITHUB_BASE_REF || "main",
  generatedAt: new Date().toISOString(),
  gates: Object.fromEntries(gates.map(([label, key]) => [label, process.env[key] ?? "missing"])),
  reportRecommendation,
  visualCandidateStatus: candidateStatus,
  visualNote,
  conclusion: rows.every(({ result }) => result === "success") ? "success" : "failure",
}, null, 2)}\n`, "utf8");
if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, markdown, { flag: "a" });

const failed = rows.filter(({ result }) => result !== "success");
if (failed.length) {
  console.error(`Mandatory jobs did not succeed: ${failed.map(({ label, result }) => `${label}=${result}`).join(", ")}`);
  process.exit(1);
}
console.log("All mandatory CI jobs succeeded.");
