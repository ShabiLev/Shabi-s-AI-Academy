# Version 1.5 release handoff

## Branch and dependency

Work continues on `feature/1.5.0-aos-core-ux-radar`, based on the Version 1.4 recovery HEAD rather than current `main`. Preserve and report that relationship.

## Resume sequence

Verify the upstream dependency, exact-SHA PR CI, immutable artifacts, Radar validation, automated suites, headed review, human visual approval, and manual UX, accessibility, security, and content approvals.

## Release rule

Generated runtime output remains untracked. If Linux baselines are missing, upload comparison artifacts and keep the release blocked until a human approves the dedicated workflow. Never infer authorization to merge or push `main`.
