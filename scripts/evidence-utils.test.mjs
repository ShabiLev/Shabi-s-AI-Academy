import assert from "node:assert/strict";
import test from "node:test";
import {
  boundedRunIndex,
  deriveRecommendation,
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
});
