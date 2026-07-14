# RAG

## Purpose

State plainly that retrieval-augmented generation is not implemented, and
clarify what the "Knowledge Base" and "rag" memory-strategy label actually
are so neither gets mistaken for a working RAG pipeline.

## Authoritative source(s)

- [.codex/architecture/overview.md](../../.codex/architecture/overview.md)
- `src/knowledge/` (`KnowledgeContext.tsx`, `knowledgeStorage.ts`,
  `types.ts`)
- `src/agents/types.ts` (`MemoryStrategy` union, includes the literal
  `"rag"`)
- `src/glossary/glossaryData.ts` (glossary definitions for `rag` and
  `knowledge-base`)

## Project-specific interpretation

Two things in this repo use the word "RAG" and neither is a retrieval
pipeline: (1) the glossary defines "RAG" and "Knowledge Base" as course
vocabulary the learner should understand conceptually; (2) `MemoryStrategy`
in `src/agents/types.ts` includes `"rag"` as one selectable string value in
the Agent Builder form (alongside `"none" | "conversation" | "session" |
"longTerm" | "custom"`) — selecting it only stores that label on the
`Agent` record for the deterministic simulation to reference; it triggers
no embedding, no vector store, and no retrieval step.

The actual "Knowledge Base" feature (`src/knowledge/`) is a local CRUD
document store: `KnowledgeDocument` has `contentType`
(`text|markdown|json|csv|note`), `content`, `tags`, `projectIds`, a
`hash`, and a fixed `status: "ready"`. It supports create/edit/tag/link-to-
project and full-text-ish local search (see `src/search/`), but has no
embeddings, no vector index, no chunking pipeline, and no connection to any
model that would "generate" an answer grounded in retrieved documents —
because there is no live model connected to anything in this app
(`runtime.md`).

## Constraints

- Never describe the Knowledge Base as "RAG" or "retrieval-augmented" in
  documentation or UI copy — it is a document library, not a retrieval
  pipeline feeding a generator.
- Never wire the `"rag"` `MemoryStrategy` value to real retrieval logic as
  an incidental change inside an unrelated task; that would be new,
  ADR-worthy `AI integration` scope (embeddings, a vector store, and a live
  model to consume the retrieved context all need to exist first).
- If a task genuinely requests building RAG, classify it as `AI integration`
  per `registry.json`, and note it depends on a live provider decision that
  does not exist yet (`.agent/knowledge/architecture.md`).

## Known limitations

- No chunking, embedding, vector search, or ranking code exists anywhere in
  `src/`.
- The Knowledge Base's local search is bounded/simple by design
  (`.codex/architecture/performance.md` — "local search over bounded
  datasets"), not a semantic retrieval mechanism.

## Current implementation status

Not implemented. "RAG" exists only as a glossary term and as one label in a
form field; the Knowledge Base is a genuine, shipped feature but is a plain
local document store, not a retrieval-augmented-generation system.
