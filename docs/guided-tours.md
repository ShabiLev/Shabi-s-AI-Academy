# WALK ME product walkthrough

Version 1.7.0-beta.3 provides one global eight-step product walkthrough. It replaces module banners and independent page tours; no commercial WalkMe SDK is included.

## Lifecycle

The walkthrough starts after optional onboarding for a new local actor. Its exact persisted statuses are `not-started`, `in-progress`, and `completed`; run mode is `first-visit`, `resume`, or `manual-replay`.

- Automatic launch changes a fresh record to `in-progress`.
- Escape and `Not now` save the current step and close only for the current visit.
- A later visit resumes the saved step.
- Only the final `הבנתי` / `Got it` action marks the record `completed`.
- Completed actors are not auto-launched.
- Manual replay starts at step one while the persisted record remains `completed`.
- Reset in Settings removes only walkthrough state and hides every replay control.

Replay does not exist in the DOM before completion. After completion, a compact `הדרכה` / `Guide` control appears in desktop navigation and the mobile drawer, and replay actions become available in Help and Settings.

## Actor-scoped storage

Records use `shabis-ai-academy:walkthrough:v1:<actorId>`. A future authenticated account ID takes priority, followed by the local guest-profile ID and a bounded anonymous fallback. The parser validates schema, enum values, step bounds, timestamps, language, key safety, and payload size. Malformed or oversized data resets safely. The beta.2 `dismissed` state migrates to resumable `in-progress`.

The record contains no prompt content, authentication session, personal content, or analytics. Guest export/import excludes walkthrough state, preventing completion from leaking between actors.

## Interaction and accessibility

The page is inert and scroll-locked while the modal dialog is open. One target remains bright inside a turquoise spotlight while a near-white speech bubble is placed beside it and flips or clamps at viewport edges. Desktop uses a visible pointer; mobile uses a safe bottom sheet. Stable `data-walkthrough` targets cover main/mobile navigation, experience mode, lessons, creation tools, Radar, profile, Help, and replay.

The dialog supports keyboard-only use, focus trapping and restoration, Escape, polite progress announcements, 44px controls, RTL/LTR, reduced motion, 200% zoom, and a 320px viewport. A missing target is skipped with a sanitized diagnostic rather than blocking the sequence.

## Help Center integration

`/help` is public and guest-safe. It uses one localized `h1`, localized typed filter and area labels, responsive filters, AA contrast, and aligned card actions. The final walkthrough step points to Help and explains replay, but replay is inserted only after the final completion action.
