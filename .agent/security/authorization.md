# Authorization

## Purpose

No client-only authorization for cloud data; rules for admin/role gating
so that UI-level hiding is never mistaken for a real access control.

## Rules

- **Client-only authorization is not authorization.** Hiding a button,
  route, or menu item in the UI based on a client-side role check is a UX
  convenience only. It must never be the mechanism that actually protects
  Supabase-held data. The real gate is Supabase Row Level Security (RLS)
  policies enforced server-side (in Postgres), or an equivalent
  server-enforced check. If RLS is not yet configured for a table that
  holds user or cloud-synced data, that table is not safe to read/write
  from the client regardless of what the UI shows.
- **No hidden admin bypass.** There must be no undocumented flag, query
  parameter, local-storage value, or debug shortcut that elevates a user's
  effective permissions. Any admin/debug affordance must be explicit,
  documented, and still subject to server-side enforcement.
- Every new Supabase table or view that stores user-specific or
  tenant-specific data must have RLS enabled with policies scoped to the
  authenticated user (or explicitly documented as intentionally public),
  before the client is allowed to read/write it.
- Role or plan-tier checks (e.g. "Advanced mode" vs "Beginner mode" from
  the guided-navigation feature) that only affect UI presentation and not
  access to other users' data are fine to implement client-side — the
  authorization concern is specifically about access to data that is not
  the current user's own.
- Changes that introduce or modify a role, permission, or admin capability
  are High risk by default (`../loaders/task-classifier.md`) and require a
  security review before merge (`security-review-template.md`).

## Review checklist

- For any new/changed Supabase table: is RLS enabled, and do the policies
  reference `auth.uid()` or an equivalent authenticated identity, not a
  client-supplied field?
- Is there any code path where a client-controlled value alone decides
  whether privileged data is returned?
- Is there any conditional, flag, or shortcut that grants elevated access
  without a corresponding server-side check?
- Does UI hiding for a restricted feature have a matching server-side
  enforcement, or is the feature actually just a preference/mode?

## Related

[`security-policy.md`](security-policy.md), [`authentication.md`](authentication.md),
[`data-protection.md`](data-protection.md), [`../knowledge/supabase.md`](../knowledge/supabase.md).
