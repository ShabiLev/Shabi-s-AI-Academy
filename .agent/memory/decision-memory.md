# Decision Memory

Significant decisions only; ADRs remain authoritative.

- 2026-07-15: Agent memory is explicit, bounded, sanitized Markdown plus schema-validated JSON. Hidden or remote memory was rejected because it is not inspectable or agent-neutral. Affected: memory, state, evidence, UI.
- 2026-07-15: Public AOS pages consume one generated sanitized snapshot, never raw repository files. Bundling raw state was rejected to prevent private paths and stale status leaks. Affected: snapshot, UI, Pages.
- 2026-07-15: Manual UX/security/content reviews remain human-owned. Automated promotion was rejected under the quality and release policies.
