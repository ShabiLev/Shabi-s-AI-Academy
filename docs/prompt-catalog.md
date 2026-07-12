# Starter Prompt Catalog

Version 0.6.1 adds a bundled, read-only Catalog of 24 prompts reviewed for educational inclusion. It is separate from the personal Prompt Library and requires no runtime network request. Catalog entries never affect personal counts or localStorage until the learner explicitly imports one.

## Source and selection

Prompt data came from `prompts.csv` on the `main` branch of [f/prompts.chat](https://github.com/f/prompts.chat), snapshot commit `bae0c6d5743a0536d432e1f4bb271405e2375828`. The CSV schema was `act,prompt,for_devs,type,contributor`; the inspected snapshot was about 5.37 MB with 113,915 data rows. Prompt content/data is CC0-1.0. Upstream source code and site-authored content is MIT and was not copied. Shabi's AI Academy is not affiliated with or endorsed by prompts.chat.

The review favored QA, testing, SQL/data, Jira, releases, product, development, documentation, communication, learning, prompt improvement, agent design, and automation. Of 113,915 records reviewed, 24 starting points were accepted and normalized for clarity. The curation report records 113,843 out-of-scope records, 31 duplicates/near-duplicates, 9 unsafe or prompt-injection-oriented records, and 8 malformed/empty records.

Every entry includes source identifiers, original title, fixed snapshot date, deterministic FNV-1a duplicate-detection hash, CC0 license, curation note, and `approved` review status. This hash is not a security primitive.

## Import and safety

Import creates a browser-local ID, Version 1 timestamps, attribution, and content hash. The copy is editable and versions normally. A repeated import offers Open existing copy, Import another copy, or Cancel. Catalog text is rendered as plain text. The application uses no `dangerouslySetInnerHTML`, `eval`, shell execution, automatic prompt execution, or runtime Catalog API call.

## Developer workflow

- `npm run catalog:check` validates committed selection without network access or mutation.
- `npm run catalog:report` prints review counts and metadata problems.
- `npm run catalog:update` explicitly fetches and parses `prompts.csv` as inert data and writes a review report. It never updates localStorage, commits, pushes, or executes prompt text.
