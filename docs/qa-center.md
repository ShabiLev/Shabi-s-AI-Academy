# QA Center

Version 1.2.0-beta.1 shows complete AI Workspace, AI Radar, and UX hardening capability status and evidence. Mock Provider is available; Live Provider is intentionally not executable and is not a release failure. The versioned manual checklist adds bilingual search quality, Command Palette keyboard behavior, Assistant honesty, workflow usability, Radar attribution, profile overlay behavior, export/import review, analytics privacy, Mobile Assistant, duplicate-header review, and sidebar overflow.

A bilingual, protected route (`/qa`, nav item after Settings) that gives an honest view of release quality — never a fabricated "all green" dashboard.

## Data sources, in priority order

The page (`src/pages/QACenterPage.tsx`) resolves exactly one of four states, shown explicitly in the UI (never silently):

1. **Imported report** — a JSON file the user picked via the "Import report JSON" file input, persisted in `localStorage` (`shabi-ai-academy.qa-report-import.v1`) so it survives a refresh. Takes priority because it's the most deliberate user action.
2. **Locally generated report** — fetched from `/generated/latest-quality-report.json`, which `npm run quality:collect` copies from `quality/generated/latest-quality-report.json` into `public/generated/` (gitignored, dev/preview-only — see `quality/README.md`).
3. **Sample data** — the bundled `sampleQualityReport` (`src/quality/qualityData.ts`), loaded only after the user explicitly clicks "Load sample data". Always labeled **"Sample data"** in the source line; never shown by default.
4. **No result available** — the honest default when none of the above exist. The page explains how to get a real result (run `quality:collect` or import a file) instead of showing an empty shell.

An invalid or unsupported-schema import shows a controlled error message (`src/quality/qualitySchema.ts`'s `parseQualityReport`/`parseQualityReportText`) — it never crashes the page and never falls through to a different source silently.

### Staleness

`computeReportStaleness()` (`src/quality/qualityData.ts`) flags, independently: application-version mismatch, commit-SHA mismatch (only when both the report and the current build actually have a commit SHA — never fabricated), and "older than 14 days". Each shows its own warning banner.

## Sections

- **A. Release header** — application version, computed release status badge, environment, last-validated timestamp, commit SHA / branch (from real Vite-injected build metadata, `src/quality/buildMetadata.ts` — falls back to `local`/`unknown`/`not available`, never a fabricated value).
- **B. Quality gates** — all 10 gates (`docs/quality-gates.md`) as status badges with both an icon/color _and_ text (Passed/Failed/Warning/Not run/Not available in the active language) — never color-only.
- **C. Test summary** — Vitest and Playwright counts (total/failed/skipped, browser-project count).
- **D. Coverage** — statements/branches/functions/lines vs. thresholds; a trend row explicitly marked "not available yet" (no history is tracked across runs).
- **E. Accessibility** — scanned-page count, violations by severity, count of documented allowlist entries, manual-review status.
- **F. Visual regression** — baseline count (from files on disk), compared count and mismatches (from the last Playwright run), baseline environment string, last baseline update time.
- **G. Performance** — Lighthouse scores per route/device, with the lab-data disclaimer always shown.
- **H. Known issues** — live counts from the local issue register (section I below), not from the imported/generated report — this is real, always-available data, never a stale snapshot.
- **I. Internal issue register** — full CRUD, browser-local.
- **Release checklist** — automated gates (read-only, derived from the loaded report) plus manual checkboxes (`docs/manual-qa-checklist.md`), persisted per application version.
- **Analyzer summary** — the deterministic analyzer's bilingual output (below).

## Deterministic analyzer

`src/quality/qualityAnalyzer.ts` (`analyzeQuality`) — explicitly **not** an AI model, and the UI labels it as such ("Analyzer summary (deterministic rules, not AI)"). Every recommendation maps to one explicit rule (build failed → fix first; coverage below threshold → add tests; visual mismatch → manual review recommended; etc. — full list in `docs/quality-gates.md`). Wording is deliberately "review recommended" / "likely affected area", never "the cause is" — the analyzer states what the data shows, not an inferred root cause.

## Internal issue register

`src/quality/qualityStorage.ts`, `localStorage` key `shabi-ai-academy.qa-issues.v1`. Fields: id, title, description, type (bug/accessibility/performance/visual/automation/technicalDebt), severity (critical/high/medium/low), status (open/inProgress/resolved/acceptedRisk), owner, source, createdAt/updatedAt, optional targetVersion/relatedRoute/relatedTest/notes.

Supports create, edit, resolve, reopen, filter (by severity/status/type), search (title+description), delete with a confirmation dialog, export to JSON, and import with per-entry validation (`parseImportedIssues` drops malformed entries individually rather than rejecting the whole file). **This is browser-local only** — it is not a replacement for GitHub Issues or Jira, and is not synchronized to any external system in v0.5.0.

## Release checklist

`src/quality/checklist.ts` + `qualityStorage.ts`'s `getChecklistForVersion`/`saveChecklistForVersion`, `localStorage` key `shabi-ai-academy.qa-checklist.v1`. A version bump starts a fresh, unchecked checklist for the new version — prior versions' checklists remain in storage and are retrievable (`listChecklistVersions`), not silently carried forward. A report can never show **Ready** while any manual item is unchecked, regardless of automated-gate status.

## Quality report schema

`src/quality/types.ts` (`QualityReport`, `schemaVersion: 1`) — typed, with runtime validation in `qualitySchema.ts` (`parseQualityReport`). Missing optional sections (coverage, accessibility, visual, performance, knownIssues) become `null` and render as "not available" rather than crashing or fabricating a value. An unrecognized `schemaVersion` is a distinct load state (`unsupportedSchema`), separate from a structurally invalid report (`invalid`) or no report at all (`empty`).

## How the report actually gets produced

`quality/scripts/collect-quality-results.mjs` reads whatever artifacts already exist on disk (Vitest/Playwright JSON reports, coverage summary, Lighthouse output, git status) and writes `quality/generated/latest-quality-report.json` — never marking a tool "Passed" if its output isn't present. `quality/scripts/analyze-quality-results.mjs` then computes the release status and analyzer summary and writes them back into the same file. See `quality/README.md` for the full pipeline and its known best-effort limitations (e.g. it can only see whichever Playwright suite most recently produced its per-suite JSON file).
