# Architecture

Durable bounded context lives in `.agent/memory/`; schema-validated current state lives in `.agent/state/`. The memory updater derives state from Git, evidence, release metadata, and research outputs. Public UI reads only the sanitized generated AOS snapshot, never raw state files. Repository and Git state remain authoritative over memory.

The AOS is a repository instruction plane, not an application runtime or an
autonomous agent service. `.agent/master.md` orchestrates selection; the manifest
describes modules; the registry maps classified task types to bounded modules.

The React application consumes only `public/generated/aos-snapshot.json`, produced
at build/review time. AOS routes are lazy-loaded and cannot import Markdown,
execute module text, enumerate the filesystem, or initiate background polling.
Generated research and evidence summaries remain distinct from user-owned browser
data and built-in lesson, prompt, agent, workflow, and Radar catalogs.

Accepted ADRs and the architecture/standards directories retain precedence as
defined by `.agent/precedence.md`.
