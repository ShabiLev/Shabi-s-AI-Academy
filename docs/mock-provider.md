# Deterministic Mock Provider

MockProvider is the only executable provider in 0.7.0-alpha.1. It performs no network call, random generation, delay, external file access, tool execution, or prompt execution.

Its compact fixture version and normalized RunRequest select deterministic scenarios: success, validation failure, retry then success, retry exhaustion, approval required/rejected, and cancellation. Injected clocks and ID factories make event evidence reproducible.

Mock output is always labelled simulated and is not an AI response. Approval advances only a local scenario. Planned tools remain not connected.

Tests contract-check identical semantic results, retry/approval/cancel paths, late completion after cancellation, and absence of network calls.
