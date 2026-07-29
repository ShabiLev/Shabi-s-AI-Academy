# Version 1.8 mission information architecture

## Routes

- `/missions` — mission list, recovery and resume
- `/missions/new` — mission interpretation and Team Builder
- `/missions/:missionId` — active phase and mission actions
- `/team` — team/preset catalog and user copies
- `/plan` — current mission plan projection
- `/evidence` — current mission evidence projection

All routes live inside the existing `AppLayout`, provider stack and Browser/
HashRouter abstraction. Pages consume a typed mission context; repositories,
parsers and catalogs do not import React.

## Desktop and mobile

Desktop uses a three-column control-room layout: plan, active phase, and team/
evidence rail. Compact screens prioritize the active phase and expose the other
panels in logical document order without horizontal overflow.

## Navigation

Missions and Teams are primary beginner-visible destinations. Existing tools,
Radar, Help and AOS remain reachable and retain their current contracts.
