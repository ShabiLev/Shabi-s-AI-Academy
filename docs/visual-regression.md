# Visual regression testing

Playwright keeps operating-system-specific snapshots (`*-win32.png`, `*-linux.png`, and `*-darwin.png`). Linux must never fall back to Windows images, and thresholds remain at Playwright defaults.

The `visual-chromium` project pins the Playwright package/browser revision through `package-lock.json` and fixes viewport, locale, timezone, device scale, dark color scheme, and reduced motion. The fixture clears storage, disables motion, waits for fonts, masks live build identity, and uses controlled page state. Tests must use web-first waits; arbitrary sleeps, random content, and auto-approval are prohibited.

## Reviewed Linux workflow

1. Open **Actions → Generate reviewed Linux visual baselines → Run workflow**.
2. Choose a non-main branch and type `GENERATE_REVIEWED_LINUX_BASELINES` exactly.
3. Optionally narrow work with the file and grep filters; record the suite group. The reviewed release viewport/language groups are `desktop` and `he-en`.
4. Download `reviewed-linux-visual-candidates-<run-id>`.
5. Review each expected/actual/diff pair, trace, and HTML report. Reject clipping, overlap, wrong RTL/LTR direction, missing focus, broken content, or unexpected layout.
6. Check representative Login, Hebrew/English Dashboard, AI Radar, profile menu, Lessons, Prompt Library, Prompt Builder, QA Center, mobile Dashboard, Runtime, About, Playgrounds, Guided Auth, and AOS pages.
7. Copy only approved `*-linux.png` files into the matching screenshot directories on the fix branch.
8. Commit the reviewed images on that branch and rerun normal CI.

The workflow has read-only repository permission and never commits, pushes, or writes main. Missing Linux images remain an explicit release blocker until a human approves the artifact.

## Local intentional update

```powershell
$env:VISUAL_UPDATE_APPROVED="1"
npm run test:visual:update -- e2e/specs/visual.spec.ts --grep="Dashboard"
Remove-Item Env:VISUAL_UPDATE_APPROVED
```

Run `npm run test:visual` afterward and inspect every changed PNG before committing. Do not update snapshots merely to silence a failure.
