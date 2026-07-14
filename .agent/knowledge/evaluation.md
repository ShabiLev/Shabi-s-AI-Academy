# Evaluation

## Purpose

Separate the in-app content-quality scoring from the AOS research/claim
verification process, since both use words like "score" and "evaluate."

## Authoritative source(s)

- `src/agents/agentQuality.ts` (`evaluateAgent`)
- `src/quality/` (`checklist.ts`, `qualityAnalyzer.ts`, `qualityStatus.ts`,
  `qualitySchema.ts`)
- `.agent/research/claim-verification.md`, `.agent/research/source-ranking.md`
  (AOS research-claim evaluation, dependencies of this module per
  `.agent/manifest.json`)
- `.agent/quality/quality-policy.md`, `.agent/quality/release-gates.md`

## Project-specific interpretation

**In-app evaluation:** `evaluateAgent()` in `agentQuality.ts` produces a
0–100 completeness score for a learner-authored `Agent` record (shown in
`AgentsPage.tsx` as `{s.quality}: {evaluateAgent(a).score}/100`) — this is a
deterministic, rule-based completeness check (are required fields filled,
are approval points declared for risky tools, etc.), not an LLM-graded or
statistical evaluation. Separately, `src/quality/` implements the release
quality-gate machinery (checklist state, gate analysis, schema validation)
that backs `npm run quality:analyze`/`quality:system-report` — this is
product/CI quality tooling, unrelated to grading AI output.

**AOS research/claim evaluation:** `.agent/research/claim-verification.md`
and `.agent/research/source-ranking.md` define how an AI agent doing a
`research` or `knowledge ingestion` task verifies an extracted claim's
credibility using source tiering — this is a process the agent follows
when producing Knowledge Base/Prompt Pack/lesson candidates, not code that
runs in the shipped app.

## Constraints

- Never conflate `evaluateAgent()`'s completeness score with any claim about
  how well a *real* AI agent would perform — it only measures whether the
  learner filled in the expected fields.
- A `research`/`knowledge ingestion` AOS task must follow
  `research.claim-verification`'s process before marking a claim verified;
  do not invent an ad hoc scoring shortcut.
- Release-gate quality tooling in `src/quality/`/`quality/scripts/` must not
  be modified to lower a threshold as a way to pass a failing evaluation —
  that is Critical-risk per `master.md`.

## Known limitations

- `evaluateAgent()`'s scoring rubric is not documented as a public contract
  outside its source and its own tests (`agents.test.ts`); read the
  function directly for the exact rule set rather than assuming a specific
  weighting.
- There is no automated LLM-as-judge evaluation anywhere in this repo —
  neither for learner content nor for AOS research claims; verification is
  rule-based (in-app) or human/source-ranking-based (AOS research).

## Current implementation status

Shipped: rule-based Agent completeness scoring, full release quality-gate
pipeline (`quality:collect`/`analyze`/`system-report`). AOS research claim
verification is an active documented process the agent follows manually,
not automated tooling in this repo.
