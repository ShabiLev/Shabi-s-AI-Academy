# UX Review Prompt

## Purpose

Frame a dedicated UX review task around real task-completion journeys, on
top of the shared AOS UX review workflow.

## Task-specific checklist

- Walk the affected user journey end to end in a real browser session; do
  not infer UX correctness from code reading alone.
- Check bilingual correctness and semantic RTL/LTR layout for every screen
  touched, per `.agent/knowledge/i18n.md` and `.agent/knowledge/rtl-ltr.md`.
- Verify keyboard operability and visible focus at each step of the
  journey.
- Check responsive behavior at the breakpoints this project supports.
- Record findings against `.agent/quality/ux-validation.md`'s journey
  checks.
- Treat this review's sign-off as a manual gate per
  `.agent/quality/manual-review.md`; automation cannot mark it passed.

## Shared workflow to load

Load `.agent/workflow/ux-review.md` for the full process; this file adds
nothing to that process except task-specific framing.
