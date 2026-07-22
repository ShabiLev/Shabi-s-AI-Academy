# Version 1.5 security

## Mandatory controls

No provider credential enters the browser bundle or storage. URLs are HTTPS and allowlisted; payloads, records, strings, dates, and checksums are bounded. Source text is inert and cannot trigger commands, tools, HTML, or publication. Network and external-write permissions remain explicit.

## Threat model

Public sources, cached JSON, local storage, query strings, and notification routes are untrusted inputs. They must not reach HTML injection, command execution, provider credentials, or automatic publication paths.

## Review evidence

Security review covers URL policy, schema rejection, prompt-injection inertness, bounds, attribution, storage migration, notification links, workflow permissions, and frontend bundle secret scanning.
