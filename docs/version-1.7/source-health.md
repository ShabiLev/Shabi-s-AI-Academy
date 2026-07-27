# Version 1.7 source registry and health

Evidence timestamp: `2026-07-26T11:07:39.708Z`.

Command:

```powershell
$env:RADAR_OUTPUT='quality/runtime/radar/version-1.7-live-cycle.json'
npm run radar:ingest
$env:RADAR_FEED_PATH='quality/runtime/radar/version-1.7-live-cycle.json'
npm run radar:validate
```

The isolated cycle produced 88 publishable records from five healthy sources, quarantined 32 records outside the 45-day retention window, removed no duplicate canonical records, and completed without partial coverage. The generated current-news artifact is runtime evidence and is intentionally not committed. The repository retains the three-record reviewed fallback.

| Source ID | Publisher | Type / tier | Retrieval | Enabled | Health | Items | Publication policy |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| `openai-news` | OpenAI | official docs / 1 | RSS | yes | healthy | 40 | trusted-source auto-published |
| `google-deepmind-blog` | Google DeepMind | technical publication / 1 | RSS | yes | healthy | 11 | trusted-source auto-published |
| `openai-node-releases` | OpenAI SDK | repository / 1 | Atom | yes | healthy | 7 | trusted-source auto-published |
| `anthropic-typescript-releases` | Anthropic SDK | repository / 1 | Atom | yes | healthy | 10 | trusted-source auto-published |
| `arxiv-cs-ai` | arXiv | paper / 2 | Atom API | yes | healthy | 20 | trusted-source auto-published |
| `israel-innovation-authority` | Israel Innovation Authority | official docs / 1 | RSS | no | disabled | 0 | review required |
| `eu-commission` | European Commission | regulation / 1 | reviewed fallback | no | disabled | 0 | review required |
| `israel-education` | Israel Ministry of Education | official docs / 1 | reviewed fallback | no | disabled | 0 | review required |

The Israel Innovation Authority RSS endpoint exists, but the supported Node retrieval path receives publisher-edge `403`; curl/browser success is not used as a production workaround. The adapter therefore remains disabled and truthful. HTML scraping, arbitrary discovery, and public source submission are prohibited.

Detailed runtime source-health and quarantine JSON are generated under `quality/runtime/radar/` and are governed by repository retention policy.
