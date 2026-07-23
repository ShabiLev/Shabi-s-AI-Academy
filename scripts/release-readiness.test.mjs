import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { REQUIRED_CI_JOBS, evaluateWorkflowRun, selectExactRun } from "./release-readiness-lib.mjs";

const successRun = { id: 20, head_sha: "abc", status: "completed", conclusion: "success" };
const successJobs = () => REQUIRED_CI_JOBS.map((name) => ({ name, status: "completed", conclusion: "success" }));

test("exact successful run and mandatory jobs are merge-ready", () => {
  assert.equal(evaluateWorkflowRun({ expectedSha: "abc", run: successRun, jobs: successJobs() }).ready, true);
});
test("a successful older SHA cannot satisfy current HEAD", () => {
  assert.equal(evaluateWorkflowRun({ expectedSha: "new", run: successRun, jobs: successJobs() }).ready, false);
  assert.equal(selectExactRun([successRun], "new"), null);
});
test("latest attempt for the exact SHA wins even while in progress", () => {
  const latest = { ...successRun, id: 21, run_attempt: 2, status: "in_progress", conclusion: null };
  assert.equal(selectExactRun([{ ...successRun, run_attempt: 1 }, latest], "abc").id, 21);
  assert.equal(evaluateWorkflowRun({ expectedSha: "abc", run: latest, jobs: successJobs() }).ready, false);
});
for (const conclusion of ["failure", "cancelled", "skipped", "neutral", "action_required", "timed_out", null]) {
  test(`mandatory ${conclusion ?? "missing conclusion"} status blocks`, () => {
    const jobs = successJobs();
    jobs[0] = { ...jobs[0], conclusion };
    assert.equal(evaluateWorkflowRun({ expectedSha: "abc", run: successRun, jobs }).ready, false);
  });
}
for (const status of ["queued", "in_progress", "pending"]) {
  test(`mandatory ${status} state blocks`, () => {
    const jobs = successJobs();
    jobs[0] = { ...jobs[0], status, conclusion: null };
    assert.equal(evaluateWorkflowRun({ expectedSha: "abc", run: successRun, jobs }).ready, false);
  });
}
test("missing run and missing mandatory job block", () => {
  assert.equal(evaluateWorkflowRun({ expectedSha: "abc", run: null }).ready, false);
  assert.equal(evaluateWorkflowRun({ expectedSha: "abc", run: successRun, jobs: successJobs().slice(1) }).ready, false);
});
test("readiness uses GitHub REST and blocks when it cannot query", () => {
  const script = readFileSync("scripts/verify-main-merge-readiness.mjs", "utf8");
  assert.match(script, /api\.github\.com/);
  assert.match(script, /GitHub status is unverified/);
  assert.doesNotMatch(script, /quality\/execution\/latest|evidenceCommit|pendingPostEvidenceCommit/);
});
test("CI structure is isolated, exact-SHA, and fail-closed", () => {
  const ci = readFileSync(".github/workflows/ci.yml", "utf8");
  for (const job of REQUIRED_CI_JOBS) assert.match(ci, new RegExp(`(?:^|\\n)  ${job}:`));
  assert.match(ci, /quality-summary:[\s\S]*needs: \[quality-core, functional-e2e, cross-browser, accessibility, visual-linux, performance\][\s\S]*if: always\(\)/);
  assert.match(ci, /Verify exact triggering SHA/);
  assert.match(ci, /write-ci-job-manifest\.mjs/);
  // update-snapshots must never appear in a mandatory (quality-summary "needs")
  // job — it may only exist inside the label-gated, non-required
  // visual-linux-candidates job, which never runs on push/main, never commits
  // or pushes, and only ever uploads its output as a reviewable artifact.
  const jobBlocks = ci.split(/\r?\n(?=  [A-Za-z][\w-]*:\r?\n)/);
  for (const block of jobBlocks) {
    if (/update-snapshots/.test(block)) {
      assert.match(block, /^  visual-linux-candidates:/);
    }
  }
  for (const job of REQUIRED_CI_JOBS) {
    const block = jobBlocks.find((b) => b.startsWith(`  ${job}:`));
    assert.doesNotMatch(block ?? "", /update-snapshots/);
  }
});
test("reviewed visual workflow is guarded, read-only, and cannot publish", () => {
  const workflow = readFileSync(".github/workflows/generate-visual-baselines.yml", "utf8");
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /GENERATE_REVIEWED_LINUX_BASELINES/);
  assert.match(workflow, /contents: read/);
  assert.doesNotMatch(workflow, /git push|git commit|pull_request_target/);
});
