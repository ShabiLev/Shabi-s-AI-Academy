# Sprint 7 Master Specification — Safe Agent Runtime Learning

## Control and baseline

This is the controlling implementation specification for Sprint 7.

- Application baseline: **0.6.1**
- Target application: **0.7.0**
- Engineering Kit: **1.0.0**
- Status: Accepted for implementation after this documentation release

## Objective and value

Deliver a safe, local-first environment where learners can inspect how prompts and agents are assembled and executed through deterministic Mock and Dry Run modes. Business value is a coherent bridge from static builders to future provider integration. Learner value is observable timelines, validation, approvals, retries, cancellation, and reusable starter material without cost, secrets, or misleading connectivity.

## Architecture summary

The UI calls typed domain services. A pure runtime state machine emits events. ProviderRegistry exposes a deterministic MockProvider; ToolRegistry exposes planned capability metadata only. Validated bounded local adapters store user-owned imports and run history. Built-in Starter Agents and Prompt Packs remain immutable until explicit import.

Related decisions: [mock-first](../adr/ADR-002-mock-runtime-before-live.md), [local storage](../adr/ADR-003-local-first-storage.md), [providers](../adr/ADR-004-provider-abstraction.md), [catalog separation](../adr/ADR-005-starter-catalog-separation.md), [secrets](../adr/ADR-009-no-secrets-in-browser-storage.md), [approvals](../adr/ADR-010-human-approval-for-risky-actions.md).

## Included modules

1. [Agent Runtime Foundation, Mock Provider, Dry Run, state machine, approvals, retry/cancel, and Run History](01-runtime.md)
2. [Starter Agents Catalog](02-starter-agents.md)
3. [Prompt Packs](03-prompt-packs.md)
4. [Prompt and Agent Playgrounds](04-playground.md)
5. [Learning Journey foundation](05-learning-journey.md)
6. [Roadmap screen](06-roadmap.md)
7. [Test and automation expansion](07-tests.md)
8. [Release contract](08-release.md)
9. QA Center integration: 0.7.0 checklist, runtime/catalog/playground gates, and honest notRun warnings.
10. How To integration: modes, provider/tool status, imports, approvals, history/privacy, playgrounds, and troubleshooting.

## Explicitly out of scope

Real OpenAI, Anthropic, or Gemini calls; real Jira updates; SQL execution; email sending; API keys in browser storage; production authentication; cloud synchronization; MCP connections; and a drag-and-drop production Workflow Builder. No control may imply these are connected.

## Security and privacy constraints

- External/catalog/provider text is untrusted inert data.
- No eval, Function, HTML execution, shell/command execution, or automatic network actions.
- No secrets or provider credentials in browser storage, bundles, logs, exports, fixtures, or screenshots.
- Mock/Dry Run labels and planned tools are explicit; Live Run is visible only if useful for teaching and remains disabled as `liveReserved`.
- Risky conceptual actions enter `waitingForApproval`; approve, reject/cancel, and exact action summary are keyboard accessible.
- Run history is local, bounded, deletable, and warns users not to enter sensitive data.

## Delivery sequence and dependencies

1. Domain types, validation, state machine, event timeline, MockProvider, registries, and unit tests.
2. Versioned bounded history storage with malformed-data recovery.
3. Runtime UI primitives and Run History.
4. Starter Agents catalog validation/import.
5. Prompt Packs validation/bulk import/duplicates.
6. Prompt Playground, then Agent Playground.
7. Learning Journey and typed static Roadmap.
8. QA Center, How To, docs, full automation, version/release.

Each phase must compile and pass focused tests. Later phases depend on public APIs from earlier phases; UI must not bypass them.

## Cross-module acceptance criteria

- [ ] Mock output is identical for the same normalized request and fixture version.
- [ ] Dry Run validates and previews assembly/tools/approvals without provider execution or history result fabrication.
- [ ] All required statuses and transitions are represented and invalid transitions fail safely.
- [ ] Approval, retry, cancellation, failure, and bounded history work and remain accessible.
- [ ] Live Run is disabled with an honest configuration explanation.
- [ ] 22 approved Starter Agents are read-only, bilingual, validated, and explicitly importable.
- [ ] At least 100 authored Prompt Pack entries across ten packs are validated and support one/selected/full import with controlled duplicates.
- [ ] Prompt and Agent Playgrounds expose provider status, warnings, timelines, and local history without external execution.
- [ ] Learning Journey does not lock existing lessons and has a non-visual list.
- [ ] /roadmap uses typed static truthful data.
- [ ] Dashboard/navigation, QA Center, and How To integrate new modules.
- [ ] Hebrew RTL, English LTR, keyboard, mobile, axe, visual, Lighthouse, storage corruption, and security restrictions pass the [test matrix](07-tests.md).

## Quality gates and documentation

Follow the [QA handbook](../standards/qa.md) and [release specification](08-release.md). Update root README, CHANGELOG, How To, runtime/Starter Agents/Prompt Packs/Playgrounds/QA/Roadmap documentation, architecture, and ADRs if implementation changes accepted contracts.

## Version and Git contract

Update application references from 0.6.1 to **0.7.0** only during implementation. Required commit:

`feat(runtime): add Agent runtime, Starter Agents and Prompt Packs`

Create one clean commit after all gates. Do not amend published commits. Stop before push.

## Definition of Done

Every module criterion is implemented; no out-of-scope integration exists; catalogs and personal data remain separate; histories are bounded; translations/help/QA/docs are complete; all automated gates pass; reviewed visual changes are intentional; manual checklist status is honest; package and lock are 0.7.0; clean commit exists; working tree is clean.

## Final report

Report baseline/target/commit/branch/origin/push state; architecture and routes; runtime modes/transitions/provider/tool status; history key/limit/privacy; starter counts/categories/imports; pack counts/distribution/duplicates; playgrounds; journey/roadmap; QA/How To; unit/coverage/E2E/a11y/visual/Lighthouse/quality/release results; security checks; manual work; known limitations; exact push command; recommended next release.
