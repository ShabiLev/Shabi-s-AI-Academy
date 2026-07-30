# Codex Agent export guide

## Scope

Version 1.9 can prepare a validated Academy Agent as a Codex TOML download.
This is an export and preview, not a connector execution. The browser never
installs into `~/.codex/agents`, invokes Codex, or confirms that an Agent is
available outside the Academy.

## Export contract

An eligible export contains:

- validated Agent name and description;
- developer instructions;
- provenance comments where the supported TOML format permits them;
- allowlisted declarative fields only;
- deterministic formatting and checksum;
- successful parse-back/round-trip validation;
- an omitted-field report.

It excludes credentials, secrets, local paths, unsupported permissions,
browser-only state, hidden runtime claims, private evidence, and any assertion
that the Academy simulation can execute real tools/providers.

## Safe workflow

1. Select an immutable, validated Agent version.
2. Review provenance, permissions, validation findings, and omissions.
3. Generate the preview.
4. Resolve any blocked field or unsafe value.
5. Confirm parser round-trip and checksum.
6. Download the TOML file.
7. Review and install it manually using current Codex documentation outside the
   browser workflow.

Do not rename a failed preview to bypass validation. A later Agent edit requires
a new immutable version and a new export/checksum.

## Omitted fields

The omitted-field report names each Academy field not represented in the
supported export and explains why, such as unsupported permission, local-only
reference, private evidence, or runtime claim. Omission must not silently widen
or change behavior.

## Security notes

TOML strings and comments are escaped by an allowlisted serializer and parsed
back before download. Imported/user text remains inert. Never paste a secret
into an Agent definition; exports and backups must remain safe if inspected or
shared.

