# Complete Bilingual Curriculum Specification

## Objective
Ship 40–50 open-access bilingual lessons. Prerequisites are recommendations, never locks.

## Modules
1. AI Foundations
2. Prompt Engineering
3. Context and Verification
4. Models and Parameters
5. Agent Design
6. Tools and Function Calling
7. Memory
8. RAG
9. MCP and Automation
10. Production AI

Each module contains 4–5 lessons.

## Required lesson model
- stable ID and module ID
- Hebrew and English title/summary
- duration and difficulty
- learning objectives
- recommended prerequisites
- explanatory sections
- practical example
- common mistakes
- exercise
- quiz and feedback
- mini-project
- related prompts and agents
- references and version

## UX
- table of contents
- previous/next
- draft persistence
- quiz retry
- mark complete
- practical task
- open in Prompt Workshop or Agent Builder
- contextual Help

## Rules
- Natural Hebrew, not literal translation
- Technically credible examples
- No simulated feature described as live
- No empty lesson sections
- Progress survives refresh
- Course reset does not delete prompts, agents, projects, runs or KB

## Required tests
Unique IDs, complete translations, route resolution, quiz scoring, draft persistence, reset isolation, mobile ToC, RTL/LTR and accessibility.

## Docs
Create `docs/curriculum.md`, `docs/lesson-authoring.md`, `docs/learning-journey.md`.
