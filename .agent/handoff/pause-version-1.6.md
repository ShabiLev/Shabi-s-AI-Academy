# Handoff — Version 1.6 release paused for safe resume

Date/time: 2026-07-25 (session clock; see commit timestamps for exact CI times)

## Task

Complete and release Version 1.6.0-beta.1, then hotfix a deterministic
`visual-linux` CI failure discovered on `main` immediately after tagging.

## Scope

In scope: finishing/committing approved Version 1.6 baselines, final local
validation, pushing the release branch, fast-forwarding and tagging `main`,
verifying deployment, and — after a new defect was discovered on `main`'s own
post-tag CI run — a small, targeted hotfix for that defect.
Not in scope (and not started): Version 1.7 implementation, PR #2
reconciliation, npm audit triage beyond what was already summarized in prior
sessions.

## Branch

`fix/1.6.1-qa-center-branch-mask-height` (current). `main` was left untouched
during this pause — no commit was made to `main` beyond the release commits
that were already pushed before the defect was found.

## Starting commit

`cf6b1e712cb5b541ae871b0c209f098a6d56f215` (`main` before this session's
release work).

## Latest commit

`f94e2130c8181d2e40be953ce84784b5de58293f` on
`fix/1.6.1-qa-center-branch-mask-height` (pushed to origin; matches
`origin/fix/1.6.1-qa-center-branch-mask-height`).

`main` local and remote: `c79b4e7199eb257142c3d907ab06fdd2cdccd4dc` (tag
`v1.6.0-beta.1` points to this same commit — confirmed via
`git rev-parse v1.6.0-beta.1^{commit}`).

## Files changed

On `fix/1.6.1-qa-center-branch-mask-height` (uncommitted work turned into one
WIP commit `f94e213`):

- `src/pages/QACenterPage.tsx` — added a `qa-header-grid-truncate` class and a
  `title` attribute to the last-validated/commit/branch `<dd>` elements.
- `src/styles/index.css` — added the `.qa-header-grid-truncate` rule
  (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`).
- `e2e/specs/__screenshots__/visual-chromium/visual.spec.ts/qa-center-win32.png`
  — regenerated locally, **not yet reviewed/approved**.
- `e2e/specs/__screenshots__/visual-chromium/visual.spec.ts/qa-center-en-win32.png`
  — regenerated locally, **not yet reviewed/approved**.

Earlier in this session (already committed and pushed to `main` before the
pause, not part of this WIP): the QA Center staleness fix
(`src/quality/qualityData.ts`, `src/pages/QACenterPage.tsx` masking,
`src/quality/qualityData.test.ts`), 6 QA Center baseline files (3 win32 + 3
linux), `CHANGELOG.md`, and `docs/release-waivers/1.6.0-beta.1-linux-visual.md`.

## Tests executed

- Full local validation suite (`npm ci`, `docs:check`, `aos:check`,
  `test:aos`, `test:evidence`, `test:release`, `memory:check`, `lint`,
  `test:run` — 335/335 passed, `test:coverage`, `build`, `build:pages`,
  `catalog:check`, `quality:inventory`, `test:e2e:functional` — 15/15,
  `test:e2e:cross-browser` — 10/10, `test:journeys` — 13/13, `test:ux` —
  39/39, `test:a11y` — 75/75, `test:performance` — all routes pass,
  `quality:collect`/`analyze`/`system-report`, `retention:verify`): all
  passed, run before the release commit/push.
- `npm run test:visual` (local, Windows/`win32` baselines): 43/64 failed —
  root-caused as pre-existing, unrelated technical debt (see "Known Linux/
  Windows visual exceptions" below), user explicitly accepted proceeding.
- Exact-SHA CI on the release branch push (run `30160286088`, commit
  `c79b4e7`): all 7 jobs passed, including `visual-linux`.
- Exact-SHA CI on `main` after fast-forward (run `30160471925`, same commit
  `c79b4e7`): `visual-linux` and `quality-summary` **failed**; all other 5
  jobs passed. This is the defect this pause is about.
- After the hotfix: regenerated `qa-center-win32.png` / `qa-center-en-win32.png`
  and re-ran the 4 QA Center visual scenarios 3 consecutive times locally —
  all passed, stable. **Not yet run on CI.**

## Evidence path

`quality/generated/latest-quality-report.json` and
`quality/generated/vitest-results.json` reflect the last full local run
(pre-hotfix, pre-pause). No dedicated `quality/runtime/execution/latest/`
evidence snapshot was generated for the hotfix itself yet.

## Open failures

- `main` at `c79b4e7` (tag `v1.6.0-beta.1`) currently fails its own
  `visual-linux` CI job deterministically. Root cause confirmed (see below).
  The fix exists as an unreviewed WIP commit on
  `fix/1.6.1-qa-center-branch-mask-height`; it has NOT been merged to `main`.
- `quality-summary` also failed on that same `main` run, purely as a
  consequence of `visual-linux` failing (the gate aggregator correctly
  reports the real job failure) — not a separate defect.

## Warnings

- **Root cause of the `main` CI failure** (confirmed via byte-level PNG diff
  of `main` run `30160471925`'s `visual-linux-artifacts`, viewed the diff
  image directly): the mismatch is entirely in the "branch" field's mask box
  in `QACenterPage.tsx` (`data-visual-mask="branch"`), not the "Last
  Validated" field this session had been fixing. `buildMetadata.branch`
  comes from `git rev-parse --abbrev-ref HEAD`
  (`quality/scripts/write-build-metadata.mjs:17`). The installed baseline was
  captured on CI while checked out on the long branch name
  `fix/1.5-dashboard-navigation-simplification` (44 chars, which wraps
  inside the ~160px `.qa-header-grid` column); `main`'s own capture shows
  the short `"main"` (no wrap) — a genuinely different masked-box height
  between the two contexts. Confirmed reproducible 3/3 times via CI retries
  on that run. **This is deterministic, not flaky noise** — every future CI
  run on `main` will keep failing this exact way until the hotfix lands.
- Do NOT assume the two regenerated Windows PNGs on
  `fix/1.6.1-qa-center-branch-mask-height` are approved. They are not.
  Present them in a review package (old vs new, dimensions, SHA-256) before
  installing/merging anything further, per this repo's standing baseline
  governance (no self-approval of visual baselines, ever).
- Do NOT assume the Linux equivalents of these 2 files have been
  regenerated at all — they have not. CI has not yet run on
  `fix/1.6.1-qa-center-branch-mask-height`.
- The originally-planned Linux waiver
  (`docs/release-waivers/1.6.0-beta.1-linux-visual.md`, about
  `mobile-qa-center-linux.png`'s ~1-level color-quantization noise) is still
  accurate and unaffected by this new defect — it documents a different,
  separate, already-accepted condition. Do not conflate the two.
- Known pre-existing, separately-tracked technical debt (not blocking, not
  part of this pause): 43 of 64 local Windows-only (`win32`) visual
  baselines are stale relative to the Dashboard-simplification refactor
  (`2cb81a8`) because commit `f4f59ba` only regenerated the Linux (`-linux.png`)
  baselines used by CI, never the matching `win32` ones. Confirmed via direct
  image inspection (correct new UI, just a stale/short baseline). CI's
  `visual-linux` job is unaffected. User explicitly approved proceeding with
  this logged as technical debt rather than fixed now.

## Manual review

Pending: the 2 regenerated Windows PNGs on this branch need a review package
and explicit user approval before install/merge. Not started yet (this pause
interrupted that step).

## Next action

Build an old-vs-new review package (dimensions + SHA-256, same format used
for every other baseline this session) for `qa-center-win32.png` and
`qa-center-en-win32.png` on `fix/1.6.1-qa-center-branch-mask-height`, publish
it, and wait for explicit approval before doing anything else with these files.

## Prohibited assumptions

- Do not assume `main` is currently green. It is not — `visual-linux` fails
  deterministically on every run until the hotfix lands.
- Do not assume the hotfix is reviewed, approved, tested on CI, or merged.
  None of that has happened yet.
- Do not assume the QA Center staleness fix (the original session task) is
  unrelated to this — the newly discovered defect was only exposed because
  installing that fix's baselines (captured on a long branch name) was the
  first time this branch/main promotion path was exercised for this file.
- Do not restart the entire Version 1.6 validation process from scratch —
  everything through "fast-forward + tag main" is done and verified; only
  the hotfix-review-merge-reverify sequence remains.
- Do not create a pull request, merge to main, deploy, or start Version 1.7
  until the user explicitly resumes and approves each of those steps again.

## PR #1 / PR #2 notes

- PR #1 (`feature/1.5.0-aos-core-ux-radar` → some upstream branch): confirmed
  via `git merge-base --is-ancestor feature/1.5.0-aos-core-ux-radar
  fix/1.5-dashboard-navigation-simplification` that its branch tip is fully
  contained in the released work — zero unique commits, safe to treat as
  superseded. Not closed (per instruction: only close obsolete PRs when safe
  and permitted, not decided this session).
- PR #2 (`fix/1.4.0-ci-memory-visual-release` → `main`): has 32 commits not
  present in the released branch (`git log fix/1.4.0-ci-memory-visual-release
  --not fix/1.5-dashboard-navigation-simplification --oneline` = 32). Requires
  a full reconciliation review before any disposition decision. Deferred,
  unchanged from prior sessions' findings.
- Neither PR was merged, closed, or commented on this session.

## Main status

`main` local and remote both at `c79b4e7199eb257142c3d907ab06fdd2cdccd4dc`,
tagged `v1.6.0-beta.1`. Working tree clean. `main`'s own CI (run
`30160471925`) currently shows `visual-linux` and `quality-summary` failed,
5 other jobs passed. This is the known, root-caused, not-yet-fixed-on-main
condition this pause is about.

## Deployment status

- GitHub Pages: `Deploy GitHub Pages` workflow is triggered by
  `workflow_run` after `CI` completes on `main`. It fired for `main` run
  `30160471925` but the run's own conclusion needs re-confirming after the
  hotfix (deploy jobs showed "skipped" — expected, since the deploy build's
  `if` condition requires the triggering CI run to have concluded
  `success`, and `30160471925` concluded `failure`). **GitHub Pages has not
  deployed the Version 1.6 commit successfully yet.**
- Vercel: `vercel.json` exists but there is no GitHub Actions workflow for
  it and no local `.vercel/` project link — Vercel deployment (if any)
  happens via that platform's own GitHub integration, outside this session's
  visibility. Fetching `https://shabi-s-ai-academy.vercel.app` only returned
  the static SPA shell (no JS execution), so the deployed commit could not
  be confirmed from this session. **Not independently verified.**
- No production smoke test was completed — deployment was not confirmed
  green, so this pause interrupted the process before that step was reached.

## Rules

- Every field above reflects actual, verified state from this session —
  commit hashes, CI run IDs/conclusions, and file lists were all re-checked
  immediately before writing this document, not recalled from memory.
