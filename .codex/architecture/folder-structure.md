# Folder Structure

## Purpose

Define discoverable locations and prevent feature leakage.

## Current state

Application code lives under src by domain, pages, components, config, i18n, and styles; tests sit beside domain code or under e2e; quality tooling and docs are separate.

## Decision and constraints

Place framework-independent logic in feature folders, route composition in pages, shared UI in components/common, versioned built-ins beside their domain, and developer scripts under scripts.

## Dependency boundaries

```text
src/
  agents/ prompts/ runtime/       # domain and adapters
  components/ pages/              # UI and routing
  auth/ course/ help/ quality/     # established features
  config/ i18n/ styles/           # cross-cutting
scripts/ e2e/ quality/ docs/ .codex/
```

## Anti-patterns

Cross-domain imports use public index files. Tests may import test helpers but production cannot import test artifacts.

## Testing impact

Generic utils dumping grounds, feature data in page files, production output committed accidentally, or duplicate domain types.

## Future evolution

docs:check validates Kit structure; lint/build catch imports; reviews inspect boundary direction.

## Related documents

Sprint 7 may add src/runtime, starter agent/prompt-pack catalogs, playground pages, and typed roadmap data.
