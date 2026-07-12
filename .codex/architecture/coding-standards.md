# Architectural Coding Boundaries

## Purpose

Define layering and dependency direction; daily syntax and naming live in [coding.md](../standards/coding.md).

## Boundaries

- **Pages:** route composition and orchestration only.
- **Components:** accessible presentation and local interaction.
- **Contexts:** React integration for stable domain services.
- **Domain modules:** framework-independent types, validation, transitions, and policies.
- **Adapters:** local storage, providers, tools, imports, and exports.
- **Built-in data:** immutable, validated, version-controlled catalogs.

Dependencies flow from UI toward public domain interfaces and from adapters toward domain contracts. Domain modules never import React, pages, browser globals, or concrete providers.

## Constraints and anti-patterns

Do not place business rules in JSX, access storage from arbitrary components, create circular feature imports, reuse components by adding unrelated modes, or let catalog records share mutable references with personal records.

## Review and testing

Boundary changes require architecture review, focused unit tests, and an ADR when they introduce a durable dependency or integration choice. Related: [folder structure](folder-structure.md), [frontend](frontend.md), [coding standard](../standards/coding.md), [Sprint runtime](../sprint-7/01-runtime.md).
