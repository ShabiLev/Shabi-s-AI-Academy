# Paper Analysis

## Purpose

Required fields and rules for analyzing a research paper as a research
source.

## Required fields

- `title`
- `authors`
- `institution`
- `venue`
- `date`
- `peer-review status`
- `abstract summary`
- `methodology`
- `dataset`
- `benchmark`
- `results`
- `limitations`
- `reproducibility`
- `code availability`
- `practical relevance`
- `conflicting papers`
- `follow-up work`

## Rules

- **Do not present benchmark claims without context.** A reported benchmark
  number is meaningless without recording what it was measured against,
  the dataset/task, the comparison baselines, and any conditions (hardware,
  prompt, hyperparameters) that affect reproducibility. Record these
  alongside the number, not as a bare figure.
- **Peer-review status is recorded honestly.** Preprint (e.g. arXiv, not
  yet reviewed), peer-reviewed and published, or under review — these are
  different evidentiary strengths and must not be conflated (see
  `source-ranking.md`: peer-reviewed is Tier 1, a preprint from an
  established lab is Tier 2).
- **Limitations are recorded from the paper's own stated limitations
  section** at minimum, plus any additional limitations the analyzing agent
  identifies, clearly distinguished as such.
- **Reproducibility and code availability are recorded as facts** (is
  code/data released, under what license) — absence of released code is a
  limitation, not disqualifying.
- **Conflicting papers** — if another paper in the corpus reaches a
  different conclusion, link it via `conflictingClaimIds` on the derived
  claim record and surface both in the report (see
  `claim-verification.md`).
- **Follow-up work** — note any known later papers that extend, replicate,
  or supersede this one; feeds `freshness-policy.md`'s "papers" superseded
  rule.
- **Do not treat "practical relevance" as self-evident** — record
  explicitly why (or whether) the paper's finding applies to this
  project's context; a result from a very different scale/domain may not
  transfer.

## Related modules

`source-ranking.md`, `freshness-policy.md` (papers section),
`claim-verification.md`.
