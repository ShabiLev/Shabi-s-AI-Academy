# Data Protection

## Purpose

Handling rules for customer data, private business data, and
user-authored content (progress, notes, profile fields) as this app grows
a Supabase cloud-sync layer alongside its local-first storage.

## Rules

- Treat any user-authored content (profile fields, notes, saved progress,
  onboarding answers) as personal data: it is stored only where the user
  expects it (local storage or their own Supabase-authenticated row), and
  it is never included in evidence artifacts, logs, screenshots committed
  to the repo, or research/knowledge outputs. See [`logging.md`](logging.md).
- Local-to-cloud migration (see [`../knowledge/storage.md`](../knowledge/storage.md))
  must be additive and reversible where possible: do not silently delete
  local data once cloud sync succeeds without a clear, user-visible
  confirmation step.
- No customer or private business data (per the user's global CLAUDE.md
  domains — CelloPark tenants/orders/customers, Datadog logs, etc.) is
  ever introduced into this repository's fixtures, tests, screenshots, or
  documentation. Test data must be synthetic.
- Exported files (CSV/Excel-style exports, if added to this app) must not
  include fields beyond what the exporting user is authorized to see, and
  must respect the same RLS boundary described in
  [`authorization.md`](authorization.md).
- Any new data collection (new profile field, new tracked event, new
  Supabase column) is reviewed for whether it is necessary, and if it
  reduces to a Critical-risk concern (e.g. it looks like a credential or
  sensitive identifier), escalate per [`secrets.md`](secrets.md).
- Deletion requests (a user removing their account or data) must actually
  remove the data from Supabase, not just hide it in the UI — consistent
  with [`authorization.md`](authorization.md)'s "UI hiding is not the
  gate" principle.

## Review checklist

- Does this change introduce a new field or table holding personal data?
  Is RLS applied?
- Is any personal/business data written to `quality/execution/`,
  `.agent/memory/`, or committed screenshots?
- Is data migration reversible, and does it avoid silent data loss?
- Are exports/test fixtures synthetic, not real customer data?

## Related

[`security-policy.md`](security-policy.md), [`authorization.md`](authorization.md),
[`logging.md`](logging.md), [`../knowledge/storage.md`](../knowledge/storage.md).
