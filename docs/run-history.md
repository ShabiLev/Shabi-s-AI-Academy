# Browser-Local Run History

Runtime history uses shabis-ai-academy.runtime.runs.v1. Records include schemaVersion and runtimeVersion, are validated from unknown, sorted newest first, and capped at 50. The oldest record is evicted only after a successful save.

Users can filter, inspect details/timeline, delete one, or clear all with confirmation. Malformed, unsupported, or unavailable storage returns a safe empty result and warning without crashing or affecting authentication, language, course progress, Prompts, Agents, or QA data.

History is local to the current browser. It must contain no API keys, credentials, raw stack traces, complete external catalogs, or unrelated personal data. Do not enter sensitive information.
