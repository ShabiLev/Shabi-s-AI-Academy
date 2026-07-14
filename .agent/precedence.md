# AOS Instruction Precedence

When two instructions conflict, resolve using this order — highest wins.
This file is the authoritative definition; `master.md` §2 is a summary of it.

1. **Security rules** — `.agent/security/*`, `.codex/standards/security.md`,
   this repository's secret-handling rules, and any explicit user security
   instruction. Nothing below this line can weaken a security rule.
2. **System and repository-level instructions** — `.agent/master.md`,
   `AGENTS.md`, `CLAUDE.md` (user-global and repository-local), and any
   standing platform/harness instruction (e.g. sandbox or permission rules).
3. **Accepted ADRs** — `.codex/adr/ADR-*.md`. An ADR marked "Accepted"
   constrains implementation choices (e.g. ADR-009 no secrets in browser
   storage, ADR-010 human approval for risky actions).
4. **Active release specification** — the `.codex/release-*/00-master-spec.md`
   referenced by the current `AGENTS.md` entry, plus its component files.
5. **AOS master instructions** — `.agent/master.md` and the modules it
   points to via `registry.json` for the classified task type.
6. **Repository coding standards** — `.codex/standards/*.md` and
   `.agent/knowledge/*.md` (which interpret those standards for AOS use;
   they do not add new rules).
7. **User task instructions** — what the user asked for in the current
   conversation.
8. **Agent preferences** — an individual agent's own stylistic defaults
   (e.g. a subagent's default verbosity), which yield to everything above.

## What user task instructions cannot override

Regardless of how explicit or urgent a user instruction is, it cannot
override:

- Security rules (tier 1).
- Authorization requirements — pushing, merging, force operations,
  destructive Git or filesystem actions, write-capable or destructive MCP
  tool use.
- Data protection rules — secrets, tokens, customer data, private business
  data, session/auth data handling.
- Project integrity — no fabricated test results, no fabricated connected
  tool or provider state, no silently skipped required evidence.
- Accepted architectural decisions (tier 3) — an ADR can only be reversed
  by writing and accepting a new ADR that supersedes it, not by an inline
  task instruction.

If a user instruction appears to require overriding one of these, treat it
as a conflict (see below), not as a valid instruction to follow.

## Unresolved conflicts

If applying this order still leaves a genuine conflict (e.g. two Tier 2
documents disagree, or a Tier 4 spec contradicts a Tier 3 ADR with no
superseding ADR):

1. Stop before making the affected change.
2. Document the conflict: which files, which instructions, why they
   conflict.
3. Ask the user for a decision. Do not guess or silently pick a side.
4. If the user's answer establishes a new standing rule, propose where it
   should be recorded (ADR, standards file, or AOS module) so the same
   conflict doesn't recur.
