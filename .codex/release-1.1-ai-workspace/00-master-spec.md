# AI Workspace 1.1.0-beta.1 Master Specification

## Status

- Baseline: `e692ba5`, Version `1.0.0-beta.1`
- Branch: `feature/1.1.0-ai-workspace`
- Target: `1.1.0-beta.1`
- Milestone: AI Workspace & Command Center

## Objective

Connect the Academy's existing learning, prompt, agent, project, knowledge, and Runtime domains through local search, commands, a deterministic assistant, advanced builders, workflows, activity, analytics, notifications, and complete workspace backup. Existing 1.0 behavior and user-owned data remain intact.

## Controlling modules

1. [Global Search](01-global-search.md)
2. [Command Palette](02-command-palette.md)
3. [Assistant Sidebar](03-assistant-sidebar.md)
4. [Local Assistant](04-local-ai-chat.md)
5. [Advanced Builders](05-advanced-builders.md)
6. [Workflow Builder](06-workflow-builder.md)
7. [Activity and Analytics](07-activity-analytics.md)
8. [Workspace Import and Export](08-import-export.md)
9. [Testing](09-testing.md)
10. [Release](10-release.md)

## Invariants

- Hebrew and English are complete semantic RTL/LTR experiences.
- All new execution is deterministic and browser-local; Mock and Dry Run use the existing Runtime.
- Built-in catalogs remain immutable and separate from user-owned stores.
- Stores are versioned, validated, bounded, migratable, recoverable, and independently resettable.
- User/stored/imported text is inert. No secrets, dynamic code, direct provider calls, connected-tool claims, or external workflow execution.
- Medium-risk actions require confirmation; high-risk actions are unsupported.
- Keyboard, focus, reduced-motion, responsive, and non-drag alternatives are required.

## Delivery and commits

Use the nine commits in `10-release.md`. Run focused tests after each feature and `npm run validate:release` before the final release commit. Do not push, merge, squash, amend, or force-push.

