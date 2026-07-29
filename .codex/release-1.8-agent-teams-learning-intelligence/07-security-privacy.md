# Version 1.8 mission security and privacy

## Trust boundaries

External template text, imported backup data, localStorage and user-entered
mission text are untrusted data. They are parsed, bounded and rendered as text.
No `eval`, HTML injection, script import, provider call or command execution is
allowed.

## Permissions and approvals

Least privilege is enforced by phase. Implementers cannot validate or approve
their own output. Approval records identify a human decision and exact phase.
Connected execution stays disabled and no credentials are accepted.

## Storage and privacy

Teams, missions, skill evidence, context packs and mission analytics use
actor-scoped versioned keys. Parsers quarantine malformed values and return safe
defaults. Reset is domain-specific. Analytics is opt-in, allowlisted and may
contain only event type, timestamp and coarse category/quality metadata — never
mission content, acceptance criteria, IDs, notes, agent output, personal data or
secrets.

## Threat tests

Cover prototype pollution, oversized/deep payloads, forged system source,
duplicate/conductor violations, permission escalation, self-approval, resume
drift, malformed imports, secret-shaped fields, rollback failure and XSS text.

## Dependency review

`npm audit --omit=dev` reports two high findings through
`react-router-dom@7.18.1` for GHSA-qwww-vcr4-c8h2. The reviewed advisory states
that only unstable React Server Components APIs are affected. This Academy is
a Vite client-side SPA using `BrowserRouter`; it has no RSC mode, server
actions, or React Router action execution endpoint, so the vulnerable path is
not reachable in this release. The advisory lists 8.3.0 as patched, while the
published package line available during validation does not yet offer that
upgrade. Downgrading to 7.11.0 would discard later fixes and was rejected.

The remaining full-audit findings are transitive development-tool advisories
under ESLint, Vitest coverage and Lighthouse CI. They are not shipped in the
browser bundle. Re-evaluate the router and toolchain as soon as compatible
patched releases are available.
