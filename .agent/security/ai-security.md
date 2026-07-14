# AI Security

## Purpose

Risks specific to AI-generated code and content: fabrication, unsafe
suggestions, and model-served secrets, distinct from ordinary application
security concerns.

## Rules

- **No fabricated results.** An agent must never report a test as passing,
  a build as succeeding, or a tool/provider as connected unless it actually
  ran the command or observed the state. This mirrors `../master.md`
  non-negotiable principle 12 ("Failures are never hidden") and 13
  ("Manual review is never reported as automated approval").
- **No model-served secrets.** Generated code must never invent a
  plausible-looking API key, token, or credential and place it in code,
  fixtures, or examples — even as a placeholder that could be mistaken for
  real, and even in documentation. Use clearly fake, obviously-non-secret
  placeholders (e.g. `YOUR_API_KEY_HERE`) only.
- **No unsafe suggestions presented as safe.** If an agent proposes a
  pattern that violates [`frontend-security.md`](frontend-security.md),
  [`authorization.md`](authorization.md), or any other module in this
  directory, it must flag the risk rather than presenting it as a normal
  option.
- AI-generated code is held to the same review bar as human-written code:
  it still needs tests, still needs a security review for High/Critical
  risk changes, and still needs its claims about behavior verified by
  actually running it (see [`../workflow/testing.md`](../workflow/testing.md)).
- Content generated for the Knowledge Base, lessons, or prompts pipeline
  must not present AI-fabricated claims as verified facts — see
  [`../research/claim-verification.md`](../research/claim-verification.md)
  and [`../knowledge/ai-safety.md`](../knowledge/ai-safety.md).
- Any AI integration that calls an external model/provider API is subject
  to [`prompt-injection.md`](prompt-injection.md) for handling that
  provider's responses, and to [`secrets.md`](secrets.md) for the
  associated API key.

## Review checklist

- Does generated code or documentation contain anything that looks like a
  real secret?
- Are test/build results in this task's report backed by an actual command
  run, with output available?
- Does any AI-authored content claim verification it hasn't received?

## Related

[`security-policy.md`](security-policy.md), [`prompt-injection.md`](prompt-injection.md),
[`../knowledge/ai-safety.md`](../knowledge/ai-safety.md),
[`../workflow/final-report.md`](../workflow/final-report.md).
