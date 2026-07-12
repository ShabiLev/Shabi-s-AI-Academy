# Sprint 7 Release Specification

## Release contract

- Application version: **0.7.0**
- Release type: minor
- Required commit: `feat(runtime): add Agent runtime, Starter Agents and Prompt Packs`
- Stop before push.

Do not amend or rewrite 0.6.1 history. One clean commit contains the accepted Sprint implementation, tests, docs, version changes, and intentional baselines.

## Required validation

Run and report actual output:

```text
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run catalog:check
npm run docs:check
npm run test:e2e
npm run test:e2e:full
npm run test:a11y
npm run test:visual
npm run test:performance
npm run quality:collect
npm run quality:analyze
npm run validate:release
git diff --check
```

Do not run catalog updates or visual snapshot updates as normal validation. Review visual diffs before deliberate baseline changes. The quality analyzer must report manual checklist `notRun` honestly until human completion.

## Required documentation

Update root README, CHANGELOG, How To, runtime documentation, Starter Agents documentation, Prompt Packs documentation, both Playgrounds, QA/manual checklist, Roadmap documentation/data, application metadata, and any architecture/ADR whose accepted contract changed.

CHANGELOG includes only implemented behavior. Package, lock, centralized metadata, footer, QA/checklist, generated sample fixtures, and visible version labels must consistently report 0.7.0.

## Pre-commit review

1. Verify branch, origin, baseline history, status, and package version.
2. Confirm no real provider/tool/network integration, secrets, full external dataset, transient reports, personal paths, or unrelated changes.
3. Confirm Starter catalogs remain separate, history is bounded, Live disabled, external text inert, and manual status honest.
4. Run `git diff --check`, inspect `git diff --stat`, stage intended files, inspect staged names/stat/content, and secret-scan.
5. Commit with the exact message; verify clean status/log/remote. Do not push.

## Definition of release readiness

All [master acceptance criteria](00-master-spec.md) and [test matrix](07-tests.md) pass; package/version is 0.7.0; docs and reviewed baselines match behavior; no blocker remains. `readyWithWarnings` is acceptable only when the sole warning is an explicitly incomplete manual checklist and the release is not misreported as fully Ready.

## Handoff report

Include versions/SHAs/branch/origin/push command; runtime contracts/modes/statuses/history; catalog/pack counts; routes/integrations; complete automated results; manual checklist; security/privacy checks; bundle/performance; known limitations; and recommended 0.8.0 work.

Related: [release standard](../standards/releases.md), [release template](../templates/release.md), [handoff](handoff.md).
