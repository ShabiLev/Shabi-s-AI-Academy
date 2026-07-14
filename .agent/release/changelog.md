# Changelog Rules

## Purpose

Keep-a-Changelog-style rules for the application `CHANGELOG.md`, so
history reflects actual shipped behavior, not internal process noise.

## Rules

- An entry is added only when application-visible behavior changes:
  features, fixes, breaking changes, deprecations, security fixes.
  Documentation-only or AOS-internal changes (per
  [`../../.codex/standards/versioning.md`](../../.codex/standards/versioning.md))
  do not get an application CHANGELOG entry unless they change what a user
  sees or does.
- Group entries under standard headings: `Added`, `Changed`, `Fixed`,
  `Removed`, `Security`, `Deprecated` — matching the Keep a Changelog
  convention.
- Each entry is tied to the version it ships in, per
  [`versioning.md`](versioning.md); never edit a past released version's
  entries to reflect later work — add a new version section instead.
- Entries describe user-facing impact in plain language, not internal
  implementation detail or file names.
- Security-relevant fixes are listed under `Security` without disclosing
  exploit detail that would help misuse an issue before users can update.
- Changelog updates happen as part of the same change that ships the
  behavior, not as a deferred cleanup task — see
  [`../workflow/documentation.md`](../workflow/documentation.md).

## Review checklist

- Does every entry correspond to an actual, verifiable behavior change?
- Is the entry filed under the correct version and heading?
- Is internal/process-only work correctly excluded?

## Related

[`versioning.md`](versioning.md), [`../workflow/documentation.md`](../workflow/documentation.md),
[`release-checklist.md`](release-checklist.md).
