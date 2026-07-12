# Code Review Checklist — <change>

## Intent and scope

Does the diff match the accepted spec without unrelated change? <notes>

## Architecture and correctness

- [ ] boundaries/dependency direction preserved
- [ ] states, errors, concurrency, persistence, and migrations correct
- [ ] no duplicated domain logic or avoidable any

## UX quality

- [ ] translations and semantic RTL/LTR
- [ ] semantic HTML, keyboard, focus, non-color status
- [ ] responsive/empty/error/loading states

## Security and privacy

- [ ] trust boundaries validated
- [ ] no secrets, unsafe rendering, automatic external actions, or fake live claims

## Evidence and delivery

- [ ] meaningful unit and Playwright regressions
- [ ] docs/version/ADR updated
- [ ] validation output and staged artifact review supplied

Findings by severity with file/line: <list>
