import type { AgentDefinition, AgentTeam, LocalizedText, SkillDefinition } from "./types";

const text = (he: string, en: string): LocalizedText => ({ he, en });
const SOURCE_REPOSITORY = "https://github.com/msitarzewski/agency-agents";
const SOURCE_REVISION = "8ef49232e02431f7ca4792b487e5a85a7939ff3a";

interface AgentSeed {
  id: string;
  he: string;
  en: string;
  purposeHe: string;
  purposeEn: string;
  permissions: AgentDefinition["permissions"];
  path?: string;
}

const seeds: AgentSeed[] = [
  { id: "conductor", he: "מנצח הצוות", en: "Team Conductor", purposeHe: "מפרש, מתכנן ומתאם מסירות ללא אישור עצמי.", purposeEn: "Interprets, plans, and coordinates handoffs without self-approval.", permissions: ["observe", "recommend", "plan"], path: "specialized/agents-orchestrator.md" },
  { id: "product-manager", he: "מנהל מוצר", en: "Product Manager", purposeHe: "מגדיר ערך, היקף וקריטריוני קבלה.", purposeEn: "Defines value, scope, and acceptance criteria.", permissions: ["observe", "recommend", "plan"], path: "product/product-manager.md" },
  { id: "project-manager", he: "מנהל פרויקט בכיר", en: "Senior Project Manager", purposeHe: "מתרגם תכנית לשלבים, תלות וסיכונים.", purposeEn: "Turns the plan into phases, dependencies, and risks.", permissions: ["observe", "recommend", "plan"], path: "project-management/project-manager-senior.md" },
  { id: "software-architect", he: "ארכיטקט תוכנה", en: "Software Architect", purposeHe: "בודק גבולות, חוזים והתאמה ארכיטקטונית.", purposeEn: "Reviews boundaries, contracts, and architectural fit.", permissions: ["observe", "recommend", "plan"], path: "engineering/engineering-software-architect.md" },
  { id: "ux-architect", he: "ארכיטקט UX", en: "UX Architect", purposeHe: "מגדיר מסע, היררכיה ומצבי שימוש.", purposeEn: "Defines journeys, hierarchy, and interaction states.", permissions: ["observe", "recommend", "plan"], path: "design/design-ux-architect.md" },
  { id: "ui-designer", he: "מעצב ממשק", en: "UI Designer", purposeHe: "מגדיר שפה חזותית ונגישות תצוגה.", purposeEn: "Defines visual language and accessible presentation.", permissions: ["observe", "recommend", "implement"], path: "design/design-ui-designer.md" },
  { id: "frontend-developer", he: "מפתח Frontend", en: "Frontend Developer", purposeHe: "מיישם ממשקים ורכיבי React.", purposeEn: "Implements React interfaces and components.", permissions: ["observe", "implement"], path: "engineering/engineering-frontend-developer.md" },
  { id: "data-engineer", he: "מהנדס נתונים ואחסון", en: "Data and Storage Engineer", purposeHe: "מגן על סכמות, מיגרציה ושלמות נתונים.", purposeEn: "Protects schemas, migration, and data integrity.", permissions: ["observe", "recommend", "implement"], path: "engineering/engineering-data-engineer.md" },
  { id: "prompt-engineer", he: "מהנדס פרומפטים", en: "Prompt Engineer", purposeHe: "משפר הוראות, מבנה והערכה.", purposeEn: "Improves instructions, structure, and evaluation.", permissions: ["observe", "recommend", "implement"], path: "engineering/engineering-prompt-engineer.md" },
  { id: "test-engineer", he: "מהנדס אוטומציית בדיקות", en: "Test Automation Engineer", purposeHe: "מתכנן רגרסיה ומפיק ראיות בדיקה.", purposeEn: "Designs regression and produces test evidence.", permissions: ["observe", "validate"], path: "testing/testing-test-automation-engineer.md" },
  { id: "accessibility-auditor", he: "מבקר נגישות", en: "Accessibility Auditor", purposeHe: "בודק WCAG, מקלדת ושמות נגישים.", purposeEn: "Checks WCAG, keyboard access, and accessible names.", permissions: ["observe", "validate"], path: "testing/testing-accessibility-auditor.md" },
  { id: "appsec-engineer", he: "מהנדס AppSec", en: "AppSec Engineer", purposeHe: "בודק גבולות אמון, הרשאות ואיומים.", purposeEn: "Reviews trust boundaries, permissions, and threats.", permissions: ["observe", "validate"], path: "security/security-appsec-engineer.md" },
  { id: "code-reviewer", he: "סוקר קוד", en: "Code Reviewer", purposeHe: "בודק נכונות, תחזוקתיות וסיכוני רגרסיה.", purposeEn: "Reviews correctness, maintainability, and regression risk.", permissions: ["observe", "validate", "approve"] },
  { id: "reality-checker", he: "בודק מציאות", en: "Reality Checker", purposeHe: "מפריד בין הוכחה, הנחה וטענה לא מאומתת.", purposeEn: "Separates evidence, assumptions, and unverified claims.", permissions: ["observe", "validate", "approve"] },
  { id: "sql-investigator", he: "חוקר SQL", en: "SQL Investigator", purposeHe: "ממפה שאילתות ומאמת מסקנות ללא שינוי נתונים.", purposeEn: "Maps queries and validates conclusions without changing data.", permissions: ["observe", "recommend", "plan"] },
  { id: "persona-walkthrough", he: "מומחה מסע פרסונות", en: "Persona Walkthrough Specialist", purposeHe: "בודק מסעות משתמשים, מצבים ריקים ותרחישי קצה.", purposeEn: "Reviews user journeys, empty states, and edge scenarios.", permissions: ["observe", "validate"] },
  { id: "ui-finish-gate", he: "סוקר שער גמר UI", en: "UI Finish-Gate Reviewer", purposeHe: "מאשר גמר חזותי רק מול ראיות נגישות ורספונסיביות.", purposeEn: "Approves visual finish only against accessibility and responsive evidence.", permissions: ["observe", "validate", "approve"] },
  { id: "git-workflow-master", he: "מומחה תהליכי Git", en: "Git Workflow Master", purposeHe: "מתכנן זרימת branch, PR, SHA ותגים בטוחה.", purposeEn: "Plans safe branch, PR, SHA, and tag flows.", permissions: ["observe", "recommend", "plan", "approve"] },
  { id: "devops-engineer", he: "מהנדס DevOps", en: "DevOps Engineer", purposeHe: "מדמה ומיישם אוטומציה מקומית בגבולות המשימה.", purposeEn: "Simulates and implements local automation within mission bounds.", permissions: ["observe", "implement"] },
  { id: "data-analyst", he: "אנליסט נתונים", en: "Data Analyst", purposeHe: "מגדיר מדדים ומפריד בין עובדה, חישוב והנחה.", purposeEn: "Defines metrics and separates facts, calculations, and assumptions.", permissions: ["observe", "recommend"] },
  { id: "performance-reviewer", he: "סוקר ביצועים", en: "Performance Reviewer", purposeHe: "בודק תוכניות ביצוע, נפחים וסיכוני האטה.", purposeEn: "Reviews execution plans, volumes, and slowdown risks.", permissions: ["observe", "validate"] },
  { id: "sql-qa-reviewer", he: "סוקר QA ל-SQL", en: "SQL QA Reviewer", purposeHe: "מאמת ספירות, כפילויות, טווחי זמן ומשמעות עסקית.", purposeEn: "Validates counts, duplicates, date ranges, and business meaning.", permissions: ["observe", "validate", "approve"] },
  { id: "domain-expert", he: "מומחה תחום", en: "Domain Expert", purposeHe: "מוסיף הקשר מקצועי ומגבלות תחום מפורשות.", purposeEn: "Adds professional context and explicit domain constraints.", permissions: ["observe", "recommend"] },
  { id: "evaluation-reviewer", he: "סוקר הערכה", en: "Evaluation Reviewer", purposeHe: "בודק תוצאות מול קריטריונים ללא ציוני AI מומצאים.", purposeEn: "Reviews outputs against criteria without fabricated AI scoring.", permissions: ["observe", "validate", "approve"] },
];

export const agentCatalog: readonly AgentDefinition[] = Object.freeze(seeds.map((seed) => Object.freeze({
  schemaVersion: 1 as const,
  id: seed.id,
  name: text(seed.he, seed.en),
  role: text(seed.he, seed.en),
  purpose: text(seed.purposeHe, seed.purposeEn),
  inputs: [text("מטרה, הקשר וראיות קודמות", "Goal, context, and prior evidence")],
  outputs: [text("תוצר מובנה ומסירה מוסברת", "Structured output and explained handoff")],
  permissions: [...seed.permissions],
  gates: seed.permissions.includes("validate") ? ["independent-evidence"] : ["conductor-handoff"],
  source: seed.path ? "community" as const : "system" as const,
  sourceDetails: seed.path ? {
    repository: SOURCE_REPOSITORY,
    revision: SOURCE_REVISION,
    path: seed.path,
    license: "MIT",
    adapted: true,
  } : { adapted: true },
  active: true,
})));

const now = "2026-07-29T00:00:00.000Z";
const preset = (id: string, he: string, en: string, descriptionHe: string, descriptionEn: string, members: string[], phases: string[]): AgentTeam => ({
  schemaVersion: 1,
  id,
  name: text(he, en),
  description: text(descriptionHe, descriptionEn),
  source: "system",
  conductorAgentId: "conductor",
  memberAgentIds: ["conductor", ...members],
  phaseIds: phases,
  createdAt: now,
  updatedAt: now,
});

export const teamPresets: readonly AgentTeam[] = Object.freeze([
  preset("feature-delivery", "מסירת יכולת", "Feature Delivery", "מהגדרת הערך עד ראיות רגרסיה.", "From product value to regression evidence.", ["product-manager", "software-architect", "frontend-developer", "test-engineer", "code-reviewer", "reality-checker"], ["interpret", "design", "implement", "validate", "review"]),
  preset("ui-ux-review", "סקירת UI/UX", "UI/UX Review", "מסע, עיצוב, נגישות וראיות.", "Journey, design, accessibility, and evidence.", ["ux-architect", "ui-designer", "accessibility-auditor", "persona-walkthrough", "ui-finish-gate"], ["interpret", "inspect", "validate", "review"]),
  preset("release-certification", "הסמכת שחרור", "Release Certification", "איכות, אבטחה ומוכנות לשחרור.", "Quality, security, and release readiness.", ["git-workflow-master", "devops-engineer", "code-reviewer", "appsec-engineer", "test-engineer", "reality-checker"], ["interpret", "plan", "validate", "security", "certify"]),
  preset("sql-investigation", "חקירת SQL", "SQL Investigation", "חקירה לקריאה בלבד עם אימות עסקי.", "Read-only investigation with business validation.", ["sql-investigator", "data-analyst", "performance-reviewer", "sql-qa-reviewer"], ["interpret", "map", "analyze", "validate"]),
  preset("prompt-improvement", "שיפור פרומפט", "Prompt Improvement", "בהירות, מבנה והערכת תוצאה.", "Clarity, structure, and output evaluation.", ["prompt-engineer", "domain-expert", "evaluation-reviewer", "reality-checker"], ["interpret", "improve", "evaluate", "review"]),
]);

export const skillCatalog: readonly SkillDefinition[] = Object.freeze([
  ["prompt-engineering", "הנדסת פרומפטים", "Prompt Engineering", ["prompt-engineer"], "/lessons"],
  ["agents", "סוכנים", "Agents", ["software-architect"], "/agents/catalog"],
  ["agent-teams", "צוותי סוכנים", "Agent Teams", ["conductor"], "/team"],
  ["orchestration", "תזמור", "Orchestration", ["conductor"], "/missions/new"],
  ["qa", "אבטחת איכות", "QA", ["test-engineer"], "/qa"],
  ["test-automation", "אוטומציית בדיקות", "Test Automation", ["test-engineer"], "/qa"],
  ["accessibility", "נגישות", "Accessibility", ["accessibility-auditor"], "/help"],
  ["security", "אבטחה", "Security", ["appsec-engineer"], "/help"],
  ["data-sql", "נתונים ו-SQL", "Data and SQL", ["data-engineer", "sql-investigator"], "/lessons"],
  ["product-management", "ניהול מוצר", "Product Management", ["product-manager"], "/lessons"],
  ["software-architecture", "ארכיטקטורת תוכנה", "Software Architecture", ["software-architect"], "/lessons"],
  ["ai-research", "מחקר AI", "AI Research", ["reality-checker"], "/radar"],
].map(([id, he, en, relatedAgentIds, lessonRoute]) => ({
  id: id as string,
  name: text(he as string, en as string),
  relatedAgentIds: relatedAgentIds as string[],
  lessonRoute: lessonRoute as string,
})));

export const communitySource = {
  repository: SOURCE_REPOSITORY,
  revision: SOURCE_REVISION,
  license: "MIT",
  copyright: "Copyright (c) 2025 AgentLand Contributors",
} as const;
