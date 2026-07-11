import type { AccessibilityAllowedIssue } from '../../src/quality/types'

/**
 * Documented, narrowly-scoped exceptions to the accessibility gate. Each entry
 * exempts one axe rule on one selector — never a whole page or container — and
 * must carry a reason, an owner, a creation date, and a version by which it should
 * be removed. An undocumented violation still fails the build; only entries listed
 * here are ignored, and only for the exact rule + selector pair given.
 *
 * Empty by design: as of Sprint 5 (v0.5.0), a full axe (WCAG2A + WCAG2AA) sweep of
 * every required page and interaction state in both languages found zero
 * violations. Add an entry here only when a real, currently-unfixable violation is
 * found and it is genuinely narrower to allowlist than to fix immediately.
 */
export const a11yAllowlist: AccessibilityAllowedIssue[] = []
