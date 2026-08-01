# Rubric and certification model

## Schema

```ts
interface EvaluationRubric {
  schemaVersion: 1;
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  source: "system" | "user";
  criteria: RubricCriterion[];
  totalWeight: number;
  passingScore: number;
  evidencePolicy: EvidencePolicy;
  createdAt: string;
  updatedAt: string;
}

interface RubricCriterion {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  weight: number;
  scoringScale: {
    min: number;
    max: number;
    anchors: ScoreAnchor[];
  };
  requiredEvidenceTypes: EvidenceType[];
  blocking: boolean;
}

interface EvaluationFinding {
  criterionId: string;
  status: "pass" | "fail" | "partial" | "not-scored";
  score?: number;
  confidence: "low" | "medium" | "high";
  summary: LocalizedText;
  evidenceIds: string[];
  missingEvidence: LocalizedText[];
  remediation: LocalizedText[];
}
```

## Validation

- Criteria IDs are unique safe IDs; localized fields are present and bounded.
- Criterion weights are finite positive integers and total exactly 100.
- Passing score and anchors are inside a documented finite scale.
- Anchors are ordered, unique, bilingual, and cover scale boundaries.
- Required evidence types come from an allowlist.
- Built-in rubric records and versions are immutable.
- Clone creates a new user ID and preserves provenance to source/version/hash.
- Dangerous keys, unknown fields, unsupported versions, excessive nesting,
  and non-finite numbers are rejected before persistence.

## Evidence-first scoring

1. Validate evaluator independence and the exact rubric/evaluator versions.
2. Resolve required evidence IDs to immutable, checksummed evidence.
3. If required evidence is missing or invalid, emit `not-scored` without a
   numeric score.
4. Evaluate each scored criterion against explicit anchors.
5. Preserve each evaluator finding independently; do not silently average
   disagreement.
6. Calculate a weighted result only from criteria validly scored under the
   rubric evidence policy, and label coverage/missing weight.
7. Certification requires full mandatory evidence coverage, no failed blocking
   criterion, sufficient evaluator confidence, and no Reality Checker block.

`not-scored` is not zero. A UI may show an incomplete provisional summary but
must not label it PASS, FAIL, certified, or directly comparable to a complete
result.

## Blocking and confidence rules

- A blocking `fail` prevents certification regardless of weighted score.
- A blocking `partial` follows the rubric's explicit evidence policy and cannot
  be silently treated as pass.
- Low-confidence PASS cannot certify release readiness.
- Conflicting evaluator findings show disagreement and their evidence side by
  side. The user may add evidence or create a new run; editing history is not a
  resolution.
- Reality Checker is read-only, independent, and may block but cannot rewrite
  another evaluator's finding.

## Built-in rubric intent

| Rubric | Required focus |
| --- | --- |
| General Mission Quality | requirements, correctness, evidence, usability |
| React UI Feature | behavior, state, accessibility, responsive UI, tests |
| SQL / Data Query | business meaning, joins, types, dates, safety |
| Prompt Quality | intent, constraints, ambiguity, safety, verifiability |
| Agent Definition | role, boundaries, inputs/outputs, permissions, evidence |
| Release Readiness | exact-SHA gates, known risks, rollback, deployment |
| Accessibility Review | WCAG semantics, keyboard, focus, text alternatives |
| Security Review | trust boundaries, permissions, data, injection, secrets |

Exact criteria and anchors are implementation data covered by snapshot and
semantic tests; this document does not fabricate their final text.

## Versioning

Saving a material rubric change creates a new immutable version and changelog.
Runs keep the exact version and content hash. Deprecation changes discoverability
only; it never changes historical results. Rollback clones an earlier version
into a new later version.
