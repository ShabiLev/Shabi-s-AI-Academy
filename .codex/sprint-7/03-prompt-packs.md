# Sprint 7 Prompt Packs Specification

## Purpose and ownership

Add read-only Starter Prompt Packs separate from both the existing prompts.chat Starter Catalog and My Prompts. Version 0.7.0 targets **at least 100 carefully authored entries**; quality and reviewability override a larger count. Packs are bundled, immutable, searchable offline, and never written to personal storage until explicit import.

## Packs and minimum distribution

| Pack ID                    | Pack                       | Minimum | Focus                                           |
| -------------------------- | -------------------------- | ------: | ----------------------------------------------- |
| qa-testing                 | QA and Testing             |      14 | plans, cases, defects, regression, exploration  |
| sql-data                   | SQL and Data               |      10 | query design/review, metrics, quality           |
| jira-release               | Jira and Release           |      10 | backlog, risk, readiness, notes                 |
| product-management         | Product Management         |      10 | discovery, PRDs, stories, acceptance            |
| development                | Development                |      10 | code/API review, debugging, documentation       |
| professional-communication | Professional Communication |       8 | email, incidents, meetings, stakeholders        |
| prompt-engineering         | Prompt Engineering         |      10 | refinement, variables, evaluation, verification |
| agent-design               | Agent Design               |      10 | goals, tools, memory, approvals, failures       |
| learning-research          | Learning and Research      |       8 | plans, explanation, comparison, synthesis       |
| codex-code-review          | Codex and Code Review      |      10 | scoped implementation, review, testing, release |

Total minimum: 100. Final distribution and rejection rationale are committed in a curation report.

## Entry model

Every prompt requires:

- stable `id` and `packId`
- Hebrew and English title/description where UI metadata is shown
- `language: he | en | mixed`, category, `difficulty: beginner | intermediate | advanced`, and tags
- structured prompt text with task, context, constraints, variables, output, uncertainty, and verification
- variable definitions: key, label translations, description, required/default/example, safe length
- expected output schema/description
- usage notes and safety notes
- immutable/approved/schema version and deterministic content hash
- import metadata: catalog ID, pack ID, authorship/source, license/attribution when external data is used

External content remains plain untrusted data. Academy-authored entries say so; external derivatives retain original content/title/repository/license/hash and no-affiliation copy.

## Authoring and rejection

Use the [prompt standard](../standards/prompts.md). Reject empty/title-only, duplicate/near-duplicate, entertainment-only without learning value, obsolete, unsafe/injection/bypass, credential-seeking, broken-variable, unsupported-claim, malformed, or unreasonably long entries. Never execute prompts during curation, validation, search, preview, or import.

## Browse and import behavior

Provide pack overview, pack details, prompt preview, full-text search, category/language/difficulty/tag filters, sorting, result counts, read-only/source/license indicators, and contextual help.

- **Import one:** new personal ID/version 1/timestamps/provenance; editable copy.
- **Import selected:** review screen shows selection count, existing matches, and choices.
- **Import full pack:** explicit confirmation and summary; never automatic.
- **Duplicates:** per-entry Open Existing, Skip Existing, or Import Another; bulk defaults to Skip Existing and requires explicit override for additional copies.
- Transaction behavior is deterministic: validate all entries first, report per-entry result, never silently overwrite. Catalog/pack entries never affect personal counts before import.

## Storage and performance

Bundle only reviewed entries, not upstream datasets. Personal imports use existing prompt storage schema with a migration for pack metadata. Selection/filter state is page-local. No network is required. Search over 100–200 entries must remain responsive; measure before adding indexing dependencies.

## Acceptance and tests

- [ ] At least 100 approved unique entries meet pack minimums and metadata schema.
- [ ] Variables and hashes validate; all displayed strings are bilingual.
- [ ] One/selected/full import, refresh, editing/version increment, attribution, duplicate choices, and rollback-safe validation work.
- [ ] Existing Prompt Catalog and My Prompts behavior/counts remain unchanged.
- [ ] Plain-text rendering, safe export filenames, no localStorage catalog dump, and no execution are proven.
- [ ] RTL/LTR, keyboard selection, mobile bulk confirmation, axe, visuals, and Lighthouse pass.

Vitest covers schemas, distribution, normalized duplicates, search/filter/sort, variable validation, transaction planning, imports, provenance, immutability, and malformed records. Playwright covers browse/preview and every import/duplicate path with isolated storage.

Related: [catalog separation ADR](../adr/ADR-005-starter-catalog-separation.md), [security](../standards/security.md), [playgrounds](04-playground.md), [tests](07-tests.md).
