# Rubric guide

## What a rubric proves

A rubric makes evaluation criteria, weights, anchors, evidence requirements,
blocking rules, and pass policy explicit. It cannot replace evidence or
independent judgment.

## Built-in and user rubrics

Built-in rubrics are immutable. Clone one to create an actor-scoped user rubric
while preserving source/version provenance. Saving a material change creates a
new version; historical runs retain the exact prior hash.

## Authoring checklist

- Give every criterion clear Hebrew and English names/descriptions.
- Make weights total exactly 100.
- Define ordered scale anchors including minimum and maximum.
- Require evidence types that can actually prove the criterion.
- Mark a criterion blocking only when failure must prevent certification.
- Explain why each weight and anchor matters.
- Keep criteria independent enough to avoid double-counting.
- Preview missing-evidence and disagreement behavior before use.

## Scoring rules

- No required evidence means `not-scored`, not zero.
- Every finding shows evaluator, evidence IDs, confidence, missing evidence,
  remediation, and exact versions.
- A blocking fail prevents certification.
- Low-confidence PASS cannot certify release readiness.
- Evaluator disagreement remains visible and is not silently averaged.
- Reality Checker may block certification but cannot rewrite another finding.

## Safe import and maintenance

Imported rubric text is inert and bounded. Unsupported schema, dangerous keys,
invalid weights, unknown evidence types, excessive nesting, or non-finite
numbers are rejected/quarantined. Deprecation hides a version from normal
selection but never changes old runs. Rollback creates a new version.
