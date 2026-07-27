# Visual regression testing

Playwright keeps operating-system-specific snapshots (`*-win32.png`, `*-linux.png`, and `*-darwin.png`). Linux must never fall back to Windows images. Screenshot comparison uses a conservative global `maxDiffPixelRatio` of `0.002` to absorb minor renderer noise without hiding layout regressions.

The `visual-chromium` project pins the Playwright package/browser revision through `package-lock.json` and fixes viewport, locale, timezone, device scale, dark color scheme, and reduced motion. The fixture clears storage, disables motion, waits for fonts, masks live build identity, and uses controlled page state. Tests must use web-first waits; arbitrary sleeps, random content, and auto-approval are prohibited.

Dashboard screenshots wait for the stable semantic hooks `data-testid="dashboard-page"` and `data-testid="dashboard-content"`. Tests must not wait for layout classes such as grid or card selectors: those classes may change during an intentional responsive redesign without changing the Dashboard contract. Redirect-based visual scenarios must also wait for the final URL and Dashboard root before capture.

## Controlled Linux workflow

1. Open **Actions → Generate reviewed Linux visual baselines → Run workflow**.
2. Choose a non-main branch and type `GENERATE_REVIEWED_LINUX_BASELINES` exactly.
3. Optionally narrow work with the file and grep filters; record the suite group. The release viewport/language groups are `desktop` and `he-en`.
4. Download `reviewed-linux-visual-candidates-<run-id>`.
5. Review representative expected/actual/diff pairs, traces, and the HTML report. Reject clipping, overlap, wrong RTL/LTR direction, missing focus, broken content, or unexpected layout.
6. Check representative Login, Hebrew/English Dashboard, AI Radar, profile menu, Lessons, Prompt Library, Prompt Builder, QA Center, mobile Dashboard, Runtime, About, Playgrounds, Guided Auth, and AOS pages.
7. Copy the generated `*-linux.png` files into the matching screenshot directories on the release branch after the representative review passes.
8. Commit the reviewed images on that branch and rerun normal CI.

The workflow has read-only repository permission and never commits, pushes, or writes main. Missing Linux images remain an explicit release blocker until the generated artifact passes representative review.

## Local intentional update

```powershell
$env:VISUAL_UPDATE_APPROVED="1"
npm run test:visual:update -- e2e/specs/visual.spec.ts --grep="Dashboard"
Remove-Item Env:VISUAL_UPDATE_APPROVED
```

Run `npm run test:visual` twice afterward and inspect representative desktop, mobile, Hebrew, English, dialog, drawer, Dashboard, Radar, onboarding, profile/settings, notifications, Help, QA, and Login screenshots before committing. Snapshot updates must correspond to an intentional canonical UI decision, not merely silence an unexplained failure.
