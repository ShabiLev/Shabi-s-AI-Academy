# Frontend Security

## Purpose

No unsafe HTML, no arbitrary code execution, no user-controlled dynamic
import — the rendering and execution surface of the React/Vite frontend
must stay closed to untrusted input.

## Rules

- **No unsafe HTML.** Never use `dangerouslySetInnerHTML`, `innerHTML`, or
  `outerHTML` with content that originates from a user, an import, a
  research source, or any external provider response. Render text as text
  (React text nodes, `textContent`, or an equivalent safe sink). If rich
  formatting is genuinely required, use a vetted sanitizer with an
  allowlist, and document why in the change's security review.
- **No arbitrary code execution.** Never use `eval`, `new Function(...)`,
  `setTimeout`/`setInterval` with a string argument, or any mechanism that
  compiles and runs a string as code, on any input that is not a fixed,
  developer-authored literal.
- **No user-controlled dynamic import.** `import(...)` expressions must
  only ever use a static string or a value drawn from a closed,
  developer-defined allowlist (e.g. a fixed map of route names to
  lazy-loaded modules per [`../knowledge/routing.md`](../knowledge/routing.md)).
  Never build the import specifier from user input, URL parameters,
  imported file content, or provider responses.
- **No unsafe URL sinks.** Never set `href`/`src`/`action` from unvalidated
  input in a way that allows `javascript:` URLs or similar script sinks.
- Treat all data from research imports, Knowledge Base candidates,
  Supabase rows, and third-party providers as untrusted per
  [`prompt-injection.md`](prompt-injection.md) — display it, never execute
  or interpolate it into a code or markup sink without sanitization.

## Where this applies in this repo

React components under the app's source tree, any Markdown/HTML rendering
path used for lessons/prompts/Knowledge Base content, and any future
provider-response renderer. See [`../knowledge/react.md`](../knowledge/react.md)
and [`../knowledge/rag.md`](../knowledge/rag.md).

## Review checklist

- Grep the diff for `dangerouslySetInnerHTML`, `innerHTML`, `eval(`,
  `new Function`, and dynamic `import(` with a non-literal argument.
- Confirm any new rendering of external/imported content uses a safe text
  sink or a reviewed sanitizer.
- Confirm no new dynamic import path is reachable from user input.

## Related

[`security-policy.md`](security-policy.md),
[`prompt-injection.md`](prompt-injection.md),
[`../knowledge/react.md`](../knowledge/react.md).
