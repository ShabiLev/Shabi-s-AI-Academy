# Version 1.4 AOS Testing

`npm run memory:check` is mandatory in structural, CI, Pages, and release validation. It checks schemas, version/branch consistency, evidence freshness, requirement-derived percentages, blocker counts, bounded histories, secret/private-path patterns, and action dependencies.

Structural order: documentation, AOS validation, AOS tests, evidence tests, lint.
Then run unit coverage, production and Pages builds, catalog and inventory checks,
all browser projects, accessibility, visual comparison, performance, research,
quality analysis, release-candidate profiles, and `validate:release`.

Visual baselines may change only after inspecting expected, actual, and diff images.
Server helpers must use strict ports and terminate the full child-process tree on
Windows. Tests must verify version agreement, Pages-safe snapshot URLs, isolated
seed candidates, route/inventory coverage, honest statuses, redaction, and safe
teardown. Do not lower thresholds or replace deterministic waits with timeouts.
