# Handoff: PR #2 Version 1.4 visual-regression recovery (stopped mid-investigation)

## Task

Recover PR #2 (`fix/1.4.0-ci-memory-visual-release` → `main`) to a fully
green, mandatory-gate-passing state — in particular the `visual-linux`
Linux visual-regression compare job — without merging, without pushing
`main`, and without excluding, masking, or raising tolerances on any
screenshot. Never merge PR #2 or push `main` — that requires the user's
explicit action.

## Scope

In scope: `.github/workflows/ci.yml` and `generate-visual-baselines.yml`,
`e2e/fixtures/visual.ts`, `e2e/specs/visual.spec.ts`, Linux/Windows
screenshot baselines under `e2e/specs/__screenshots__/`, `src/styles/index.css`
where a real rendering-determinism bug was found, `scripts/release-readiness.test.mjs`,
`docs/visual-regression.md`, `quality/runtime/visual-exclusion-audit.md`
(gitignored, local-only audit trail — not committed). Out of scope: PR #1
(`feature/1.5.0-aos-core-ux-radar`), anything on `main`.

## Branch

`fix/1.4.0-ci-memory-visual-release`

## Starting commit (this session's continuation)

`623bebe` — "fix(visual): stabilize profile menu and onboarding modal captures"
(profile-menu backdrop-filter fix + help-center/onboarding visibility waits,
from before this session was compacted)

## Latest commit (pushed)

`060bb21` — "docs(visual): finalize Version 1.4 Linux baseline status"

This is the last commit **pushed to the remote branch**. It is currently
believed by the author to be **not actually green** — see "Open failures"
below. Do not treat `060bb21` as resolved.

## Uncommitted local change (NOT pushed, NOT verified — this is the critical state)

`e2e/fixtures/visual.ts` has an **uncommitted** edit adding a scroll-reset
to `stabilize()`:

```ts
await page.evaluate(() => window.scrollTo(0, 0));
```

placed at the top of `stabilize()`, before the fonts-ready wait. Rationale:
see "Root cause investigation, current leading theory" below. This was
mid-verification (running `npm run test:visual` locally) when the stop
request arrived. The local run completed (exit code 1, 28 failed / 32
passed) but **the failure list was not yet compared line-by-line against
the known-preexisting-noise baseline** (previously 23 failures on this
machine, unrelated to any code in this PR — see `docs/visual-regression.md`
history and this file's own earlier commits). 28 vs 23 could be normal
variance in that known-noisy set, or could include new regressions from
the scroll-reset change. **This has not been determined.**

Do not commit this change without first:
1. Re-running `npm run test:visual` locally 1–2 more times to see if the
   failure count/list for this change is stable (the pre-existing noise
   set is itself flaky run-to-run on this machine).
2. Diffing the failure list against the last-known-clean-of-this-change
   list to confirm no NEW local failures were introduced beyond the
   established noise.
3. Only then committing, pushing, and re-running the real `visual-linux`
   CI gate — multiple times (see below for why "twice" was proven
   insufficient this session).

The log from the completed local run is saved at (local machine only,
not committed):
`C:\Users\SHABIL~1\AppData\Local\Temp\claude\c--Users-ShabiLevanda-Cello-PycharmProjects-Shabis-AI-Academy\d5719b8d-1760-44e0-b3a1-bb10b8c6e1cf\scratchpad\local-visual-after-scrollfix.log`

## Files changed (across this session's commits, `623bebe`..`060bb21`, plus the uncommitted diff)

- `.github/workflows/ci.yml`, `generate-visual-baselines.yml` — commit-SHA
  alignment (from earlier in the overall task, already on `main`-bound
  history before this handoff's window)
- `e2e/fixtures/visual.ts` — profile-backdrop opacity fix (committed,
  `14c70c1`); **scroll-reset in `stabilize()` (UNCOMMITTED, see above)**
- `src/styles/index.css` — `.qa-status-badge` white-space/overflow-wrap
  fix, `.qa-header-grid` single-column media query (both committed,
  `14c70c1`, `2f3345d`, `285bfdb`)
- `scripts/release-readiness.test.mjs` — rescoped the CI `update-snapshots`
  guard to mandatory jobs only, since the label-gated
  `visual-linux-candidates` job legitimately needs it (committed, `28954a4`)
- `docs/visual-regression.md` — rewritten "Version 1.4 Linux baseline
  status" section (committed, `060bb21`)
- `quality/runtime/visual-exclusion-audit.md` — full root-cause audit
  trail, gitignored/local-only, kept up to date throughout
- ~15 Linux and ~9 Windows baseline PNGs regenerated and individually
  reviewed across this session's commits (see git log between `623bebe`
  and `285bfdb` for the exact file lists per commit)

## Tests executed

- `npm run lint` — passed (30 pre-existing warnings in generated coverage
  files, 0 errors), each time re-checked after a CSS/script change
- `npm run test:run` — 313/313 passed
- `npm run build` — passed
- `npx tsc --noEmit -p .` — passed, including after the uncommitted
  scroll-reset change
- `npm run test:performance` — passed (all Lighthouse budgets)
- `npm run quality:collect` / `quality:analyze` — ran; locally reports
  `readyWithWarnings` because the LOCAL `test:visual` run (Windows,
  known-noisy) shows the visual gate failed — this is expected local
  noise, not a real signal (see docs/visual-regression.md's local-vs-CI
  distinction)
- `npm run test:e2e:pages` — 4/4 passed
- `git diff --check` — clean (only a CRLF-normalization warning)
- `npm run validate:release` — NOT fully completed end-to-end in one run;
  ran piecemeal (see below) because the full chain's `&&` stops at the
  first failure, and `test:visual` fails locally due to the same
  pre-existing Windows-environment noise documented throughout this
  file's git history — confirmed via `git stash` against unmodified code
  earlier in this overall task
- Real CI (`visual-linux` job, the actual mandatory gate) — see "Open
  failures", this is the crux of why the session stopped mid-task

## Evidence path

No `quality/execution/latest/` evidence run was generated/finalized in
this continuation (no `npm run quality:evidence*` invocation). The
working notes are in `quality/runtime/visual-exclusion-audit.md`
(gitignored, local machine only — read it before repeating any of this
investigation).

## Open failures

**`visual-linux` (the real, mandatory compare-gate job) is not reliably
green.** History this session, all at the `fix/1.4.0-ci-memory-visual-release`
branch tip, each a genuinely different commit unless noted:

| SHA | Result | Failing tests |
|---|---|---|
| `1f84080` | fail → fixed | 7 stale baselines (help-center, onboarding×4, mobile-qa-center×2) |
| `14c70c1` | fail → fixed | profile-menu×4 (backdrop), qa-center-en (stale) |
| `ef536b2` | **pass ×2** (original + 1 rerun) | none |
| `28954a4` | fail | mobile-qa-center(-en)×2, profile-menu×2 — **recurrence with no app-code change since the last green SHA** |
| `2f3345d` | fail | mobile-qa-center(-en)×2 — same 9988px diff as `28954a4`, proven via md5 to be the exact same failing render recurring despite the grid-column fix |
| `285bfdb` | **pass ×3** (original + 2 reruns) | none |
| `060bb21` (docs-only commit, no app change) | fail | mobile-qa-center(-en)×2 — **the exact same 9988px diff recurred again**, with a third distinct md5 of the "actual" PNG (not matching either previous failing state), but the same visual signature (doubled/overlapping text, page content that looks like it's missing its top ~1 badge-height of content) |

**The load-bearing finding from the last investigation before stopping:**
in the `060bb21` failure, the "actual" screenshot's very first visible
row is the "Environment" field label, with the "Ready with warnings"
badge pill **not visible at all** — in every previously-reviewed-good
capture, that badge is the first thing visible at row 0. This looks like
a **scroll-position** difference (some amount of content scrolled out of
view above the fold), not a text-wrap/line-height difference as the
previous three fix attempts assumed. Leading theory, not yet verified:
Playwright's `.click()` auto-scrolls an off-screen target into view before
clicking (`loadSampleIfAvailable()` clicks a "Load sample data" toggle);
if the pre-click empty-state layout is short enough that little/no scroll
is needed in one run but a few pixels are needed in another (e.g. due to
sub-pixel font-metric timing before the click), the residual `scrollTop`
carries over into the much-taller post-click "Sample data loaded" layout
and clips a variable number of pixels off the top of the non-fullPage
screenshot. This would also explain the small (~31–33px) residual
`profile-menu-{en,he}` diffs seen at `28954a4` and `060bb21` under the
same mechanism at a smaller scale (the profile trigger button needing a
smaller scroll-into-view). The uncommitted `window.scrollTo(0, 0)` fix in
`stabilize()` targets exactly this — **but it is unverified** (see above).

**Three prior fix attempts for what looked like the same symptom, each
disproven by a subsequent real `visual-linux` failure at a fresh SHA with
zero app-code change in between:**
1. `white-space: nowrap` on `.qa-status-badge` (`14c70c1`)
2. Forcing `.qa-header-grid` to a single column below 30rem (`2f3345d`)
3. `overflow-wrap: normal` on `.qa-status-badge` (`285bfdb`)

Each looked verified at the time (lint/build/typecheck clean, Windows
baselines reviewed, and in fixes 1 and 3's case, 2–3 consecutive real
`visual-linux` passes) and each was later proven incomplete by a
subsequent failure. **Do not trust "N consecutive green real-CI runs" as
final proof again without also being able to articulate the concrete
mechanism that makes the bad state structurally unreachable** — this is
the single most important lesson from this session, now written up in
both `docs/visual-regression.md` and
`quality/runtime/visual-exclusion-audit.md`.

`profile-menu-{en,he}` (desktop) also failed at `28954a4` and `060bb21`
with small (~31–33px) diffs, same character as `mobile-qa-center`'s
residual — likely the same scroll-position root cause at smaller
magnitude. Not yet separately confirmed.

## Warnings

- **Do not assume `060bb21` is mergeable.** It is the current PR #2 head
  but its own CI run showed `visual-linux` failing.
- **Do not re-attempt fixes 1–3 above** (nowrap, grid single-column,
  overflow-wrap: normal) — all three are already applied and committed,
  and none of them, individually or combined, has stopped the recurrence.
  The next fix must address scroll position, not text wrapping — unless
  new evidence overturns that theory.
- **A single green run, or even 2–3 in a row, is not sufficient
  confirmation** for this specific flake — it has gone 2 and 3 runs green
  before recurring at the very next SHA, twice. Whatever fix comes next
  should be verified with **at least 3–5 consecutive real `visual-linux`
  passes at the exact final SHA**, and ideally with a concrete explanation
  (like the md5/diff-pattern analysis technique used throughout this
  session — see `quality/runtime/visual-exclusion-audit.md` and the custom
  `png-diff.mjs`/`png-crop.mjs` scripts referenced there) rather than
  green-run-counting alone.
- The `generate-linux-visual-candidates` PR label was removed earlier
  this session (baseline generation was believed complete). If more
  Linux candidate generation is needed, re-add it via
  `gh pr edit 2 --add-label generate-linux-visual-candidates`, then
  remove it again once done.
- Local `npm run test:visual` on this Windows machine has ~23–28 known
  pre-existing failures unrelated to any code in this PR (confirmed via
  `git stash` against unmodified code earlier in the overall task) — do
  not treat local visual-test failures as meaningful on their own; only
  the real Linux CI `visual-linux` job is authoritative.
- Never increase global or per-test screenshot tolerances
  (`maxDiffPixels`/`maxDiffPixelRatio`), never broaden masks, never mark a
  screenshot "approved" without individually viewing it, per this task's
  standing user directive.

## Manual review

Not applicable / not yet reached — PR #2 has not been declared ready for
merge. No human UX/security review has been requested yet for this PR.

## Next action

1. Decide whether to keep investigating the scroll-position theory (finish
   verifying the uncommitted `window.scrollTo(0, 0)` change in
   `e2e/fixtures/visual.ts`, per the steps under "Uncommitted local
   change" above), or take a different diagnostic path.
2. If proceeding with the scroll-position fix: commit only after local
   verification, push, then re-run the real `visual-linux` CI gate at
   least 3–5 times at the same final SHA (`gh run rerun <run-id>`) before
   trusting it.
3. Once `visual-linux` and `quality-summary` are both genuinely,
   repeatedly green: re-run the full `npm run validate:release` chain
   end-to-end (it was never completed as one unbroken run this session —
   only run piecemeal around the known local `test:visual` noise).
4. Update `quality/runtime/visual-exclusion-audit.md` and
   `docs/visual-regression.md` with the final resolution.
5. Produce the PR #2 final readiness report and stop for the user's
   explicit merge decision. Do not merge PR #2 or push `main`.

## Prohibited assumptions

- Do not assume any commit in `623bebe..060bb21` is the final state —
  `060bb21` is currently believed failing.
- Do not assume 2 or 3 consecutive green real-CI runs means a fix is
  complete — this session has direct counter-evidence twice.
- Do not assume the local Windows `test:visual` failure count/list is
  meaningful without first confirming it against the documented
  pre-existing-noise baseline.
- Do not assume the uncommitted `e2e/fixtures/visual.ts` scroll-reset
  change is correct or safe — it is a reasoned hypothesis, not yet
  verified locally or in CI.
- Do not merge PR #2 or push to `main` under any circumstance without the
  user's explicit, in-session authorization.

## Rules

- Every field above reflects actual, verified state as of the stop
  request, not a guess or a memory of an earlier plan.
