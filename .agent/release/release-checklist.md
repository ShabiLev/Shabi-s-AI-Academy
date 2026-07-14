# Release Checklist

## Purpose

Concrete checklist mapped to this repository's real `npm run
validate:release` script and the AOS evidence workflow, so "release
checklist" means an actual command sequence, not a vague description.

## The real command

`package.json`'s `validate:release` script is, verbatim:

```
npm run lint && npm run test:run && npm run test:coverage && npm run build && npm run catalog:check && npm run docs:check && npm run quality:inventory && npm run test:e2e:full && npm run test:journeys && npm run test:ux && npm run test:a11y && npm run test:visual && npm run test:performance && npm run quality:collect && npm run quality:analyze && npm run quality:system-report && npm run test:e2e:pages && git diff --check
```

Every one of these must actually run and its real result recorded — none
may be reported as passed without having executed. A step that fails is
recorded as failed (or `notAvailable` if genuinely not runnable in the
current environment), never silently dropped.

## Checklist

1. Confirm the working tree matches the intended release scope
   (`git status`, `git diff`) per [`../git/git-policy.md`](../git/git-policy.md).
2. Run `npm run validate:release` in full and capture its actual output.
3. Run the AOS evidence workflow — `npm run quality:evidence:full`, per
   [`release-evidence.md`](release-evidence.md) — in addition to (not
   instead of) `validate:release`; they check overlapping but not
   identical things (evidence produces the structured
   `quality/execution/latest/` artifacts AOS consumes).
4. Complete required manual reviews per
   [`../quality/manual-review.md`](../quality/manual-review.md) (UX/visual
   items that cannot be certified by automation alone) and record their
   actual status.
5. Complete a security review per
   [`../security/security-review-template.md`](../security/security-review-template.md)
   if the change touches authentication, authorization, data, or
   dependencies.
6. Confirm version references are consistent per
   [`versioning.md`](versioning.md) and `npm run docs:check`.
7. Update `CHANGELOG.md` per [`changelog.md`](changelog.md) if behavior
   changed.
8. Determine the resulting release state per
   [`release-policy.md`](release-policy.md) from the actual results above
   — do not pick a state and then look for evidence to justify it.
9. Stop before push/merge; authorization is a separate, explicit step per
   [`../git/git-policy.md`](../git/git-policy.md).

## Related

[`release-policy.md`](release-policy.md), [`release-evidence.md`](release-evidence.md),
[`../quality/release-gates.md`](../quality/release-gates.md),
[`../quality/manual-review.md`](../quality/manual-review.md).
