# Version 1.9 security and privacy

## Trust boundaries

User text, imports, backups, localStorage, Mission snapshots, evaluator output,
evidence, traces, preview payloads, and exported Agent fields are untrusted.
They are validated, bounded, rendered as text, and never treated as code or
instructions.

Version 1.9 adds no browser credentials, live provider, server authority,
connector write, executable Agent import, or cloud synchronization.

## Threat model and required controls

| Threat | Required control |
| --- | --- |
| Malicious rubric/import | strict schema, safe keys, size/depth limits, inert text, quarantine |
| Forged evaluator/result | immutable versions, evaluator independence, checksums, source/run binding |
| Result tampering | canonical hashes, append-only trace, immutable certification |
| Version drift | freeze all refs; fingerprint on continue; fork on mismatch |
| Self-evaluation | owner/implementation/evaluator separation validation |
| Evidence spoofing | actor/run/type/checksum validation and missing-evidence state |
| Prompt injection | never execute imported instructions; no `eval`, dynamic import, or shell |
| XSS/export injection | text DOM APIs, escaping, safe TOML serializer/parser, no raw HTML |
| Unsafe connected preview | no write path, real availability only, expiry, permission/risk/recovery display |
| Analytics leakage | consent off by default, allowlist, content/ID/path/hash redaction |
| Oversized traces | per-record and aggregate bounds, pagination, retention, safe failure |
| Prototype pollution | reject dangerous keys recursively before merge/persistence |
| Actor leakage | actor-scoped keys, ownership checks, generic inaccessible-ID response |
| Backup confusion | transactional preview/apply/rollback, domain/version/checksum validation |
| Export capability inflation | supported-field allowlist and omitted-field report |

## Certification integrity

- Every finding identifies rubric/criterion/evaluator/evidence/confidence and
  exact versions.
- Missing required evidence is not-scored.
- Low-confidence PASS cannot certify release readiness.
- Evaluator disagreement is preserved.
- Reality Checker is independent and may block.
- Certified and uncertified states are visually and semantically distinct.
- No client action may mutate a certified result in place.

## Data minimization

Store only what is required for local evaluation and recovery. Analytics may
record these event names only:

`evaluation_created`, `evaluation_started`, `evaluation_paused`,
`evaluation_completed`, `evaluation_blocked`, `rubric_created`,
`rubric_cloned`, `regression_detected`, `failure_case_created`,
`agent_version_created`, `prompt_version_created`, `suite_started`,
`suite_completed`, `codex_export_generated`, `connected_preview_created`.

Analytics must not contain Mission, prompt, rubric, evidence, trace or export
content; entity/evidence IDs; local paths; connector targets; recipients;
credentials; or personal data.

## Storage, retention, and recovery

Repositories are actor-scoped, checksummed, bounded, quarantining, and
independently resettable. Retention is deterministic and preserves referenced
certified evidence or blocks safely. Backup/import is non-destructive,
transactional, and rejects actor confusion or cross-domain partial apply.
Version 1.8 data is preserved.

## Security validation

Required coverage includes dependency audit, secret scan, import fuzzing,
prototype pollution, stored/reflected XSS, TOML injection, permission bypass,
self-evaluation, forged/tampered evidence, version drift, analytics redaction,
preview non-write assertions, oversized traces, actor isolation, corruption
recovery, and backup rollback.

Manual security review remains human-owned and cannot be marked passed by
automated tests.
