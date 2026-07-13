# AI Radar

AI Radar is a bilingual editorial dashboard at `/radar`. It helps learners follow selected developments across models, agents, evaluation, safety, governance, and open source without turning the Academy into a news client or implying live provider connectivity.

## Data and privacy model

The snapshot is compiled into the application under `src/radar/catalog.ts`. Opening or filtering Radar performs no network request, scraping, analytics, or background refresh. The application stores no Radar preference or reading history. “Verified” means that the source link and Academy summary were editorially reviewed on that date; it does not independently prove every claim made by a publisher.

Every item contains a stable ID, accountable publisher, official HTTPS URL, publication and verification dates, topic, horizon, and original Hebrew and English summaries. Search and filters operate on an immutable in-memory catalog. A visible warning appears when the latest verification is more than 90 days old.

## Admission policy

Use only first-party pages from the organization responsible for an announcement, paper, standard, or open project. Prefer a dated article over a publisher home page. Exclude social posts, aggregators, anonymous claims, copied coverage, affiliate content, search-result URLs, and pages without accountable ownership. Inclusion is not endorsement, and the set is intentionally curated rather than exhaustive.

Academy copy must paraphrase the source, separate the reported development from the practical implication, avoid unsupported leadership or adoption claims, and exist in both languages. Never copy substantial source text.

## Initial reviewed sources

| Publisher | Signal | Published | Official source |
| --- | --- | --- | --- |
| OpenAI | GPT-5.6 model family | 2026-07-09 | [Launch article](https://openai.com/index/gpt-5-6/) |
| Anthropic | Claude Sonnet 5 | 2026-06-30 | [Launch article](https://www.anthropic.com/news/claude-sonnet-5) |
| Google DeepMind | System-level agent controls | 2026-06-18 | [AI Control Roadmap article](https://deepmind.google/blog/securing-the-future-of-ai-agents/) |
| Hugging Face | Agentic evaluation | 2026-06-18 | [Evaluation article](https://huggingface.co/blog/is-it-agentic-enough) |
| Google DeepMind | Multi-agent safety research | 2026-06-11 | [Research investment article](https://deepmind.google/blog/investing-in-multi-agent-ai-safety-research/) |
| Hugging Face | OpenEnv agent environments | 2026-06-08 | [OpenEnv article](https://huggingface.co/blog/openenv-agentic-rl) |
| Google DeepMind | AI co-scientist | 2026-05-19 | [Research article](https://deepmind.google/blog/co-scientist-a-multi-agent-ai-partner-to-accelerate-research/) |
| NIST | AI Risk Management Framework updates | 2026-04-07 | [AI RMF hub](https://www.nist.gov/itl/ai-risk-management-framework) |

All links were last reviewed on 2026-07-13.

## Updating the snapshot

Review the full first-party page, update both languages and dates, keep the host allowlist narrow, run Radar domain tests, responsive Playwright tests, axe, and reviewed visuals, then ship the change through a normal versioned release. Do not add a client fetch as a shortcut; a future live feed requires a separate architecture and privacy decision.
