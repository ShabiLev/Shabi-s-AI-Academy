# Workflow Builder

The deterministic Workflow Builder creates browser-local workflows from prompt, agent, condition, approval, transform, and output steps. Validation rejects missing references, unsafe graphs, and invalid configuration before a run begins.

Runs use only Mock or Dry Run behavior, record bounded timelines, expose per-step status and output, and pause at approval steps. Live providers, arbitrary code, dynamic evaluation, and real tool execution are unavailable.

