# Version 1.4 AOS Handoff

## Release identity

- Branch: `feature/1.4.0-agent-operating-system`
- Application: `1.4.0-beta.1`
- AOS: `1.0.0`
- Controlling specification: [00-master-spec.md](00-master-spec.md)

## Continuation protocol

Read `.agent/master.md`, classify the remaining task, load only registry-mapped
modules, inspect `quality/execution/latest/`, and verify HEAD before relying on its
results. Do not promote manual review, update visual baselines, publish research,
push, or merge without the required human decision.

## Current release boundary

The AOS architecture, safe snapshot UI, evidence orchestration, and bounded research
seed are in scope. Live autonomous research, live tools/providers, automatic Git
writes, and automatic content publication are not Version 1.4 capabilities.
