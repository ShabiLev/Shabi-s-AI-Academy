# Radar data and source policy

## Product behavior

The protected `/radar` route presents an editorial snapshot of material AI signals. Users can search, filter by topic and horizon, inspect concise bilingual summaries and implications, and follow the original source in a new tab. The page communicates result counts, empty results, snapshot freshness, and the absence of live updates.

## Source policy

- Admit only stable HTTPS pages published by the organization responsible for the announcement, research, standard, or project.
- Prefer dated article or release pages over home pages. Preserve the publisher, title, publication date, verification date, and URL with each record.
- Summaries and implications are Academy-authored paraphrases in Hebrew and English. Do not reproduce substantial source text.
- Do not infer adoption, performance, safety, popularity, or market leadership beyond the linked source.
- Reject social posts, aggregators, anonymous claims, affiliate content, copied press coverage, dynamic search results, and URLs without a clear accountable publisher.
- Store the reviewed snapshot in version-controlled TypeScript. The application performs no Radar fetches, background refresh, scraping, tracking, or telemetry.
- `verifiedAt` records link/editorial review, not independent validation of every publisher claim.
- Display a stale notice when the newest verification is more than 90 days old. Updating data requires source review, bilingual copy review, tests, and a normal application release.

## Initial publishers

The initial snapshot may use official material from OpenAI, Anthropic, Google DeepMind, Hugging Face, NIST, Meta AI, and OWASP. Inclusion is not endorsement. Publisher balance is editorial, not a completeness claim.

## Schema and validation

Each immutable item has a unique ID, publisher, official URL, ISO publication and verification dates, category, horizon, bilingual title/summary/implication, and a featured flag. Domain tests reject missing translations, non-HTTPS URLs, unapproved hosts, invalid dates, duplicate IDs, and future verification dates.
