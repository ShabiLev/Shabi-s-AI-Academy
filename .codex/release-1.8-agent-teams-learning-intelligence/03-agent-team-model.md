# Agent Team model

`AgentTeam` schema version 1 stores localized name/description, one Conductor,
unique member IDs, ordered phases, source and timestamps. A team has at most
eight active members. Built-in records are frozen and cannot be overwritten;
copying creates a new user-owned ID.

`AgentDefinition` declares localized role, purpose, inputs, outputs,
permissions, gates, source attribution and active status. The permission union
is `observe | recommend | plan | implement | validate | approve |
execute-local | execute-connected`.

Validation rejects duplicate IDs, missing/multiple Conductors, unknown members,
oversized strings, dangerous object keys, unsupported permissions and source
spoofing. Catalog and user repositories are separate.

Built-in presets:

1. Feature Delivery
2. UI/UX Review
3. Release Certification
4. SQL Investigation
5. Prompt Improvement

Each preset names a Conductor, implementers, independent validators and gates.

