# Version 1.5 release gate

## Readiness

Readiness requires successful checks for the exact HEAD, immutable CI provenance, approved Linux visual baselines, a passing mandatory visual gate, and completed UX, accessibility, security, content, and visual reviews.

## Upstream dependency

This release is based on the authoritative Version 1.4 recovery branch because recovery is not yet merged into `main`. The PR must name the dependency and must not bypass its visual gate.

## Stop conditions

Any failed mandatory job, stale SHA, unapproved visual change, missing manual approval, or uncertain evidence blocks merge instructions. The agent must not merge the PR or push `main`.
