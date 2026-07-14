# Research Memory

## Categories covered

Research findings.

## Where it's recorded

This file, `.agent/memory/research-memory.md`. Distinct from the published
Knowledge Base content in the application itself — this is the durable
record of research findings an agent has produced, whether or not they
were ever turned into published content.

## What belongs here

- A short index of research efforts completed: question investigated, key
  verified findings, and where the full research report lives.
- Findings that didn't make it into a published Knowledge Base entry but
  remain useful context for future research (e.g. "topic X was
  investigated on [date]; sources were too thin to verify a claim, revisit
  later").

## What doesn't belong here

- The full research report itself — that lives per
  `.agent/research/research-report-template.md`; this file indexes it, it
  doesn't duplicate it.
- Published Knowledge Base content — once a finding is published, the
  Knowledge Base entry is the reference, not this file.
- Unverified claims presented as findings — only record findings that
  passed `.agent/research/claim-verification.md`.

## Example entry shape

_(placeholder structure — not real project data)_

```
### [YYYY-MM-DD] _[research question]_
- Key finding(s): _[one or two verified claims, summarized]_
- Verification status: _[verified | partially verified | inconclusive]_
- Full report: _[path to the research report]_
- Follow-up needed: _[none | description]_
```

## Update rule

Append new entries per research effort. If a finding is later superseded by
newer research, add a new entry and mark the old one superseded rather
than editing it in place.
