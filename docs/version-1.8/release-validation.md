# Version 1.8 Release Validation

The primary application bundle budget is a maximum increase of 15 KiB gzip.
The local release build measured 133.63 kB gzip against the 1.7 baseline of
130.49 kB (+3.14 kB, +2.4%). Version 1.8 uses the existing React context and
repository architecture and adds no orchestration or state dependency.

Release validation covers domain/unit tests, complete backup and rollback,
Hebrew/English desktop/mobile E2E, all supported browsers, axe, keyboard,
visual baselines, Lighthouse, Pages routing, storage audit/retention and full
exact-SHA evidence.

Primary regression:

1. Create a mission and inspect interpretation/team rationale.
2. Approve the plan, start, pause, refresh and continue from the same phase.
3. Detect state drift without overwriting.
4. Block self-approval and unavailable connected execution.
5. Copy an attributed immutable preset into an editable local team.
6. Export/import all five actor-scoped domains with rollback on write failure.
7. Preserve Version 1.7 Radar, Help and WALK ME behavior.

Manual UX, security, content, keyboard/screen-reader and visual judgment remain
human-owned gates. Automation records them as pending until an authorized human
reviewer completes them.
