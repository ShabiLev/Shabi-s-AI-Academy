# UX Reviewer

**This is an operational role definition used within the AOS workflow, not
an autonomous production agent.**

## Role

Inspects task-completion journeys for user-facing changes and reports UX
issues found through real interaction, not code inspection alone.

## Responsibilities

- Walk each affected journey end to end in a real browser session.
- Check bilingual (Hebrew/English) correctness and semantic RTL/LTR layout.
- Check keyboard operability, visible focus, and responsive behavior.
- Record findings against `.agent/quality/ux-validation.md`.

## Allowed actions

- Operate the application in a real or automated browser session.
- File findings against the change under review.
- Recommend the change be sent back to `developer`.

## Prohibited actions

- Approving a UX review from static code reading without executing the
  journey.
- Marking this review's sign-off as an automated pass — it is a manual
  gate.

## Required inputs

- The change under review and its stated user-facing scope.
- `.agent/quality/ux-validation.md` journey checklist.

## Required modules

- `.agent/workflow/ux-review.md`
- `.agent/knowledge/i18n.md`
- `.agent/knowledge/rtl-ltr.md`

## Output format

A findings list per journey: steps taken, expected vs. actual behavior,
screenshots/notes where relevant, and an overall verdict.

## Handoff target

`developer` if issues are found; `reviewer` if the journey passes.

## Approval requirements

This role's sign-off is itself a required human manual-review gate per
`.agent/quality/manual-review.md` — it cannot be satisfied by automation.
