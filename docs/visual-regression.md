# Visual regression testing

Playwright keeps operating-system-specific snapshots (`*-win32.png`, `*-linux.png`, and `*-darwin.png`). Linux must never fall back to Windows images, and thresholds remain at Playwright defaults.

The `visual-chromium` project pins the Playwright package/browser revision through `package-lock.json` and fixes viewport, locale, timezone, device scale, dark color scheme, and reduced motion. The fixture clears storage, disables motion, waits for fonts, masks live build identity, and uses controlled page state. Tests must use web-first waits; arbitrary sleeps, random content, and auto-approval are prohibited.

## Reviewed Linux workflow

There are two ways to generate reviewed Linux candidates. Both are read-only,
never commit, never push, and never write `main`; missing Linux images remain
an explicit release blocker until a human approves the artifact.

### Pull-request label (works before the workflow exists on `main`)

`workflow_dispatch` workflows can only be launched from the Actions UI once
their file exists on the repository's default branch. Until this workflow is
merged to `main`, use the PR-triggered path instead:

1. Add the `generate-linux-visual-candidates` label to the open PR. This runs
   the `visual-linux-candidates` job in `ci.yml` (`pull_request` trigger,
   gated on the label; the normal `visual-linux` compare job is unaffected).
2. The job checks out the exact PR head SHA, generates only missing
   `*-linux.png` snapshots (`--update-snapshots=missing`), reruns the visual
   suite to verify them, and writes `quality/generated/visual-candidate-manifest.json`
   (repository, PR number, head/base/merge SHA, workflow run ID, Playwright
   version, browser revision, Linux image version, and per-screenshot test
   title, route, language, viewport, filename, checksum, and `pendingReview`
   status).
3. Download the `visual-linux-candidates-pr<number>-<run-id>` artifact.
4. Review each expected/actual/diff pair, trace, and HTML report per the
   checklist below.
5. Copy only approved `*-linux.png` files into the matching screenshot
   directories on the PR branch, commit, and remove the label.

### Manual `workflow_dispatch` (once available on `main`)

1. Open **Actions → Generate reviewed Linux visual baselines → Run workflow**.
2. Choose a non-main branch and type `GENERATE_REVIEWED_LINUX_BASELINES` exactly.
3. Optionally narrow work with the file and grep filters; record the suite group. The reviewed release viewport/language groups are `desktop` and `he-en`.
4. Download `reviewed-linux-visual-candidates-<run-id>`.
5. Review each expected/actual/diff pair, trace, and HTML report. Reject clipping, overlap, wrong RTL/LTR direction, missing focus, broken content, or unexpected layout.
6. Check representative Login, Hebrew/English Dashboard, AI Radar, profile menu, Lessons, Prompt Library, Prompt Builder, QA Center, mobile Dashboard, Runtime, About, Playgrounds, Guided Auth, and AOS pages.
7. Copy only approved `*-linux.png` files into the matching screenshot directories on the fix branch.
8. Commit the reviewed images on that branch and rerun normal CI.

## Local intentional update

```powershell
$env:VISUAL_UPDATE_APPROVED="1"
npm run test:visual:update -- e2e/specs/visual.spec.ts --grep="Dashboard"
Remove-Item Env:VISUAL_UPDATE_APPROVED
```

Run `npm run test:visual` afterward and inspect every changed PNG before committing. Do not update snapshots merely to silence a failure.

## Version 1.4 Linux baseline status

All 82 Linux screenshots in `e2e/specs/visual.spec.ts` are committed,
reviewed for content correctness, and confirmed passing against the real
`visual-linux` compare job — not just checksum-stable across repeated
candidate-generation runs (see below for why that distinction matters).
No screenshot is excluded or skipped. The gate passed five consecutive
real `visual-linux` runs at the final head SHA with no recurrence — see
below for why "three consecutive passes" twice turned out to be
insufficient before that.

Getting there required root-causing several distinct bugs, not one:

- **Commit-SHA mismatch**: `visual-linux` checked out GitHub's synthetic
  `pull_request` merge commit while `visual-linux-candidates` checked out
  the PR's actual head SHA — two different real commits, each embedding a
  different `commitSha` into the build via Vite's `define`, which shifted
  the rendered width of every masked commit/build field. Fixed by pinning
  every job's checkout and `VITE_DEPLOY_COMMIT_SHA` to the same head SHA.
- **Missing content-visibility waits**: several screenshots (Dashboard,
  onboarding, Help Center) were captured before their route's real content
  had rendered, showing stale or truncated content. Fixed with explicit
  `toBeVisible()` waits on stable content anchors before each capture.
- **Native `<progress>` animation**: not covered by the existing
  animation-disabling CSS, causing onboarding progress-bar instability.
- **Stacked/residual GPU compositing jitter**: `.profile-backdrop`'s
  translucent overlay, compositing first over an already-blurred sidebar/
  header and then (after that was fixed) over the dashboard content
  behind it, left ~1-unit rounding jitter. Fixed in two passes: disabling
  `backdrop-filter` on the sidebar/header when the profile layer is open,
  then flattening the backdrop itself to opaque for screenshot capture.
- **`overflow-wrap: anywhere` vs `white-space: nowrap`**: the QA Center
  release-status badge could still wrap at mobile widths even after
  `white-space: nowrap` was applied, because Chromium's `overflow-wrap:
  anywhere` inserts letter-level break opportunities as a last resort
  independent of `white-space`. Real, correct hardening — but not the
  actual cause of the flake still recurring afterward.
- **Fonts not settled before a layout-sensitive click**: the true root
  cause of the `mobile-qa-center`/`profile-menu` flake surviving three CSS
  fixes. `loadSampleIfAvailable()`'s button click and the profile-menu
  trigger click both happened before `stabilize()`'s fonts-ready wait,
  which only ran right before the screenshot. If the click's target was
  off-screen, Playwright's built-in scroll-into-view (or, for the profile
  menu, React's own `getBoundingClientRect()`-based popover positioning)
  measured layout at click time — using fallback-font metrics if a
  Hebrew/custom font hadn't finished applying yet, producing a slightly
  different scroll distance or popover position than once fonts settled.
  Fixed with a `waitForFonts()` helper called right after navigation,
  before the click, not just before the capture.

  This one took five attempts total — three CSS changes (real hardening,
  but not sufficient alone), one JS change that was disproven locally
  before ever reaching CI (forcing `scrollTo(0, 0)` fixed nothing and
  broke 8 other tests by revealing a header the approved baselines had
  never been captured with), and finally the fonts-timing fix. See
  `quality/runtime/visual-exclusion-audit.md`'s root cause #3 for the
  full history.

**Practical implications, hard-won:**
1. Passing the candidate-generation determinism check (same checksum
   across two generation runs) is necessary but not sufficient proof a
   baseline will pass the real compare gate — confirm every baseline
   against an actual `visual-linux` run, not just `visual-linux-candidates`.
2. Even the real `visual-linux` job passing — more than once — at one SHA
   is not proof the underlying bug is gone, only that it didn't recur in
   those particular runs. A fix is verified only when there's a concrete
   mechanism explaining why the bad state is now structurally unreachable,
   not merely less likely to occur. Two different fixes here each passed
   multiple consecutive real-gate runs (2, then 3) and still weren't done.
3. A plausible-sounding mechanism still needs to be checked against
   already-passing behavior, not just the failure it targets — a cheap
   local A/B comparison (e.g. `git stash` the fix, re-run, compare) can
   catch a wrong fix before spending a CI round-trip on it.
