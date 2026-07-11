import { emptyAgent, type AgentInput } from "./types";
const base = (
  name: string,
  category: AgentInput["category"],
  goal: string,
  tools: string[],
): AgentInput => ({
  ...emptyAgent,
  name,
  category,
  language: "en",
  goal,
  inputs: "A clear task request and relevant source data.",
  instructions:
    "Validate inputs, plan the work, use only declared conceptual tools, validate the result, and prepare reviewable output.",
  tools,
  validationRules:
    "Check required fields, evidence, consistency, and unsupported assumptions.",
  humanApprovalPoints: tools.some((t) =>
    ["sqlQuery", "emailDraft", "notification"].includes(t),
  )
    ? [
        {
          title: "Human review",
          description:
            "Approve the proposed external action before it would run.",
          stage: "before action",
          required: true,
          approverRole: "Responsible reviewer",
        },
      ]
    : [],
  outputFormat:
    "Structured summary with evidence, risks, and recommended next actions.",
  completionCriteria:
    "All required inputs are addressed and validation rules pass.",
  retryPolicy: {
    maximumRetries: 2,
    retryCondition: "Validation failed with a recoverable input issue.",
    backoff: "none",
    fallbackAction: "Stop and request human guidance.",
    stopCondition: "Stop after two retries or any unsafe/unsupported request.",
  },
  status: "draft",
});
export const agentTemplates = [
  base(
    "QA Release Analyst",
    "release",
    "Analyze release evidence and produce a prioritized, reviewable quality-risk assessment.",
    ["jiraReader", "githubReader", "testReport"],
  ),
  base(
    "SQL Query Reviewer",
    "sql",
    "Review a supplied SQL query for correctness, performance, and maintainability.",
    ["sqlQuery"],
  ),
  base(
    "Jira Risk Analyzer",
    "jira",
    "Identify release and delivery risks from supplied Jira issue data.",
    ["jiraReader"],
  ),
  base(
    "Test Case Generator",
    "qa",
    "Create traceable functional and negative test cases from a supplied requirement.",
    ["fileReader", "testReport"],
  ),
  base(
    "Customer Communication Agent",
    "customer",
    "Draft accurate, professional customer communication for human approval.",
    ["emailDraft"],
  ),
];
