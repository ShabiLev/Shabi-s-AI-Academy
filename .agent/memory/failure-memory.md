# Failure Memory

## Active

- **AOS-QUALITY-001** (2026-07-15): 35 Windows visual snapshots differ from stale baselines. Root cause: Several expected baselines predate the fully loaded Version 1.3/1.4 UI. Fix: Human-review each diff and update only approved platform-correct baselines. Prevention: `npm run test:visual`.

## Resolved history (bounded)

- **AOS-QUALITY-000**: Transient locator and worker races. Use accessible locators and four deliberate workers.
