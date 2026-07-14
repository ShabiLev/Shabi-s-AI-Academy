# Manual Review

## Purpose

What can only be certified by a human, and the hard rule that automation
must never mark it as an automated pass. See also
[`evidence.md`](evidence.md), [`ux-validation.md`](ux-validation.md), and
[`../release/release-checklist.md`](../release/release-checklist.md).

## The three manual gates

`scripts/run-quality-evidence.mjs` loads three checklist records via
`loadManualReview()`, each backed by a real JSON file under
`quality/checklists/`:

| Gate | File | Scope (from the checklist) |
| --- | --- | --- |
| `manualUxReview` | `quality/checklists/manual-ux-review.json` | New user comprehension, page orientation, navigation clarity, visual hierarchy, wording and primary-action clarity, mobile usability, Hebrew quality, English quality, terminology and complexity, overlap and clipping, dark-mode controls, overall trust. |
| `manualSecurityReview` | `quality/checklists/manual-security-review.json` | Secret and credential exposure, log redaction, authorization boundaries, untrusted input handling, dependency and build-output review. |
| `manualContentReview` | `quality/checklists/manual-content-review.json` | Hebrew content accuracy, English content accuracy, terminology consistency, documentation accuracy, user-facing claims. |

Each starts (and, if never reviewed, remains) in this shape:

```json
{
  "status": "notRun",
  "reviewedBy": null,
  "reviewedAt": null,
  "warnings": [],
  "note": "A human reviewer must update this record after completing the ... review. Automation cannot approve it."
}
```

(`manualUxReview` uses `approvedBy` instead of `reviewedBy` in the observed
data — check the actual file rather than assuming a uniform shape.)

## The hard rule

Automation — Codex, Claude Code, or any script — **must never** change a
manual-review file's `status` to `passed`. `manual-review.md` in every
generated evidence run ends with the literal sentence: "Automation does
not promote manual review statuses." This is enforced by omission: nothing
in `scripts/run-quality-evidence.mjs` ever writes to
`quality/checklists/manual-*.json` — it only reads them. Only a human
reviewer, editing the checklist file directly (or through a UI that records
a human's decision), can move a gate to `passed` or `failed`.

## Effect on the recommendation

Per `deriveRecommendation()` in `scripts/evidence-utils.mjs`:

- If any manual gate is `failed`, the overall recommendation is `Blocked`,
  regardless of automated command results.
- If the profile is `full`, no blocker command failed, and coverage passed,
  but at least one manual gate is still `notRun` (the default), the
  recommendation is capped at `Ready with warnings` — never `Ready`.
- `Ready` requires all three gates to be explicitly `passed` by a human.

A real observed run on this branch (`quality/execution/latest/summary.json`)
shows all three gates `status: "notRun"` and `manualReviewRequired: true` in
`findings` — this is the expected, honest state for a run that has not yet
had human sign-off, not a bug.

## What an agent should do

1. Never write `passed` into any `quality/checklists/manual-*.json` file.
2. When a task's scope includes work covered by one of these checklists
   (UX-facing change, security-relevant change, user-facing content
   change), flag in the final report that the corresponding manual gate is
   still pending and needs a human reviewer — do not imply it was
   satisfied by automated testing.
3. Treat `Ready with warnings` (not `Ready`) as the ceiling any agent-run
   evidence pass can honestly reach on its own.

See [`release-gates.md`](release-gates.md) for how these gates interact
with the release-readiness decision specifically.
