# Dry Run

Dry Run validates a request and assembles an inert preview containing normalized input, variables, planned tools, approval points, estimated steps, warnings, provider status, and privacy notice.

It never calls provider.execute, executes a tool, writes external data, or claims model output. History may record the completed preview with mode dryRun, explicitly labelled as a preview.

Live Reserved is rejected with a typed configuration error. Version 1.2.0-beta.1 has no browser API-key or provider-configuration input.
