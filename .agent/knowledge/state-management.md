# State Management

## Purpose

Explain how state is owned in this repo so an agent extends the right
context instead of inventing a new global store.

## Authoritative source(s)

- [.codex/architecture/state-management.md](../../.codex/architecture/state-management.md)
- `src/App.tsx` (actual provider composition)

## Project-specific interpretation

Persistent feature state lives in one context per domain, each backed by a
validated local-storage adapter: `AuthContext`, `ExperienceContext`,
`OnboardingContext`, `GuidedTourContext`, `CourseProgressContext`,
`PromptLibraryContext`, `AgentLibraryContext`, `ProjectContext`,
`KnowledgeContext`, `RuntimeContext`, `WorkspaceContext`,
`CommandPaletteContext`, `WorkflowContext`, `AssistantContext` — all nested
in `App.tsx` in that order. Page-local UI state (open dialogs, form drafts,
search text) stays as `useState` inside the page component; it is not lifted
into a context. Derived values (filtered lists, computed scores such as
`evaluateAgent()` in `src/agents/agentQuality.ts`) are calculated at read
time, not stored redundantly.

## Constraints

- Pick the narrowest existing context for new persistent state; only add a
  new top-level context in `App.tsx` when the state is genuinely
  cross-cutting and no existing domain context fits.
- Never mirror a context's state into a second local `useState` copy that can
  drift; read from the context.
- Multi-step flows (the Runtime, onboarding wizard) use an explicit state
  machine / reducer-style transition function, not chained booleans.

## Known limitations

- The provider tree in `App.tsx` is already 14 levels deep; adding another
  top-level context increases this further. There is no provider-composition
  helper (e.g. a single `<AppProviders>` wrapper) yet — each provider is
  hand-nested.
- Not every domain has migrated to the `DataProvider` abstraction from
  ADR-012; most contexts still talk to their own local-storage adapter
  directly rather than through a shared repository interface.

## Current implementation status

Shipped: one context per domain, local-storage-backed, pure derived-value
computation at read time, explicit transition logic for the Runtime state
machine (`src/runtime/runtimeStateMachine.ts`). Aspirational (per ADR-012
follow-up): full migration of every context onto the shared `DataProvider`
contract — currently only a subset of domains route through
`LocalDataProvider`/`HybridDataProvider`.
