# Research

Research is an explicit file pipeline under `research/`; it performs no crawling.
Source records require HTTPS URLs, dates, a recorded license, a quality tier, and
bounded JSON size. Source text, repository commands, HTML, Markdown, packages, and
prompt-like instructions are inert data and are never executed or installed.

The isolated `seed/` dataset demonstrates official AI documentation, the MCP
specification, an official repository, a peer-reviewed paper, release notes, and
security guidance. Deterministic generation creates Knowledge, Lesson, Prompt,
Agent, Workflow, and Radar candidates with citations, `pendingReview`, and
`notStarted` translation. Nothing enters `research/published/` without a separate
human review record.
