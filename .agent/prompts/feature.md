# Feature Prompt

## Purpose

Frame a new feature task so an agent applies the checks specific to feature
work on top of the shared AOS development workflow. This file does not
restate testing, evidence, Git, or reporting steps — those live in the
workflow it points to.

## Task-specific checklist

- Confirm the feature is described in an approved spec, ADR, or explicit
  user request before writing code; do not invent scope.
- Identify which existing Context/provider, route, and storage boundary the
  feature extends — see `.agent/knowledge/state-management.md`,
  `.agent/knowledge/routing.md`, `.agent/knowledge/storage.md`.
- Translate every new user-facing string into Hebrew and English and apply
  semantic RTL/LTR layout per `.agent/knowledge/i18n.md` and
  `.agent/knowledge/rtl-ltr.md`.
- Preserve keyboard operability, visible focus, and existing user-authored
  data.
- Add or extend automated tests that exercise the new behavior, not just its
  happy path.
- Note any new dependency, provider, or MCP surface the feature introduces
  so the correct security module is loaded alongside this one.
- Update user-facing documentation and the changelog if the feature is
  visible to end users.

## Shared workflow to load

Load `.agent/workflow/development.md` for the full process; this file adds
nothing to that process except task-specific framing.
