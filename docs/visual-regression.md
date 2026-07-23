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

63 of 82 Linux candidates generated against PR #2 (`fix/1.4.0-ci-memory-visual-release`)
are confirmed committed baselines: reviewed for content correctness AND
verified passing against the real `visual-linux` compare job (not just
checksum-stable across repeated candidate-generation runs — see below for
why that distinction matters). 19 candidates are excluded and are an
explicit release blocker until root-caused and re-approved.

12 showed a different checksum across repeated *generation* runs at the same
head SHA, so they were never trustworthy: `mobile-drawer-open`,
`mobile-profile-menu-en`, `mobile-profile-menu-he`, `profile-menu-en`,
`profile-menu-he`, `runtime-details`, `runtime-details-en`, `runtime-dry-run`,
`runtime-dry-run-en`, `v13-onboarding-en-desktop`, `v13-onboarding-he-desktop`,
`workspace-command-palette`. (`v13-glossary` and `v13-profile` showed this
same symptom — a `fullPage` screenshot captured before the route's content
rendered — and were fixed by waiting for `.glossary-grid`/`.profile-form`
visibility before capture, the same pattern already used for Dashboard.)

7 more — `about-en`, `about-he`, `qa-center`, `qa-center-en`, `mobile-qa-center`,
`mobile-qa-center-en`, `v13-help-center` — were checksum-stable across
repeated *candidate-generation* runs and were committed on that basis, but
then failed the real `visual-linux` compare job in a later run at the same
head SHA. The diff showed an extra "Ready with warnings" release-status
badge present in the compare run that was absent from the candidate
generation run, shifting all page content below it. Both job types run the
same `npm run test:visual` command against the same head SHA and the same
committed source, so this is a real, reproducible environment/timing
difference between candidate-generation and compare runs, not app-code
flakiness or a masking gap — it deserves dedicated root-causing rather than
a guess, since it affects unrelated pages (About, QA Center, Help Center)
and may explain some of the 12 above too. **Practical implication: passing
the candidate-generation determinism check (same checksum across two
generation runs) is necessary but not sufficient proof a baseline will pass
the real compare gate — every committed baseline should also be confirmed
against an actual `visual-linux` run before being treated as final,** which
is why the 63 committed here were cross-checked against a real compare-job
run and the 7 above were not, since that check happens after commit.

Two related bugs were found and fixed during this review (see git history):
a missing `.dashboard-continue h1` visibility wait before several Dashboard
screenshots (including the redirect-based admin-denial capture), which
made `v13-dashboard-beginner`/`v13-dashboard-advanced` pixel-identical; and
a native `<progress>` element animation not covered by the existing
animation-disabling CSS, which fixed the `v13-onboarding-*-desktop`
instability. `v13-glossary` and `v13-profile` showed the same class of
symptom (a `fullPage` screenshot captured at a smaller height than the
page's real content) and are good candidates for the same fix, but were
left unstable rather than making a broader, unverified change to fix them
in this pass. Missing Linux images for the excluded 14 remain an explicit
release blocker until reviewed and approved in a follow-up pass.
