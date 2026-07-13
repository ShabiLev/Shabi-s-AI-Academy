# Full Prompt Library and Prompt Packs Specification

## Objective
Ship at least 250 curated prompts while preserving My Prompts and the existing Starter Catalog.

## Areas
- My Prompts
- Starter Catalog
- Prompt Packs
- Favorites
- Recently Used

## Minimum packs
- QA and Testing: 40
- SQL and Data: 30
- Jira and Release: 25
- Product Management: 20
- Development and Code Review: 30
- Prompt Engineering: 25
- Agent Design: 25
- Professional Communication: 20
- Learning and Research: 15
- Automation and Workflows: 10
- Security and Risk Review: 10

## Prompt model
Stable ID, pack ID, bilingual title/description, content language, category, tags, difficulty, role, task, context, constraints, output format, examples, variables, expected output, usage notes, safety notes, source metadata and version.

## Import
Support one, selected and full-pack import. Imported prompts get new local IDs, version 1, source attribution and editable local ownership. Duplicate choices: open existing, import another, cancel.

## UX
Search, pack/category/language/difficulty/imported/favorite filters, curated/title/quality/recent sorting, pack preview, selection count and confirmation summary.

## Safety
External text is inert, no `dangerouslySetInnerHTML`, no automatic external update, no whole dataset in localStorage.

## Required tests
Minimum counts, unique IDs, duplicate body detection, all import modes, duplicate choice, edit/versioning, search/filter/sort, dashboard totals, Playground prefill, persistence, RTL/LTR, mobile, axe and visual.

## Docs
Create `docs/prompt-packs.md`, `docs/prompt-library.md`, `docs/prompt-curation.md`.
