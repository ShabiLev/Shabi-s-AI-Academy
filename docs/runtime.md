# Runtime Engine

Version 0.7.0-alpha.1 introduces a deterministic browser-local Runtime foundation. It supports mock, dryRun, and disabled liveReserved modes through typed domain services outside React.

The pure state machine implements draft, queued, running, waiting for approval, retrying, completed, failed, and cancelled. Every valid transition appends an ordered event; invalid transitions return safe typed errors without mutation. Cancellation is terminal and idempotent.

The Runtime Engine resolves providers through ProviderRegistry and planned capability descriptions through ToolRegistry. UI components use RuntimeContext and never instantiate providers or access storage directly.

Security constraints: no network providers, API keys, tool execution, eval, unsafe HTML, imported-text execution, raw stack traces, or credentials. Live execution requires a future secure server architecture.

See [Mock Provider](mock-provider.md), [Dry Run](dry-run.md), [Run History](run-history.md), and the [Engineering Kit runtime specification](../.codex/sprint-7/01-runtime.md).
