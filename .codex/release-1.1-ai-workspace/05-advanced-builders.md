# Advanced Prompt and Agent Builders

Prompt Builder gains basic/advanced modes, guided sections, variables, schemas, validation and safety notes, deterministic test cases, expected characteristics, forbidden outputs, evaluation checklists, quality dimensions, version history/diff, template/duplicate/export, and Playground handoff. Mock evaluation is explicitly deterministic.

Agent Builder gains a blueprint summary, inputs, memory, planned tools, validations, bounded retry policy, approvals, output schema, completion criteria, risks, sample scenario/test cases, quality score, version history/diff, template/export, and Playground handoff. Validation detects missing goals/completion/error handling, unclear output, unsafe write tools without approval, retries without stop conditions, connected-tool claims, and excessive retention.

Builder state migrations preserve every existing prompt and agent.

## Acceptance

All evaluation remains deterministic and is labelled as such in both languages.
