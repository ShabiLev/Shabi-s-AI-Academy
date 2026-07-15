import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { daysBetween, jsonFilesIn, readJsonSafe, repoRoot } from "./research-lib.mjs";
import { scoreSource } from "./score-source.mjs";
import { classifyFreshness } from "./check-freshness.mjs";

test("daysBetween computes whole-day differences and handles invalid dates", () => {
  assert.equal(daysBetween("2026-07-01T00:00:00.000Z", "2026-07-14T00:00:00.000Z"), 13);
  assert.equal(daysBetween("not-a-date", "2026-07-14T00:00:00.000Z"), null);
});

test("scoreSource gives tier1 sources the highest baseline authority score", () => {
  const tier1 = scoreSource({ qualityTier: "tier1" });
  const tier4 = scoreSource({ qualityTier: "tier4" });
  assert.ok(tier1.authorityScore > tier4.authorityScore);
});

test("scoreSource penalizes archived and deprecated sources, never rewards them", () => {
  const active = scoreSource({ qualityTier: "tier2" });
  const archived = scoreSource({ qualityTier: "tier2", archived: true });
  const deprecated = scoreSource({ qualityTier: "tier2", deprecated: true });
  assert.ok(archived.authorityScore < active.authorityScore);
  assert.ok(deprecated.authorityScore < active.authorityScore);
});

test("scoreSource never produces a score outside 0-100", () => {
  const worst = scoreSource({ qualityTier: "tier4", archived: true, deprecated: true });
  assert.ok(worst.authorityScore >= 0 && worst.authorityScore <= 100);
});

test("classifyFreshness applies day-based thresholds for generic/news sources", () => {
  const now = "2026-07-14T00:00:00.000Z";
  assert.equal(classifyFreshness({ sourceType: "newsArticle", retrievalDate: "2026-07-10T00:00:00.000Z" }, now), "current");
  assert.equal(classifyFreshness({ sourceType: "newsArticle", retrievalDate: "2026-06-01T00:00:00.000Z" }, now), "aging");
  assert.equal(classifyFreshness({ sourceType: "newsArticle", retrievalDate: "2026-01-01T00:00:00.000Z" }, now), "stale");
});

test("classifyFreshness never marks a paper stale by age alone — it requires manual review", () => {
  const result = classifyFreshness({ sourceType: "peerReviewedPaper", retrievalDate: "2020-01-01T00:00:00.000Z" }, "2026-07-14T00:00:00.000Z");
  assert.match(result, /requiresManualReview/);
});

test("seed candidates stay review-gated, untranslated, cited, and outside published content", () => {
  const sourceIds = new Set(jsonFilesIn("sources/seed").map((file) => readJsonSafe(file).data?.id));
  const candidateFiles = jsonFilesIn("candidates/seed");
  assert.equal(candidateFiles.length, 6);
  assert.equal(jsonFilesIn("published").length, 0);
  const types = new Set();
  for (const file of candidateFiles) {
    const candidate = JSON.parse(readFileSync(file, "utf8"));
    types.add(path.basename(path.dirname(file)));
    assert.equal(candidate.reviewStatus, "pendingReview");
    assert.equal(candidate.translationStatus, "notStarted");
    assert.ok(candidate.sourceIds.length > 0);
    assert.ok(candidate.sourceIds.every((id) => sourceIds.has(id)));
    assert.ok(path.relative(repoRoot, file).startsWith(path.join("research", "candidates", "seed")));
  }
  assert.deepEqual([...types].sort(), ["agent", "knowledge", "lesson", "prompt", "radar", "workflow"]);
});
