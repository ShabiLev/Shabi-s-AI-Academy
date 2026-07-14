# TypeScript

## Purpose

Interpret repo-specific TypeScript strictness expectations for an agent
editing domain types or storage/provider boundaries.

## Authoritative source(s)

- [.codex/standards/typescript.md](../../.codex/standards/typescript.md)
- `package.json` (`typescript: latest`, build script `tsc -b && vite build`)

## Project-specific interpretation

Domain modules model state with discriminated unions rather than boolean
flags — e.g. `src/runtime/types.ts` defines `RunStatus`,
`RuntimeErrorCode`, and `ProviderRunResponse.outcome` as closed string-union
types instead of parallel `isLoading`/`isError` booleans, and
`src/agents/types.ts` defines `MemoryStrategy`, `AgentCategory`,
`AgentStatus` the same way. New domain state should follow this existing
pattern rather than introducing new boolean-flag combinations.

`npm run build` (`tsc -b && vite build`) is the authoritative type-check
gate; there is no separate `tsc --noEmit` script, so "the build passing" is
the evidence for type correctness, not a separate typecheck command.

## Constraints

- Keep strict mode; do not weaken `tsconfig` strictness to unblock a change.
- Treat external/untrusted input (imported files, Supabase rows, route
  params) as `unknown` and narrow before use, consistent with
  `.agent/knowledge/security.md`'s untrusted-boundary rule.
- Avoid `any` and non-null assertions; prefer the discriminated-union pattern
  already established in `runtime/types.ts` and `agents/types.ts`.

## Known limitations

- Some domain types use broad `Record<string, string | number | boolean>`
  shapes for event details (`RunEvent.details` in `runtime/types.ts`) rather
  than fully modeled per-event payloads — acceptable for now but not a
  template to copy into new, more structured domains.
- No repo-wide branded-ID type convention; IDs are plain `string`.

## Current implementation status

Shipped: strict TypeScript across `src/`, discriminated-union modeling for
runtime and agent state, type-only builds enforced via `npm run build`.
No separate incremental typecheck script exists beyond the build step.
