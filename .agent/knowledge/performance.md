# Performance

## Purpose

State the actual performance gate and bounded-data conventions so an agent
doesn't add unbounded lists or premature optimization.

## Authoritative source(s)

- [.codex/architecture/performance.md](../../.codex/architecture/performance.md)
- [.codex/standards/performance.md](../../.codex/standards/performance.md)
- `package.json` (`test:performance`, `@lhci/cli`)

## Project-specific interpretation

`npm run test:performance` builds the app then runs
`quality/scripts/run-lighthouse.mjs collect` and `assert` against
representative routes, checked against thresholds in a lighthouse-thresholds
config. Bounded-data is an existing, enforced pattern, not aspirational:
`MAX_RUNTIME_RUNS = 50` (`src/runtime/types.ts`) caps stored runtime history,
and the Hybrid sync queue caps at 100 entries (`src/data/sync/syncQueue.ts`).
Catalog data (Starter Prompts, Starter Agents, glossary) is bundled as
curated, bounded module constants rather than fetched or unbounded.

## Constraints

- New local history/list state needs an explicit cap, following the
  `MAX_RUNTIME_RUNS` pattern, not an unbounded array.
- Do not memoize speculatively; the standard requires measurement first.
  Profile before adding `useMemo`/`useCallback` to "fix" a suspected
  slowdown.
- Do not bundle a full external dataset (e.g. a complete glossary or catalog
  import) where a curated, bounded subset serves the same learning purpose.
- Never lower a Lighthouse or bundle-size threshold to make a regression
  pass — that is a Critical-risk action under AOS task classification.

## Known limitations

- Lighthouse thresholds are asserted only for the routes the config lists;
  a newly added heavy page is not automatically covered until added there.
- `test:performance` requires a full production build first, so it is
  comparatively slow — it is not part of the fast `test:e2e` default loop.

## Current implementation status

Shipped: Lighthouse collect/assert pipeline, bounded runtime history and
sync queue, curated bounded catalogs. No route-level code-splitting beyond
existing `lazy()` usage has been added purely for performance — the
architecture doc treats that as future work "when measurements justify
complexity," and no such measurement-driven splitting effort is recorded in
this repo yet beyond what already exists in `App.tsx`.
