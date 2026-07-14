# Documentation Prompt

## Purpose

Frame a documentation-only task, on top of the shared AOS documentation
workflow.

## Task-specific checklist

- Confirm the documentation change matches actual shipped behavior; do not
  document a planned or aspirational feature as if it exists.
- Update `CHANGELOG.md` per `.agent/release/changelog.md` if the
  documentation reflects a user-visible change.
- Update any AOS module (`manifest.json` purpose, registry entry) that the
  change makes stale.
- Keep bilingual documentation in sync where the project maintains
  Hebrew/English pairs.
- Avoid duplicating workflow or policy content that already lives in a
  linked `.agent/` module — link to it instead.

## Shared workflow to load

Load `.agent/workflow/documentation.md` for the full process; this file
adds nothing to that process except task-specific framing.
