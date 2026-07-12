# Security Review — <change>

## Assets and trust boundaries

User data, external data, credentials, providers, tools, storage, exports/logs: <map>

## Threats

| Threat   | Entry point | Impact   | Mitigation | Test   |
| -------- | ----------- | -------- | ---------- | ------ |
| <threat> | <boundary>  | <impact> | <control>  | <case> |

## Permissions and approvals

Capabilities, least privilege, risky actions, exact approval summary, reject/cancel behavior: <details>

## Data lifecycle

Collection, validation, retention limits, deletion/reset, export, redaction, third parties: <details>

## Required checks

- [ ] no secrets in source/browser storage/artifacts
- [ ] external content remains inert
- [ ] filenames/links/logs are safe
- [ ] disabled live status is honest
- [ ] negative and malformed cases pass

Residual risk and decision: <details>
