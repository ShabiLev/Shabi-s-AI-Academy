# Routing Architecture

## Purpose

Define route ownership, protection, navigation, and deep-link behavior.

## Current state

React Router provides a demo login, protected application shell, feature routes, details routes, and contextual help anchors.

## Decision and constraints

All learner data routes are protected. Route order must place concrete catalog paths before parameterized details paths. Unknown routes resolve predictably without exposing protected content.

## Dependency boundaries

Pages own URL parameters; domain services remain router-independent. Navigation labels are translated and direction-neutral.

## Anti-patterns

Hard-coded browser redirects, authorization checks scattered through pages, ambiguous dynamic routes, or links represented by click-only divs.

## Testing impact

Playwright must cover redirects, refresh, deep links, browser navigation, Hebrew/LTR direction, and route-level accessibility.

## Future evolution

Sprint 7 may add /playground/prompt, /playground/agent, /runs, /learning-journey, and /roadmap under the same guard.

## Related documents

[Frontend](frontend.md), [Sprint runtime](../sprint-7/01-runtime.md), [roadmap screen](../sprint-7/06-roadmap.md).
