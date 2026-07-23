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
