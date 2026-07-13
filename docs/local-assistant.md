# Local Assistant

The `/assistant` route is a deterministic command and recommendation interface, not a simulated freeform LLM. It classifies a bounded set of intents, searches local entities, and returns bilingual responses with explicit confidence and source context.

Safe actions include navigation, local search, draft creation, and other registered workspace operations. Mutating actions present a preview and require confirmation. The action router cannot evaluate code, invoke external tools, call providers, or bypass the shared Runtime boundary. Chat history is validated, browser-local, clearable, and bounded.

