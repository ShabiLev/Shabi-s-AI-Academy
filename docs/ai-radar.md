# AI Radar

AI Radar is the bilingual, source-based seven-day timeline at `/radar`. It combines an immediate reviewed cache with an optional same-origin public-feed refresh. It never accepts provider credentials or calls AI providers from the browser.

## Provider and publication architecture

`RadarProvider` separates unavailable, reviewed-static, and same-origin adapters. Every network response enters as `unknown` and must pass the bounded Version 1 schema before use. The reviewed JSON under `public/generated/` is copied into preview and Pages artifacts. Per [ADR-013](../.codex/adr/ADR-013-radar-pages-artifact-publication.md), changing published records requires a reviewed pull request; the scheduled workflow uploads validation artifacts and never commits discoveries.

States are explicit: cached, online, offline, unavailable, and partial. Failed refreshes preserve the reviewed cache. No polling or browser notification is enabled by default.

## Safety and data model

Records include canonical identity, bilingual summary and implication, accountable source, HTTPS URL, source tier/type, category/topics, publication/retrieval/verification dates, freshness, confidence/relevance, deduplication group, provider, checksum, review and translation status. URLs use a narrow host allowlist; strings, arrays, record count, payload size, dates, and checksums are bounded. Unknown fields and prompt-like instructions are discarded and rendered only as inert React text.

History retains at least seven calendar days, deduplicated by canonical ID and bounded to 250 records. Favorites are bounded local preferences; saved older records remain available and survive feed updates.

## Current reviewed sources

| Publisher | Signal | Published | Official source |
| --- | --- | --- | --- |
| OpenAI | Model-evaluation security incident | 2026-07-21 | [Incident report](https://openai.com/index/hugging-face-model-evaluation-security-incident/) |
| European Commission | AI-system transparency guidance | 2026-07-20 | [Commission guidance](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-guidelines-transparency-obligations-providers-and-deployers-certain-ai-systems) |
| Israel Ministry of Education | Authentic assessment in the AI era | 2026-07-20 | [Education resource](https://hakaveret.education.gov.il/course/index.php?categoryid=1130) |

All entries were retrieved, translated, and reviewed on 2026-07-22. Inclusion is not endorsement.

## Review procedure

Review the complete first-party source, paraphrase in Hebrew and English, calculate the checksum, update the reviewed feed and cache together, run Radar unit/provider/retention tests, execute the public-feed validator, and complete accessibility, responsive, security, content, and visual review. Visual snapshots change only through the separately approved workflow.
