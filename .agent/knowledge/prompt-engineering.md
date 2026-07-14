# Prompt Engineering

## Purpose

Disambiguate the in-app Prompt Library/Prompt Packs content from AOS prompt
templates, mirroring the same two-meanings issue as `ai-agents.md`.

## Authoritative source(s)

- [.codex/adr/ADR-005-starter-catalog-separation.md](../../.codex/adr/ADR-005-starter-catalog-separation.md)
- `src/prompts/` (`PromptLibraryContext.tsx`, `promptStorage.ts`,
  `catalog/starterCatalog.ts`, `catalog/catalogImport.ts`,
  `catalog/originalSourceRecords.ts`, `packs/promptPackImport.ts`)
- `src/pages/PromptLibraryPage.tsx`, `PromptBuilderPage.tsx`,
  `PromptCatalogPage.tsx`, `PromptPacksPage.tsx`, `PromptPlaygroundPage.tsx`
- `.agent/prompts/*.md` (AOS task-specific prompt templates, see
  `.agent/manifest.json` category `prompts`)

## Project-specific interpretation

**In-app meaning:** learners author and store their own prompts (Prompt
Library/Builder), can browse a read-only, attributed Starter Prompt Catalog
and Prompt Packs, and import a catalog item into their own editable local
copy (ADR-005 — catalogs are immutable until explicit import, which creates
a new ID and preserves provenance/source attribution via
`originalSourceRecords.ts`). Prompt Playground lets a learner exercise a
prompt against the same deterministic Mock Runtime used elsewhere — it does
not call a live model.

**AOS meaning:** `.agent/prompts/*.md` are instruction templates that tell
the coding agent how to approach a *classified task type* (feature, bugfix,
release, etc.) — e.g. `prompts.feature`, `prompts.security-review`. These
are loaded per `registry.json` based on task classification and have no
relationship to the learner-facing Prompt Library content.

## Constraints

- Never present catalog Prompt Packs/Starter Prompts as user-owned until an
  explicit import action has created a separate, attributed local copy.
- Preserve source attribution fields when importing a catalog prompt; don't
  strip provenance to simplify a data shape.
- A `prompt creation` AOS task (per `registry.json`) resolves
  `prompts.ai-agent`... no — resolves `agents.prompt-engineer` /
  `prompts.documentation`-style modules for authoring new Prompt
  Pack/Library *content candidates*; it is a different task than editing
  `.agent/prompts/*.md` templates, which is a `workflow creation`/AOS
  maintenance concern.

## Known limitations

- No live model backs the Prompt Playground; "running" a prompt there is a
  deterministic Mock/Dry-Run exercise, not a real completion.
- As with Starter Agents, catalog/import provenance is maintained by
  convention in `originalSourceRecords.ts` rather than by a schema-enforced
  invariant that blocks a copy from silently losing its source link.

## Current implementation status

Shipped: Prompt Library, Builder, Catalog, Packs, import-with-attribution
flow, and a Mock-only Prompt Playground. Not shipped: any live-model prompt
execution. AOS prompt templates (`.agent/prompts/`) exist independently and
are current/active per `.agent/manifest.json`.
