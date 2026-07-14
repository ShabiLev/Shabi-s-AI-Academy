# Accessibility

## Purpose

State the concrete accessibility gate and known gaps so an agent doesn't
claim a manual check ran when only the automated scan did.

## Authoritative source(s)

- [.codex/standards/accessibility.md](../../.codex/standards/accessibility.md)
- [.codex/architecture/frontend.md](../../.codex/architecture/frontend.md)
- `package.json` (`@axe-core/playwright`, `test:a11y` script)

## Project-specific interpretation

Automated accessibility evidence comes from `npm run test:a11y`, which runs
the Playwright `Accessibility` project (axe-core) against representative
routes. This is necessary but not sufficient: the standard's mandatory
rules (keyboard operability, focus management in dialogs, live
announcements, non-color status indicators) are only partly verifiable by
axe and require the manual keyboard/screen-reader smoke pass the standard
calls for. `.agent/workflow/accessibility.md` and
`.agent/quality/accessibility.md` define when that manual pass is required
for an AOS task — this file only states what exists to run.

Bilingual direction (Hebrew RTL / English LTR) is an accessibility-adjacent
concern here, not a cosmetic one: keyboard order and focus order must hold
in both directions (see `.agent/knowledge/rtl-ltr.md`).

## Constraints

- New interactive elements must be real semantic controls (buttons, links,
  labeled inputs) — never clickable `div`/`span`, per the standard's
  forbidden-practices list.
- Status/state must be conveyed with text, not color alone (e.g. the
  Agent/Prompt library cards already show a status word alongside a tag
  color — match that pattern).
- Dialogs (e.g. `ConfirmDialog` used in `AgentsPage.tsx`) must manage focus
  and support Escape-to-cancel.

## Known limitations

- `test:a11y` runs against a fixed set of representative routes, not every
  route in `App.tsx`; a newly added page is not automatically covered until
  it is added to that spec.
- Automated axe scans do not verify screen-reader announcement wording or
  real assistive-technology behavior — those remain manual, human-certified
  checks per `.agent/quality/manual-review.md`, and must never be reported
  as automated passes.

## Current implementation status

Shipped: axe-based CI gate (`test:a11y` job in `ci.yml`), semantic-control
conventions followed across existing pages. Not automated: full
screen-reader pass, non-visual diagram alternatives beyond what individual
pages already implement — these remain human-review items.
