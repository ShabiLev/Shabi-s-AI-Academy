# Accessibility Standard

## Purpose

Make every workflow operable and understandable without a mouse or visual-only cues.

## Mandatory rules

Use semantic HTML, keyboard support, visible focus, logical headings, labels, dialog focus management, live announcements where useful, and text/icons beyond color.

## Recommended practices

Prefer native elements, concise accessible names, skip links, reduced motion, and non-visual alternatives for diagrams.

## Forbidden practices

Clickable divs, positive tabindex, hidden focus, color-only status, unlabeled controls, nested controls, and global axe suppressions.

## Example

A status badge includes “Completed” text and not just green styling.

## Review checklist

Review keyboard order, Escape/focus restore, zoom, contrast, screen-reader naming, RTL/LTR, and mobile.

## Related validation

`axe Playwright scans plus manual keyboard and screen-reader smoke review`

## Exceptions process

Document the need, risk, smallest scope, owner, expiry or removal plan, and compensating tests. Material or durable exceptions require an accepted ADR and security/QA review.

Related: [Architecture overview](../architecture/overview.md), [QA handbook](qa.md), [Sprint 7](../sprint-7/00-master-spec.md).
