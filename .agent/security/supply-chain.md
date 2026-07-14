# Supply Chain

## Purpose

No untrusted repository installation during research; dependency and
source provenance checks so that research/knowledge work doesn't become a
vector for pulling untrusted code into the project or the execution
environment.

## Rules

- **No untrusted repository installation during research.** When
  analyzing a GitHub repository as a research source (see
  [`../research/repository-analysis.md`](../research/repository-analysis.md)),
  the repository's code is read and evaluated, never cloned and run,
  never `npm install`ed into this project, and never executed in any
  sandbox as part of producing a research finding, unless the user has
  explicitly authorized a specific, scoped evaluation and understands the
  risk.
- Ordinary project dependency additions (adding a package to
  `package.json` for a feature) are governed by
  [`dependency-security.md`](dependency-security.md), which is a related
  but distinct concern — that file covers packages this project actually
  runs; this file covers research-time exposure to third-party code.
- A research source's popularity, star count, or apparent maturity is not
  by itself a trust signal sufficient to justify execution — see
  [`../research/source-ranking.md`](../research/source-ranking.md) for how
  source quality is scored, which is about credibility of claims, not
  license to execute.
- If a research or knowledge-ingestion task seems to require running
  third-party code to validate a claim (e.g. "does this library actually
  do X"), that need is flagged to the user rather than acted on
  automatically.
- Generated content that recommends a tool, library, or repository to
  end-users (Prompt Packs, Starter Agents, Knowledge Base entries) must
  disclose what it is and is not verified to do, per
  [`../research/claim-verification.md`](../research/claim-verification.md),
  rather than implying the AOS pipeline has run/tested it.

## Review checklist

- Did any research step clone, install, or execute a third-party
  repository rather than only reading it?
- Does any generated recommendation imply verification that did not
  happen?
- Are new project dependencies (distinct from research subjects) reviewed
  per [`dependency-security.md`](dependency-security.md)?

## Related

[`security-policy.md`](security-policy.md), [`dependency-security.md`](dependency-security.md),
[`prompt-injection.md`](prompt-injection.md),
[`../research/repository-analysis.md`](../research/repository-analysis.md).
