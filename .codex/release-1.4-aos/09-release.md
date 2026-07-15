# Version 1.4 AOS Release

## Required gates

Run `npm run validate:release`, `npm run quality:evidence:full`, headed UX review,
the security/content checklists, and `git diff --check`. CI and Pages must run AOS,
evidence, documentation, lint, tests, and their existing build gates in the order
specified by the master task.

## Completion rule

Automated success does not complete human review. If any mandatory command fails,
evidence is stale, a high finding remains, or a human checklist is `notRun`, report
the exact status and do not create the final release commit.

When every gate is genuinely satisfied, the final commit is:

`chore(release): finalize Shabi's AI Academy 1.4.0-beta.1`

Stop before push or merge.
