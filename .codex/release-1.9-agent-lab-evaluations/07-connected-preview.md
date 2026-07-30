# Connected Workflow Preview and Codex export

## Trust statement

Version 1.9 produces **preview-only connected actions**. A preview is local,
inert, expiring, and non-authoritative. It does not write to GitHub, Jira,
Confluence, Gmail, Calendar, Codex configuration, or any other external system.
Actual connected execution is unavailable.

## Preview schema

```ts
interface ConnectedActionPreview {
  schemaVersion: 1;
  id: string;
  connectorType: string;
  actionType: string;
  targetSummary: string;
  payloadSummary: LocalizedText;
  requiredPermissions: string[];
  riskLevel: "low" | "medium" | "high";
  reversible: boolean;
  recoveryPlan?: LocalizedText;
  status: "draft" | "ready" | "unavailable" | "expired";
  createdAt: string;
  expiresAt: string;
}
```

## Supported preview categories

- GitHub PR or issue draft plan
- Jira issue draft
- Confluence page draft
- Gmail draft
- Calendar event draft
- Codex Agent TOML export

Each preview displays destination type, intended target, exact proposed fields
or omissions, required permissions, risk, reversibility, recovery, expiry, and
capability status. Unsupported/disconnected targets are `unavailable`.

The browser never accepts connector credentials. Availability may be derived
only from a real, safe connector-capability boundary; absent that boundary it
must remain unavailable. A preview must never fabricate account, repository,
project, issue, recipient, calendar, or permission state.

## Safety controls

- Imported and generated strings are inert and bounded.
- No network mutation is performed during preview, validation, export, test,
  analytics, refresh, or retry.
- Preview creation requires user intent and records no raw private content in
  analytics.
- Expired previews cannot be promoted by changing a client timestamp.
- UI controls use language such as `Preview` or `Export file`, never `Create`,
  `Send`, `Publish`, `Install`, or `Connected` when no write occurs.

## Codex TOML export

The exporter accepts a validated, immutable Academy Agent version and creates a
download preview with:

- validated name and description;
- developer instructions;
- provenance comments where safely supported;
- only supported declarative fields;
- no secrets, credentials, local paths, unsupported permissions, runtime tool
  claims, or hidden capabilities;
- deterministic canonical form and checksum;
- parse-back/round-trip semantic validation;
- omitted-field report with reasons.

An invalid export remains blocked and displays field-level remediation. The
browser must not write to `~/.codex/agents`, invoke Codex, install a plugin, or
claim that the downloaded file was installed.

## Future connected execution

Any future write action requires a separate server-side authorization design,
real connector state, least-privilege scopes, fresh contextual human approval,
idempotency, audit evidence, failure recovery, revocation, and dedicated
security/privacy review. Preview records are not execution authorization.

