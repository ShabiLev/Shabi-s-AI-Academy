# AI Radar

AI Radar is the bilingual public-beta feed at `/radar`. It combines an immediate reviewed fallback with a same-origin feed produced by scheduled, bounded ingestion. It never accepts provider credentials or calls source/provider APIs from the browser.

## Provider and publication architecture

`RadarProvider` separates unavailable, reviewed-static, and same-origin adapters. Every network response enters as `unknown` and must pass the bounded Version 1 schema before use. The reviewed JSON under `public/generated/` remains the repository fallback. [ADR-014](../.codex/adr/ADR-014-scheduled-radar-ingestion.md) allows the scheduled workflow to replace the deployed artifact from the fixed owner-reviewed adapter registry without a React code change; generated current-news output is not committed as release evidence.

States are explicit: cached, online, offline, unavailable, and partial. Source health, generated time, last success, publication state, translation state, and cache status remain distinct. A failed or partial cycle preserves the last published cache, and the client always retains the reviewed fallback. There is one initial same-origin refresh and an explicit retry; no polling is used.

## Safety and data model

Records include canonical identity, bilingual summary and implication, accountable source, HTTPS URL, source tier/type, category/topics, full publication/update timestamps, retrieval/verification dates, freshness, confidence/relevance/Israel relevance, related-coverage group, provider, checksum, publication/review/translation/safety state, and correction history. URLs use a source-specific host allowlist; strings, arrays, record count, payload size, dates, and checksums are bounded. Unknown fields and prompt-like instructions are discarded and rendered only as inert React text.

The scheduled pipeline uses fixed RSS/Atom adapters, bounded sequential retrieval, timeout, three attempts with backoff, payload limits, inert XML parsing with entity rejection, URL/date normalization, classification, checksums, quarantine, deduplication, clustering, and atomic publication. It does not crawl, scrape HTML, discover arbitrary feeds, or accept public source submissions.

The client offers non-personalized Latest plus Important, Following, Israel First, Saved/Read Later, Recently Viewed, category/source filters, saved searches, local recommendations with explanations, a cache-honest daily briefing, and “what changed.” Guest history and preferences are bounded, retained locally, and independent of server records.

## Current reviewed sources

| Publisher | Signal | Published | Official source |
| --- | --- | --- | --- |
| OpenAI | Model-evaluation security incident | 2026-07-21 | [Incident report](https://openai.com/index/hugging-face-model-evaluation-security-incident/) |
| European Commission | AI-system transparency guidance | 2026-07-20 | [Commission guidance](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-guidelines-transparency-obligations-providers-and-deployers-certain-ai-systems) |
| Israel Ministry of Education | Authentic assessment in the AI era | 2026-07-20 | [Education resource](https://hakaveret.education.gov.il/course/index.php?categoryid=1130) |

These three entries are the reviewed offline fallback. Inclusion is not endorsement. The enabled scheduled registry currently contains OpenAI News, Google DeepMind, OpenAI SDK releases, Anthropic SDK releases, and arXiv `cs.AI`. The Israel Innovation Authority RSS adapter is registered but disabled because Node retrieval is currently denied by the publisher edge policy; the reviewed Ministry of Education fallback remains available. See [Version 1.7 source evidence](version-1.7/source-health.md).

## Review procedure

Review the complete first-party source, validate provenance and claims, calculate the checksum, update the reviewed fallback only through a focused review, run Radar ingestion/provider/profile/personalization tests, execute the public-feed validator, and complete accessibility, responsive, security, content, and visual review. Visual snapshots change only after explicit old/actual/diff review.
