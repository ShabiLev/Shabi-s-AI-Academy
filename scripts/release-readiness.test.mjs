import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { evaluateMainMergeReadiness } from "./release-readiness-lib.mjs";

const green = () => ({
  packageVersion: "1.4.0-beta.1", releaseVersion: "1.4.0-beta.1",
  releaseStatus: { releaseState: "ready", mergeReadiness: "ready" },
  qualityStatus: {
    unit: "passed", e2e: "passed", visual: "passed", accessibility: "passed", performance: "passed", pages: "passed", aos: "passed",
    manualReviews: { ux: { status: "approved" }, security: { status: "approved" }, content: { status: "approved" } },
  },
  evidenceIdentity: { testedCommit: "abc", evidenceCommit: "def", workingTreeCleanAtTest: true },
  headCommit: "abc", workingTreeClean: true, linuxBaselineCount: 82,
});
test("green state is merge-ready", () => assert.equal(evaluateMainMergeReadiness(green()).ready, true));
test("blocked state fails closed", () => { const input = green(); input.releaseStatus.releaseState = "blocked"; assert.equal(evaluateMainMergeReadiness(input).ready, false); });
test("stale evidence fails closed", () => { const input = green(); input.evidenceIdentity.testedCommit = "old"; assert.match(evaluateMainMergeReadiness(input).blockers.join(" "), /stale/); });
test("reviewed evidence-only lineage may follow the tested product commit", () => { const input = green(); input.evidenceIdentity.testedCommit = "product"; input.evidenceIntegrityValid = true; assert.equal(evaluateMainMergeReadiness(input).ready, true); });
test("dirty evidence and severe issues fail closed", () => { const input = green(); input.workingTreeClean = false; input.knownIssues = [{ id: "SEC-1", severity: "High", status: "active" }]; assert.equal(evaluateMainMergeReadiness(input).ready, false); });
test("CI keeps mandatory suites isolated and Pages consumes successful main CI", () => {
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");
  assert.match(ci, /functional-e2e:[\s\S]*npm run test:e2e:functional/);
  assert.match(ci, /cross-browser:[\s\S]*npm run test:e2e:cross-browser/);
  assert.match(ci, /visual-linux:[\s\S]*npm run test:visual/);
  assert.match(ci, /name: Restore Lighthouse artifact layout[\s\S]*name: performance-artifacts[\s\S]*path: quality\/generated\/lighthouse/);
  const pages = readFileSync(".github/workflows/deploy-pages.yml", "utf8");
  assert.match(pages, /workflow_run:[\s\S]*workflows: \[CI\]/);
  assert.match(pages, /head_branch == 'main'/);
  assert.match(pages, /EXPECTED_DEPLOY_SHA/);
});
test("reviewed visual workflow is guarded and read-only", () => {
  const workflow = readFileSync(".github/workflows/generate-visual-baselines.yml", "utf8");
  assert.match(workflow, /GENERATE_REVIEWED_LINUX_BASELINES/);
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /git push|git commit/);
});
