# Research to Content Handoff

## Purpose

Defines the specific handoff contract from `research-agent` to
`knowledge-curator` when verified research is ready to become content
candidates. Uses the field set defined in
`.agent/handoff/handoff-template.md`.

## Field guidance for this pair

- **Task** — the research question that was investigated.
- **Scope** — which claims/sources are in scope for candidate generation;
  note any claims deliberately excluded (unverified, low-tier source,
  duplicate).
- **Branch / Starting commit / Latest commit** — only relevant if research
  artifacts are tracked in Git; otherwise record "not applicable" and
  instead reference the research record location.
- **Files changed** — research record files, source lists, or claim files
  produced.
- **Tests executed** — not applicable to research; record instead which
  verification steps from `.agent/research/claim-verification.md` were
  applied to each claim.
- **Evidence path** — where the sourced, ranked, cited research report
  lives.
- **Open failures** — any claim that could not be verified, or any source
  that could not be ranked with confidence.
- **Warnings** — freshness concerns per
  `.agent/research/freshness-policy.md`, or any source close to a
  duplicate per `.agent/research/duplicate-detection.md`.
- **Manual review** — not applicable at this stage; review happens after
  candidate generation, per `.agent/research/review-workflow.md`.
- **Next action** — which claims `knowledge-curator` should turn into
  which candidate type(s), per `.agent/research/content-generation.md`.
- **Prohibited assumptions** — `knowledge-curator` must not assume an
  unverified claim is safe to promote, and must not skip citation
  carryover.

## Shared reference

See `.agent/handoff/handoff-template.md` for the full field list and
`.agent/agents/research-agent.md` / `.agent/agents/knowledge-curator.md`
for the roles' responsibilities.
