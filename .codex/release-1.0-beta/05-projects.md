# Projects Workspace Specification

## Objective
Group prompts, agents, runs, documents and notes into browser-local workspaces.

## Routes
`/projects`, `/projects/new`, `/projects/:projectId`, `/projects/:projectId/settings`.

## Model
ID, name, description, category, status, tags, linked prompt/agent/run/document IDs, notes, activity, timestamps, version, favorite and archived.

## Statuses
Planning, Active, On Hold, Completed, Archived, with Hebrew translations.

## Templates
QA Release Review, SQL Reporting, Customer Communication, Message Reader App and AI Learning Project.

## Linking
Link/unlink without deleting source. Project deletion must not cascade by default.

## Activity
Safe summaries only; no secrets or full document bodies.

## Tests
Create/edit/archive/delete, templates, linking, source preservation, detail refresh, activity, search/filter, mobile, bilingual, accessibility and visual.

## Docs
Create `docs/projects.md`, `docs/project-templates.md`.
