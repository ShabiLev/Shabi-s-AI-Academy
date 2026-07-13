# Local Knowledge Base Specification

## Objective
Provide browser-local documents and search without claiming real RAG.

## Supported Beta content
TXT, Markdown, JSON, CSV, notes and pasted text. PDF/DOCX remain planned unless real parsing is implemented and tested.

## Routes
`/knowledge`, `/knowledge/new`, `/knowledge/:documentId`, `/knowledge/:documentId/edit`.

## Model
ID, title, description, content type, filename, content, size, tags, project IDs, source, timestamps, version, hash and status.

## Privacy
Local only, no provider upload, no sync, confidential-data warning and documented file-size limit.

## Validation
Reject unsupported/oversized files, validate UTF-8, sanitize filenames, inert rendering, safe CSV preview, no HTML execution.

## Search
Title, description, content, tags and source with snippets.

## Future RAG
Define chunk metadata, embeddings, vector store, retrieval and citations, but show `RAG not active`.

## Tests
All supported types, unsupported type, size limit, malformed input, search, project links, delete, persistence, no HTML execution, no network, mobile and accessibility.

## Docs
Create `docs/knowledge-base.md`, `docs/knowledge-import.md`, `docs/rag-future.md`.
