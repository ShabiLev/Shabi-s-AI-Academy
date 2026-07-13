import type { LocalizedText } from "../../course/types";
import type { AgentCategory } from "../types";
import type { StarterAgent } from "./types";

const t = (he: string, en: string): LocalizedText => ({ he, en });
type Seed = readonly [id: string, he: string, en: string, category: AgentCategory, tools: readonly string[]];

const seeds: readonly Seed[] = [
  ["qa-release-analyst", "מנתח איכות שחרור", "QA Release Analyst", "release", ["jiraReader", "githubReader", "testReport"]],
  ["test-case-generator", "מחולל מקרי בדיקה", "Test Case Generator", "qa", ["fileReader"]],
  ["regression-scope-planner", "מתכנן היקף רגרסיה", "Regression Scope Planner", "qa", ["testReport"]],
  ["bug-triage-agent", "סוכן מיון תקלות", "Bug Triage Agent", "qa", ["jiraReader"]],
  ["requirements-reviewer", "סוקר דרישות", "Requirements Reviewer", "qa", ["fileReader"]],
  ["exploratory-testing-coach", "מאמן בדיקות חקר", "Exploratory Testing Coach", "qa", ["none"]],
  ["api-test-designer", "מתכנן בדיקות API", "API Test Designer", "qa", ["fileReader"]],
  ["test-automation-reviewer", "סוקר אוטומציית בדיקות", "Test Automation Reviewer", "qa", ["githubReader"]],
  ["test-data-planner", "מתכנן נתוני בדיקה", "Test Data Planner", "qa", ["none"]],
  ["incident-review-analyst", "מנתח סקירת תקרית", "Incident Review Analyst", "qa", ["testReport"]],
  ["sql-query-reviewer", "סוקר שאילתות SQL", "SQL Query Reviewer", "sql", ["sqlQuery"]],
  ["sql-performance-reviewer", "סוקר ביצועי SQL", "SQL Performance Reviewer", "sql", ["sqlQuery"]],
  ["reporting-query-builder", "בונה שאילתות דיווח", "Reporting Query Builder", "sql", ["sqlQuery"]],
  ["data-quality-analyst", "מנתח איכות נתונים", "Data Quality Analyst", "sql", ["fileReader"]],
  ["duplicate-row-detector", "מאתר שורות כפולות", "Duplicate Row Detector", "sql", ["sqlQuery"]],
  ["date-range-validator", "מאמת טווחי תאריכים", "Date Range Validator", "sql", ["none"]],
  ["jira-risk-analyzer", "מנתח סיכוני Jira", "Jira Risk Analyzer", "jira", ["jiraReader"]],
  ["sprint-health-analyst", "מנתח בריאות ספרינט", "Sprint Health Analyst", "jira", ["jiraReader"]],
  ["release-notes-generator", "מחולל הערות שחרור", "Release Notes Generator", "release", ["jiraReader"]],
  ["go-no-go-preparation", "סוכן הכנת Go/No-Go", "Go/No-Go Preparation Agent", "release", ["testReport"]],
  ["backlog-quality-reviewer", "סוקר איכות Backlog", "Backlog Quality Reviewer", "jira", ["jiraReader"]],
  ["dependency-analyzer", "מנתח תלויות", "Dependency Analyzer", "jira", ["jiraReader"]],
  ["prd-reviewer", "סוקר PRD", "PRD Reviewer", "product", ["fileReader"]],
  ["acceptance-criteria-generator", "מחולל קריטריוני קבלה", "Acceptance Criteria Generator", "product", ["none"]],
  ["customer-communication-agent", "סוכן תקשורת ללקוחות", "Customer Communication Agent", "customer", ["emailDraft"]],
  ["meeting-action-extractor", "מחלץ משימות מפגישה", "Meeting Action Extractor", "customer", ["fileReader"]],
  ["stakeholder-update-writer", "כותב עדכון לבעלי עניין", "Stakeholder Update Writer", "customer", ["notification"]],
  ["feature-risk-analyst", "מנתח סיכוני תכונה", "Feature Risk Analyst", "product", ["none"]],
  ["code-review-agent", "סוכן סקירת קוד", "Code Review Agent", "development", ["githubReader"]],
  ["architecture-reviewer", "סוקר ארכיטקטורה", "Architecture Reviewer", "development", ["fileReader"]],
  ["prompt-optimizer", "ממטב פרומפטים", "Prompt Optimizer", "learning", ["none"]],
  ["agent-blueprint-reviewer", "סוקר תכנון סוכן", "Agent Blueprint Reviewer", "development", ["none"]],
] as const;

export const starterAgents: readonly StarterAgent[] = Object.freeze(seeds.map(([id, he, en, category, tools], index) => {
  const risky = tools.some((tool) => ["sqlQuery", "emailDraft", "notification"].includes(tool));
  return {
    id, name: t(he, en), category,
    description: t(`תבנית לימודית ל${he}, עם גבולות ואימות מפורשים.`, `An educational ${en} template with explicit boundaries and validation.`),
    role: t(`פעלו בתפקיד ${he}.`, `Act as the ${en}.`),
    goal: t("הכינו תוצר מדויק, מבוסס ראיות וניתן לסקירה.", "Prepare an accurate, evidence-based, reviewable deliverable."),
    requiredInputs: [t("בקשה ברורה", "A clear request"), t("נתוני מקור רלוונטיים", "Relevant source data")],
    optionalInputs: [t("קריטריוני איכות", "Quality criteria")],
    instructions: t("אמתו קלט, תכננו, השתמשו רק בכלים המתוכננים, סמנו הנחות והחזירו תוצר לסקירה.", "Validate input, plan, use only planned tools, mark assumptions, and return reviewable output."),
    plannedTools: tools,
    risks: [t("הסקת מסקנות ממידע חסר", "Inferring from missing data"), t("פעולה ללא הרשאה", "Acting without permission")],
    connectionStatus: "notConnected" as const,
    memory: "session" as const,
    validation: t("בדקו שדות חובה, ראיות, עקביות וטענות שאינן נתמכות.", "Check required fields, evidence, consistency, and unsupported claims."),
    retry: { maximumRetries: 2 as const, stopCondition: t("עצרו לאחר שני ניסיונות או בכל בקשה לא בטוחה.", "Stop after two attempts or any unsafe request.") },
    approvalPoints: risky ? [t("נדרש אישור מפורש לפני פעולה חיצונית מוצעת.", "Explicit approval is required before a proposed external action.")] : [],
    output: t("סיכום מובנה עם ראיות, סיכונים והמלצות.", "A structured summary with evidence, risks, and recommendations."),
    completionCriteria: t("כל הקלטים טופלו וכל כללי האימות עברו.", "All inputs are addressed and validation rules pass."),
    riskNotes: t("הכלים מתוכננים בלבד ואינם מחוברים בגרסת הבטא.", "Tools are planned only and are not connected in the beta."),
    qualityTarget: t("תוצר מלא, עקבי וניתן לאימות.", "A complete, consistent, verifiable deliverable."),
    mockScenario: (risky ? "approvalRequired" : index % 4 === 0 ? "retryThenSuccess" : "success") as StarterAgent["mockScenario"],
    sampleInput: t("נתוני דוגמה מקומיים ללא מידע רגיש.", "Local sample data without sensitive information."),
    version: 1 as const,
  };
}));

export const getStarterAgent = (id: string) => starterAgents.find((agent) => agent.id === id);
