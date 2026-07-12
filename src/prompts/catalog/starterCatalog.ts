import { catalogContentHash } from "./catalogHash";
import { originalSourceRecords } from "./originalSourceRecords";
import { catalogSourceMetadata } from "./sourceMetadata";
import type { CatalogEntry } from "./types";
import type { PromptCategory } from "../types";

type Seed = [string, PromptCategory, string, string[]];
const seeds: Seed[] = [
  [
    "Software Quality Assurance Tester",
    "qa",
    "Review the supplied requirement. Produce functional, negative, boundary, accessibility, and recovery test cases. Identify assumptions and missing acceptance criteria. Return a traceable table with priority, preconditions, steps, expected result, and test type.",
    ["testing", "quality"],
  ],
  [
    "Test Plan Designer",
    "qa",
    "Create a risk-based test plan for the supplied feature. Cover scope, exclusions, environments, test data, dependencies, entry and exit criteria, regression impact, risks, and reporting. Flag missing evidence instead of inventing it.",
    ["test-plan", "risk"],
  ],
  [
    "Defect Report Reviewer",
    "qa",
    "Review the supplied defect report for reproducibility and clarity. Identify missing environment, steps, evidence, expected behavior, actual behavior, severity rationale, and regression scope. Return a corrected report without changing known facts.",
    ["defects", "review"],
  ],
  [
    "Regression Risk Analyst",
    "release",
    "Analyze the supplied change list and test evidence. Rank regression risks by likelihood and impact, map each risk to evidence and recommended coverage, and clearly mark unknowns.",
    ["regression", "release"],
  ],
  [
    "SQL Query Reviewer",
    "sql",
    "Review the supplied SQL query for correctness, performance, security, and maintainability. Preserve business semantics. Explain findings, identify assumptions, and provide a revised query only when justified.",
    ["sql", "code-review"],
  ],
  [
    "Data Analysis Planner",
    "sql",
    "Turn the supplied business question and dataset description into a reproducible analysis plan. Define metrics, dimensions, data-quality checks, assumptions, validation steps, and an output schema.",
    ["data", "analysis"],
  ],
  [
    "Jira Release Risk Summary",
    "jira",
    "Analyze the supplied Jira issue data for release risk. Separate blockers, regressions, untested changes, dependencies, and stale work. Cite issue keys and do not infer statuses that were not provided.",
    ["jira", "risk"],
  ],
  [
    "Jira Backlog Refiner",
    "jira",
    "Review supplied backlog items for clarity, value, testability, dependencies, and acceptance criteria. Propose concise refinements while preserving product intent and marking unanswered questions.",
    ["jira", "backlog"],
  ],
  [
    "Release Readiness Reviewer",
    "release",
    "Evaluate supplied build, test, accessibility, performance, and known-issue evidence against explicit release criteria. Separate blockers from warnings and produce a reviewable go/no-go recommendation.",
    ["release", "quality-gates"],
  ],
  [
    "Release Notes Editor",
    "release",
    "Transform the supplied verified change list into concise release notes for users and internal stakeholders. Separate added, changed, fixed, known issues, and upgrade notes. Do not invent benefits or fixes.",
    ["release-notes", "documentation"],
  ],
  [
    "Product Requirements Reviewer",
    "product",
    "Review the supplied product requirement for user value, scope, ambiguity, edge cases, measurable acceptance criteria, dependencies, privacy, accessibility, and operational risks.",
    ["product", "requirements"],
  ],
  [
    "User Story Writer",
    "product",
    "Convert the supplied problem statement into testable user stories. Include actor, value, acceptance criteria, exclusions, dependencies, and open questions. Avoid prescribing implementation unless required.",
    ["product", "agile"],
  ],
  [
    "Code Review Specialist",
    "development",
    "Review the supplied code or diff for correctness, security, maintainability, performance, accessibility impact, and missing tests. Prioritize actionable findings and avoid speculative claims.",
    ["development", "code-review"],
  ],
  [
    "Bug Fix Planner",
    "development",
    "Given a verified bug report and relevant code context, propose a minimal fix plan, affected areas, regression risks, tests, rollout considerations, and a rollback signal. Do not claim the fix was executed.",
    ["development", "debugging"],
  ],
  [
    "API Contract Reviewer",
    "development",
    "Review the supplied API contract for consistency, validation, authorization boundaries, error semantics, pagination, idempotency, compatibility, observability, and test coverage.",
    ["api", "review"],
  ],
  [
    "Technical Documentation Editor",
    "general",
    "Edit the supplied technical documentation for accuracy, structure, prerequisites, steps, examples, safety notes, and troubleshooting. Preserve verified facts and flag claims needing validation.",
    ["documentation", "editing"],
  ],
  [
    "Professional Email Editor",
    "customer",
    "Rewrite the supplied email for clarity, empathy, professional tone, and a specific next action. Preserve facts, commitments, names, dates, and uncertainty. Return only the revised draft.",
    ["communication", "email"],
  ],
  [
    "Customer Incident Update",
    "customer",
    "Draft a customer-facing incident update from supplied verified facts. Include impact, current status, mitigation, next update time, and support path. Do not speculate about root cause or resolution.",
    ["customer", "incident"],
  ],
  [
    "Meeting Action Extractor",
    "general",
    "Extract decisions, owners, actions, due dates, blockers, and unresolved questions from the supplied meeting notes. Distinguish explicit assignments from inferred follow-ups.",
    ["meetings", "actions"],
  ],
  [
    "Learning Plan Designer",
    "learning",
    "Create a practical learning plan for the supplied goal, current level, available time, and deadline. Include milestones, exercises, verification, reflection, and adaptation checkpoints.",
    ["learning", "planning"],
  ],
  [
    "Concept Explainer",
    "learning",
    "Explain the supplied concept at the requested level using a concise definition, mental model, example, counterexample, common misconception, and self-check questions.",
    ["learning", "explanation"],
  ],
  [
    "Prompt Improvement Reviewer",
    "learning",
    "Review the supplied prompt for task clarity, context, constraints, output format, missing information, unsafe assumptions, and verification. Return findings and an improved editable draft.",
    ["prompt-engineering", "review"],
  ],
  [
    "AI Agent Design Reviewer",
    "development",
    "Review the supplied agent design for goal clarity, inputs, tool permissions, memory, validation, retries, human approval, stop conditions, output, observability, and failure modes. Treat tools as conceptual unless proven connected.",
    ["agents", "safety"],
  ],
  [
    "Automation Opportunity Assessor",
    "product",
    "Assess the supplied workflow for safe automation. Map steps, inputs, decisions, exceptions, permissions, human approvals, audit evidence, expected value, and conditions where automation should stop.",
    ["automation", "workflow"],
  ],
];

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const starterCatalog: readonly CatalogEntry[] = Object.freeze(
  seeds.map(([title, category, prompt, tags]) => ({
    ...catalogSourceMetadata,
    id: `prompts-chat-${slug(title)}`,
    sourceOriginalId: slug(originalSourceRecords[title].sourceOriginalTitle),
    sourceOriginalTitle: originalSourceRecords[title].sourceOriginalTitle,
    title,
    prompt,
    description: `A reviewed educational starting point for ${title.toLowerCase()}.`,
    language: "en" as const,
    category,
    tags,
    sourceContentHash: catalogContentHash(
      originalSourceRecords[title].originalContent,
    ),
    isCurated: true as const,
    curationNotes:
      "Selected for practical Academy relevance; wording normalized for clarity and reviewability.",
    originalContent: originalSourceRecords[title].originalContent,
    curatedContent: prompt,
    safetyReviewStatus: "approved" as const,
  })),
);
