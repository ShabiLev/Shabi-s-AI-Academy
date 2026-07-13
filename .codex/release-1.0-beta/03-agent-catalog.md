# Complete Starter Agent Catalog Specification

## Objective
Ship at least 30 curated Starter Agents separate from My Agents.

## Required catalog
QA: QA Release Analyst, Test Case Generator, Regression Scope Planner, Bug Triage Agent, Requirements Reviewer, Exploratory Testing Coach, API Test Designer, Test Automation Reviewer, Test Data Planner, Incident Review Analyst.

SQL/Data: SQL Query Reviewer, SQL Performance Reviewer, Reporting Query Builder, Data Quality Analyst, Duplicate Row Detector, Date Range Validator.

Jira/Release: Jira Risk Analyzer, Sprint Health Analyst, Release Notes Generator, Go/No-Go Preparation Agent, Backlog Quality Reviewer, Dependency Analyzer.

Product/Communication: PRD Reviewer, Acceptance Criteria Generator, Customer Communication Agent, Meeting Action Extractor, Stakeholder Update Writer, Feature Risk Analyst.

Development/AI: Code Review Agent, Architecture Reviewer, Prompt Optimizer, Agent Blueprint Reviewer.

## Agent model
Stable ID, bilingual name/description, role, goal, required and optional inputs, instructions, planned tools, risks, connection status, memory, validation, retry, approval points, output, completion criteria, risk notes, quality target, Mock scenario and sample input.

## Catalog behavior
Read-only, previewable, importable, usable for Mock/Dry Run. Never editable directly and never counted as My Agents.

## Import
New local ID, version 1, source template preserved, no overwrite, duplicate detection with open/import/cancel.

## Honesty
All conceptual tools display Planned and Not connected. No connector may appear live.

## Required tests
Catalog count, unique IDs, complete fields, no connected tools, import, duplicate import, edit/version increment, search/filter, Mock/Dry Run, approval/retry, mobile, bilingual, axe and visual.

## Docs
Create `docs/starter-agents.md`, `docs/agent-library.md`, `docs/agent-curation.md`.
