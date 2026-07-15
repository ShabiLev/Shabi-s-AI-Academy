# Security

AOS Markdown and JSON are inert. Manifest paths are validated locally and do not
drive browser dynamic imports. Imported research metadata is bounded, HTTPS-only,
and never interpolated into shell commands. Raw HTML is not rendered by the AOS UI.

Evidence redacts authorization values, tokens, secrets, email addresses, workspace
paths, and known sensitive environment values. Supabase service-role credentials
remain prohibited; browser code accepts only public URL/anon configuration.
Authorization remains backend/RLS based. MCP tools, Git writes, publication, push,
and merge require the approvals defined by the higher-precedence policies.
