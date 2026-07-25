import assert from "node:assert/strict";
import test from "node:test";
import { applyAuthoritativeJobOverrides } from "./collect-quality-results.mjs";
import { computeReleaseStatus, hasBlockingGateFailure } from "./analyze-quality-results.mjs";

const passedGates = () => ({
  lint: { status: "passed" },
  unitTests: { status: "passed" },
  coverage: { status: "passed" },
  build: { status: "passed" },
  e2eFast: { status: "notAvailable" },
  e2eFull: { status: "passed" },
  functionalE2e: { status: "passed" },
  crossBrowser: { status: "passed" },
  accessibility: { status: "passed" },
  visual: { status: "passed" },
  performance: { status: "passed" },
  manualChecklist: { status: "notRun" },
  gitDiff: { status: "passed" },
});
const reportWith = (gates, overrides = {}) => ({
  gates,
  coverage: { statements: 90, branches: 90, functions: 90, lines: 90, thresholds: { statements: 75, branches: 65, functions: 70, lines: 75 } },
  accessibility: { violationsBySeverity: { critical: 0, serious: 0 } },
  ...overrides,
});

test("all mandatory gates passed and e2eFast absent -> readyWithWarnings, not blocked", () => {
  const report = reportWith(passedGates());
  assert.equal(hasBlockingGateFailure(report.gates), false);
  assert.equal(computeReleaseStatus(report), "readyWithWarnings");
});

test("e2eFast notAvailable alone never blocks (it never runs in CI or validate:release)", () => {
  const gates = passedGates();
  gates.e2eFast = { status: "notAvailable" };
  assert.equal(hasBlockingGateFailure(gates), false);
});

test("visual failed blocks release", () => {
  const gates = passedGates();
  gates.visual = { status: "failed" };
  const report = reportWith(gates);
  assert.equal(hasBlockingGateFailure(report.gates), true);
  assert.equal(computeReleaseStatus(report), "blocked");
});

test("manualChecklist failed blocks release even though it is not in the mandatory list", () => {
  const gates = passedGates();
  gates.manualChecklist = { status: "failed" };
  assert.equal(hasBlockingGateFailure(gates), true);
});

test("manualChecklist notRun (the normal CI state) never blocks on its own", () => {
  const gates = passedGates();
  gates.manualChecklist = { status: "notRun" };
  assert.equal(hasBlockingGateFailure(gates), false);
});

test("authoritative override: a job GitHub Actions marked failure is never reported passed", () => {
  const gates = passedGates();
  // Simulate the exact defect: file-based recomputation disagreed with the
  // real job conclusion (e.g. performance's Lighthouse manifest ambiguity).
  gates.performance = { status: "passed" };
  applyAuthoritativeJobOverrides(gates, { PERFORMANCE: "failure" });
  assert.equal(gates.performance.status, "failed");
});

test("authoritative override: does not touch gates whose job succeeded or is unset", () => {
  const gates = passedGates();
  applyAuthoritativeJobOverrides(gates, { PERFORMANCE: "success", VISUAL_LINUX: undefined });
  assert.equal(gates.performance.status, "passed");
  assert.equal(gates.visual.status, "passed");
});

test("authoritative override: does not downgrade a gate that already correctly reports failed", () => {
  const gates = passedGates();
  gates.visual = { status: "failed", message: "1 mismatch: about-he.png" };
  applyAuthoritativeJobOverrides(gates, { VISUAL_LINUX: "failure" });
  assert.equal(gates.visual.status, "failed");
  assert.equal(gates.visual.message, "1 mismatch: about-he.png");
});

test("performance job failing while partial Lighthouse files exist is still forced to failed", () => {
  // Regression for the confirmed defect: quality-summary once read
  // 'performance: passed' from stale/partial artifact files even though
  // GitHub Actions concluded the performance job as a failure.
  const gates = passedGates();
  gates.performance = { status: "notAvailable" };
  applyAuthoritativeJobOverrides(gates, { PERFORMANCE: "failure" });
  assert.equal(gates.performance.status, "failed");
  const report = reportWith(gates);
  assert.equal(computeReleaseStatus(report), "blocked");
});
