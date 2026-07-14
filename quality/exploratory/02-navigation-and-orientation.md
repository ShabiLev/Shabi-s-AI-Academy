# 02 - Navigation And Orientation

## Mission

Explore navigation and orientation as a real user and identify anything broken, confusing, inaccessible, misleading, or unsafe.

## Persona

Select the closest persona from `quality/inventory/personas.json` and record any deviations.

## Setup

Use a production preview, controlled disposable data, Hebrew and English, and at least one relevant mobile viewport. Record version, commit, browser, router mode, auth state, and data state.

## Risks

- Primary work may be blocked or unclear.
- State may be lost, duplicated, or misleading.
- RTL, responsive, keyboard, overlay, console, or network behavior may regress.

## Test ideas

- Follow the primary task without hidden product knowledge.
- Exercise happy, cancel, invalid, refresh, Back, offline, empty, and recovery paths.
- Inspect focus, announcements, overflow, wording, feedback, persistence, and destructive safeguards.

## Expected observations

The current location, primary action, system status, result, and recovery path are understandable in both languages. No Critical or High finding remains.

## Data to capture

Screenshots, trace or video, action timeline, console errors, failed requests, route, viewport, language, auth/data state, and severity. Never capture secrets or private content.

## Exit criteria

The mission and high-risk ideas were exercised, findings were triaged, evidence was attached, and unresolved warnings have an owner and release decision.

## Findings

| ID | Severity | Finding | Evidence | Impact | Recommendation | Owner | Release decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |
