# Agent Builder and Library

Version 0.6.0 provides a browser-local design workspace at `/agents`. Agent definitions, drafts, favorites, and filters use `shabi-ai-academy.agent-library.v1`; they are not uploaded or synchronized.

The twelve-step builder covers identity, goal, inputs, instructions, conceptual tools, memory strategy, validation, retries, human approval, output, completion criteria, and review. Five templates provide editable starting points. Blueprint export produces a reviewable specification.

Simulation is deterministic and local. It never invokes an AI API, Jira, GitHub, SQL, email, files, or any other declared tool. Its scenarios demonstrate control flow only and do not prove production readiness, permissions, security, or real-world execution.
