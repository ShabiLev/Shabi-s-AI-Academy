import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assessCiManifest,
  assessRuntimeEvidence,
  boundedRunIndex,
  computeContentDigest,
  assessEvidenceIntegrity,
  deriveRecommendation,
  isEvidenceMetadataPath,
  isWorkingTreeClean,
  redactText,
  safeSlug,
  summarizeCoverage,
} from "./evidence-utils.mjs";

test("redacts secrets, email addresses, and user paths while retaining useful context", () => {
  const privateHome = ["C:", "Users", "Private"].join("\\");
  const bearerValue = ["abc", "def", "ghi"].join(".");
  const passwordValue = ["fixture", "credential"].join("-");
  const emailValue = ["fixture", "example.test"].join("@");
  const source = [
    `Authorization: Bearer ${bearerValue}`,
    `password=${passwordValue}`,
    `contact ${emailValue}`,
    `${privateHome}\\project\\file.ts`,
  ].join("\n");
  const result = redactText(source);
  assert.equal(result.includes(bearerValue), false);
  assert.equal(result.includes(passwordValue), false);
  assert.equal(result.includes(emailValue), false);
  assert.doesNotMatch(result, /Users\\Private/);
  assert.match(result, /Authorization: Bearer \[REDACTED\]/);
  assert.match(result, /contact \[REDACTED_EMAIL\]/);
});

test("replaces the workspace before broader home-path redaction", () => {
  const workspace = ["C:", "Users", "Private", "project"].join("\\");
  assert.equal(
    redactText(`${workspace}\\src\\main.ts`, { workspace }),
    "[WORKSPACE]\\src\\main.ts",
  );
  assert.equal(
    redactText("/home/runner/work/project/src/main.ts", {
      workspace: "/home/runner/work/project",
    }),
    "[WORKSPACE]/src/main.ts",
  );
});

test("normalizes branch names into bounded run slugs", () => {
  assert.equal(safeSlug("test/1.3.0 Quality Evidence"), "test-1-3-0-quality-evidence");
  assert.equal(safeSlug("***", "fallback"), "fallback");
});

test("keeps only the newest twenty unique index records", () => {
  const entries = Array.from({ length: 20 }, (_, index) => ({
    runId: `run-${index}`,
    date: `2026-07-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
  }));
  const next = { runId: "new", date: "2026-08-01T00:00:00.000Z" };
  const result = boundedRunIndex(entries, next);
  assert.equal(result.length, 20);
  assert.equal(result[0].runId, "new");
  assert.equal(result.some((entry) => entry.runId === "run-0"), false);
});

test("computes threshold results and deltas for every coverage metric", () => {
  const result = summarizeCoverage(
    { total: {
      statements: { pct: 90 }, branches: { pct: 70 },
      functions: { pct: 69 }, lines: { pct: 91 },
    } },
    { statements: 75, branches: 65, functions: 70, lines: 75 },
    { statements: { percent: 88 }, branches: { percent: 72 }, functions: { percent: 68 }, lines: { percent: 90 } },
  );
  assert.equal(result.status, "failed");
  assert.equal(result.statements.delta, 2);
  assert.equal(result.functions.passed, false);
});

test("manual gates and blocker failures cannot be promoted to Ready", () => {
  const manualReviews = {
    manualUxReview: { status: "notRun" },
    manualSecurityReview: { status: "passed" },
    manualContentReview: { status: "passed" },
  };
  assert.equal(deriveRecommendation({ profile: "full", commands: [], coverage: null, manualReviews }), "Ready with warnings");
  assert.equal(deriveRecommendation({
    profile: "full",
    commands: [{ status: "failed", criticality: "blocker" }],
    coverage: null,
    manualReviews,
  }), "Blocked");
  assert.equal(deriveRecommendation({
    profile: "full",
    commands: [{ status: "notAvailable", criticality: "blocker" }],
    coverage: null,
    manualReviews,
  }), "Blocked");
});

test("distinguishes clean and dirty evidence generation", () => {
  assert.equal(isWorkingTreeClean(""), true);
  assert.equal(isWorkingTreeClean(" M src/App.tsx"), false);
});

test("accepts only bounded evidence metadata after the tested commit", () => {
  assert.equal(isEvidenceMetadataPath("quality/execution/latest/summary.json"), true);
  assert.equal(isEvidenceMetadataPath(".agent/state/quality-status.json"), true);
  assert.equal(isEvidenceMetadataPath("src/App.tsx"), false);
  const result = assessEvidenceIntegrity({
    testedCommit: "aaa",
    evidenceCommit: "bbb",
    parentCommit: "aaa",
    headCommit: "ccc",
    workingTreeCleanAtTest: true,
    testedIsAncestor: true,
    evidenceIsAncestor: true,
    changedPaths: ["quality/execution/latest/summary.json", ".agent/state/quality-status.json"],
  });
  assert.equal(result.ok, true);
});

test("rejects stale, dirty, or product-changing evidence lineage", () => {
  const result = assessEvidenceIntegrity({
    testedCommit: "aaa",
    evidenceCommit: "pending",
    parentCommit: null,
    headCommit: "ccc",
    workingTreeCleanAtTest: false,
    testedIsAncestor: false,
    evidenceIsAncestor: false,
    changedPaths: ["src/App.tsx"],
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("dirty")));
  assert.deepEqual(result.disallowed, ["src/App.tsx"]);
});

test("runtime evidence binds directly to the expected SHA without an evidence commit", () => {
  const summary = {
    schemaVersion: 1,
    identity: {
      runId: "run-1",
      profile: "full",
      testedCommit: "abc123",
      repository: "owner/repo",
      workflowName: "local-quality-evidence",
      generatedAt: "2026-07-21T00:00:00.000Z",
      workingTreeCleanAtTest: true,
    },
    results: { Build: { status: "passed" } },
    commands: [{ command: "npm run build", status: "passed" }],
    overallStatus: "passed",
  };
  assert.deepEqual(assessRuntimeEvidence(summary, { expectedSha: "abc123" }).errors, []);
  assert.match(assessRuntimeEvidence(summary, { expectedSha: "different" }).errors.join(" "), /does not match/);
});

test("CI manifest requires exact SHA, run identity, tool versions, and digest", () => {
  const sha = "a".repeat(40);
  const manifest = {
    schemaVersion: 1,
    repository: "owner/repo",
    workflowName: "CI",
    workflowRunId: "20",
    workflowRunAttempt: "1",
    headSha: sha,
    sourceBranch: "fix/example",
    targetBranch: "main",
    eventName: "push",
    generatedAt: "2026-07-21T00:00:00.000Z",
    jobName: "quality-core",
    conclusion: "success",
    nodeVersion: "v20.19.0",
    npmVersion: "10.8.2",
    files: ["report.json"],
    contentDigest: "a".repeat(64),
  };
  assert.deepEqual(assessCiManifest(manifest, { expectedSha: sha, requiredJob: "quality-core", expectedRunId: "20" }).errors, []);
  assert.match(assessCiManifest(manifest, { expectedSha: "different" }).errors.join(" "), /does not match/);
  assert.match(assessCiManifest({ ...manifest, files: ["../secret"] }).errors.join(" "), /unsafe/);
});

test("CI manifest digest is recomputed from relative artifact content", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "aos-artifact-"));
  try {
    writeFileSync(path.join(root, "report.json"), "{}\n", "utf8");
    const sha = "b".repeat(40);
    const manifest = {
      schemaVersion: 1,
      repository: "owner/repo",
      workflowName: "CI",
      workflowRunId: "21",
      workflowRunAttempt: "1",
      headSha: sha,
      sourceBranch: "fix/example",
      targetBranch: "main",
      eventName: "push",
      generatedAt: "2026-07-21T00:00:00.000Z",
      jobName: "quality-core",
      conclusion: "success",
      nodeVersion: "v20.19.0",
      npmVersion: "10.8.2",
      files: ["report.json"],
      contentDigest: computeContentDigest(root, ["report.json"]),
    };
    assert.deepEqual(assessCiManifest(manifest, { artifactRoot: root }).errors, []);
    writeFileSync(path.join(root, "report.json"), "changed\n", "utf8");
    assert.match(assessCiManifest(manifest, { artifactRoot: root }).errors.join(" "), /does not match/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("quality and Agent Memory producers write only ignored runtime paths", () => {
  const runner = readFileSync("scripts/run-quality-evidence.mjs", "utf8");
  const memory = readFileSync("scripts/update-agent-memory.mjs", "utf8");
  const finalizer = readFileSync("scripts/finalize-quality-evidence.mjs", "utf8");
  const ignores = readFileSync(".gitignore", "utf8");
  assert.match(runner, /quality", "runtime", "execution/);
  assert.match(memory, /\.agent", "runtime", "state/);
  assert.match(memory, /\.agent", "runtime", "memory/);
  assert.match(ignores, /\.agent\/runtime\//);
  assert.match(ignores, /quality\/runtime\//);
  assert.doesNotMatch(finalizer, /writeFileSync|evidenceCommit|pendingPostEvidenceCommit/);
});

test("full quality evidence runs every mandatory E2E gate before collection", () => {
  const runner = readFileSync("scripts/run-quality-evidence.mjs", "utf8");
  const fullProfile = runner.slice(runner.indexOf("  full: ["), runner.indexOf("\n  ],\n};", runner.indexOf("  full: [")));

  for (const script of ["test:e2e", "test:e2e:functional", "test:e2e:cross-browser"]) {
    assert.match(fullProfile, new RegExp(`npm\\([^\\n]+"${script}"`));
  }
  assert.ok(fullProfile.indexOf('"test:e2e"') < fullProfile.indexOf('"quality:collect"'));
});

test("full quality evidence preserves the reviewed tracked Radar feed during cleanup", () => {
  const runner = readFileSync("scripts/run-quality-evidence.mjs", "utf8");

  assert.match(runner, /persistentGeneratedFiles[\s\S]+public\/generated\/ai-radar-feed\.json/);
  assert.match(runner, /for \(const \[file, content\] of persistentGeneratedFiles\)[\s\S]+writeFileSync\(file, content\)/);
});
