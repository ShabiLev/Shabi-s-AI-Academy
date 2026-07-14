# Self-review — Agent Operating System (1.4.0-beta.1)

Status: completed

## Architecture

`.agent/` is the single AOS source of truth, loaded on demand via
`manifest.json`/`registry.json` rather than as one monolithic prompt.
`.codex/workflows/aos.md` and `.claude/workflows/aos.md` stay thin
pointers (verified by `scripts/validate-aos-duplication.mjs`, which
checks their line count and that they link to `.agent/master.md`).
Existing `.codex/`, `AGENTS.md`, and release specs were extended, not
replaced.

## Duplication, dead code, and unused files

`npm run aos:check` (manifest, links, schemas, duplication) reports
**0 errors, 7 warnings**. The warnings are a shared disclaimer sentence
repeated across 13 `.agent/agents/*.md` role files, a shared link list in
two `.agent/git/*.md` files, and four placeholder strings shared between
`.agent/templates/handoff.md` and its siblings — boilerplate, not
duplicated *workflow logic*, and left as documented warnings rather than
forced to zero. No dead code or unused files were introduced; every new
script and module is referenced from `manifest.json`, `registry.json`,
`package.json`, or `App.tsx`.

## Broken links / circular references / stale version references

`scripts/validate-aos-links.mjs` scans all 179 Markdown files under
`.agent/`, `.codex/workflows/`, `.claude/workflows/`, and `docs/aos/` —
0 broken links. `scripts/validate-aos-manifest.mjs` walks every module's
`dependsOn` graph — 0 circular dependencies (one was found and fixed:
`quality.release-gates` ↔ `release.release-checklist`). `.agent/VERSION`,
`.agent/manifest.json` (`aosVersion`/`applicationVersion`), and
`package.json` are cross-checked and agree: AOS `1.0.0`, application
`1.4.0-beta.1`.

## Schemas

All 12 files under `.agent/schemas/*.schema.json` pass structural
validation (`$schema`, `type`, `properties`/`required` consistency).

## Insecure research handling / secret exposure

`research/` performs no network requests, executes no source content,
and installs nothing — confirmed by reading every script under
`scripts/research/`. Evidence files (`quality/execution/latest/*`) are
produced by the existing `redactText` pass in `scripts/evidence-utils.mjs`;
`environment.json`, `commands.json`, and the two `git-state-*.txt` files
now copied into `latest/` contain no tokens, only OS/Node/npm versions,
branch name, and commit SHAs. `git remote -v` output in the git-state
files is a plain public GitHub HTTPS URL, no embedded credentials.

## Git safety / MCP safety

No `push`, `merge`, `reset --hard`, or force operation was run this
session. Commits used targeted `git add <path>` per theme, never blind
`git add -A`. No MCP tool exists in this repo yet; `.agent/security/mcp-security.md`
and `.agent/knowledge/mcp.md` document the required controls for when one
is added, and state its status honestly as not yet integrated.

## RTL/LTR and accessibility

Every AOS string is bilingual (`src/aos/aosUiText.ts`). All 7 AOS routes
were verified with `npx playwright test --project="Accessibility" -g
"Agent Operating System"` in both Hebrew and English — **15/15 passed**,
zero axe violations.

## Performance

AOS routes are lazy-loaded (`React.lazy` in `src/App.tsx`); the
dashboard fetches one small JSON snapshot instead of loading Markdown or
scanning files in the browser; the module list is client-side bounded
("load more", 25 rows per page) instead of rendering all 168 modules at
once; there is no background polling.

## Documentation

`docs/aos/` (16 files) plus additive updates to `docs/how-to-guide.md`,
`docs/testing.md`, `docs/security.md`, `docs/quality-gates.md`,
`.codex/README.md`, and the roadmap/release history. `npm run docs:check`
passes (125 Markdown files, 12 ADRs).

## Tests and coverage

- `npm run test:aos` (12 node:test cases over the AOS validators and
  research scoring/freshness functions): **12/12 passed**.
- `npm run test:run` (Vitest): **309/309 passed**, including 9 new AOS
  page tests covering the honest "not generated yet" state, real-data
  rendering, and category filtering.
- `npm run test:coverage`: **76.5% statements/lines** (threshold 75%) —
  initially regressed to 71.42% after adding untested AOS UI code;
  recovered by adding `src/pages/aos.test.tsx` rather than lowering the
  threshold (thresholds are Critical-risk to change per
  `.agent/quality/coverage.md`, and were not touched).
- `npm run test:e2e` (full spec set, Desktop Chromium): **155/155
  passed**. The initial full evidence run found 8 real failures in the
  new AOS specs (a browser-cached 404 for the pre-existence of
  `public/generated/aos-snapshot.json`, and two ambiguous locators); all
  were root-caused and fixed (see the `fix(aos)` commit), then re-verified
  green.

## Known environment limitation (not a code defect)

`npm run build` and everything that depends on it (`build:pages`,
`test:visual`, `test:performance`, `test:release-candidate[:pages]`,
`quality:analyze`, `validate:release`) fail in this environment because
the pre-existing local `dist/` directory (predating this session) has a
file (`site.webmanifest`) this environment cannot delete or read
(`EPERM`/"Access is denied" from both Bash and PowerShell, with and
without sandbox bypass) — not something introduced by this change.
Verified the build itself is correct by building to a clean alternate
directory (`vite build --outDir dist-tmp-check`): it succeeded with 0
errors, produced the expected lazy-loaded AOS chunks
(`AosPage-*.js`, `aosUiText-*.js`), and was removed after verification.
Recommendation: delete or rename the stale local `dist/` directory (or
run on a machine/CI runner without that lock) before the next real
release build.
