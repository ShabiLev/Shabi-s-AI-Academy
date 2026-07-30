import { immutableCopy } from "./hash";
import type { EvaluationRubric, LocalizedText, RubricCriterion } from "./types";

const t = (he: string, en: string): LocalizedText => ({ he, en });
const now = "2026-07-30T00:00:00.000Z";
const anchors = [
  { score: 0, label: t("לא עומד בדרישה", "Does not meet the requirement") },
  { score: 3, label: t("עומד חלקית", "Partially meets the requirement") },
  { score: 5, label: t("עומד במלוא הדרישה", "Fully meets the requirement") },
];

function criterion(id: string, he: string, en: string, weight: number, evidence: RubricCriterion["requiredEvidenceTypes"], blocking = false): RubricCriterion {
  return {
    id,
    name: t(he, en),
    description: t(`הערכה שקופה של ${he}`, `Transparent assessment of ${en.toLowerCase()}`),
    weight,
    scoringScale: { min: 0, max: 5, anchors },
    requiredEvidenceTypes: evidence,
    blocking,
  };
}

function rubric(id: string, he: string, en: string, criteria: RubricCriterion[], passingScore = 70): EvaluationRubric {
  return {
    schemaVersion: 1,
    id,
    name: t(he, en),
    description: t(`מחוון מובנה עבור ${he}`, `Built-in rubric for ${en.toLowerCase()}`),
    source: "system",
    criteria,
    totalWeight: 100,
    passingScore,
    evidencePolicy: { minimumPerCriterion: 1, requireIndependentEvaluator: true },
    createdAt: now,
    updatedAt: now,
  };
}

export const builtInRubrics = immutableCopy([
  rubric("general-mission-quality", "איכות משימה כללית", "General Mission Quality", [
    criterion("requirements", "התאמה לדרישות", "Requirements alignment", 30, ["requirement", "output"], true),
    criterion("correctness", "נכונות", "Correctness", 30, ["output", "test"], true),
    criterion("quality", "איכות", "Quality", 20, ["review"]),
    criterion("evidence", "איכות ראיות", "Evidence quality", 20, ["trace", "test"]),
  ]),
  rubric("react-ui-feature", "תכונת React UI", "React UI Feature", [
    criterion("behavior", "התנהגות", "Behavior", 30, ["output", "test"], true),
    criterion("accessibility", "נגישות", "Accessibility", 25, ["accessibility"], true),
    criterion("responsive", "רספונסיביות", "Responsive behavior", 20, ["test"]),
    criterion("maintainability", "תחזוקתיות", "Maintainability", 25, ["review"]),
  ]),
  rubric("sql-data-query", "שאילתת SQL / נתונים", "SQL / Data Query", [
    criterion("correctness", "נכונות תוצאה", "Result correctness", 40, ["test", "output"], true),
    criterion("safety", "בטיחות נתונים", "Data safety", 25, ["security"], true),
    criterion("performance", "ביצועים", "Performance", 20, ["performance"]),
    criterion("clarity", "בהירות", "Clarity", 15, ["review"]),
  ]),
  rubric("prompt-quality", "איכות Prompt", "Prompt Quality", [
    criterion("intent", "דיוק כוונה", "Intent accuracy", 30, ["requirement", "output"], true),
    criterion("constraints", "אילוצים", "Constraints", 25, ["output"]),
    criterion("robustness", "עמידות", "Robustness", 25, ["test"]),
    criterion("safety", "בטיחות", "Safety", 20, ["security"], true),
  ]),
  rubric("agent-definition", "הגדרת Agent", "Agent Definition", [
    criterion("contract", "חוזה תפקיד", "Role contract", 30, ["requirement"], true),
    criterion("permissions", "הרשאות", "Permissions", 30, ["security"], true),
    criterion("gates", "שערי איכות", "Quality gates", 20, ["review"]),
    criterion("provenance", "מקור", "Provenance", 20, ["trace"]),
  ]),
  rubric("release-readiness", "מוכנות לשחרור", "Release Readiness", [
    criterion("functional", "פונקציונליות", "Functional quality", 30, ["test"], true),
    criterion("security", "אבטחה", "Security", 25, ["security"], true),
    criterion("accessibility", "נגישות", "Accessibility", 20, ["accessibility"], true),
    criterion("operations", "תפעול וראיות", "Operations and evidence", 25, ["trace", "review"], true),
  ], 80),
  rubric("accessibility-review", "סקירת נגישות", "Accessibility Review", [
    criterion("keyboard", "מקלדת ומיקוד", "Keyboard and focus", 30, ["accessibility"], true),
    criterion("semantics", "סמנטיקה", "Semantics", 30, ["accessibility"], true),
    criterion("visual", "תפיסה חזותית", "Visual perception", 20, ["accessibility"]),
    criterion("responsive", "Zoom ומובייל", "Zoom and mobile", 20, ["test"]),
  ], 80),
  rubric("security-review", "סקירת אבטחה", "Security Review", [
    criterion("input", "קלט וייבוא", "Input and import", 25, ["security"], true),
    criterion("permissions", "הרשאות", "Permissions", 25, ["security"], true),
    criterion("privacy", "פרטיות", "Privacy", 25, ["security"], true),
    criterion("integrity", "שלמות", "Integrity", 25, ["security"], true),
  ], 85),
] satisfies EvaluationRubric[]);

export interface ReadOnlyEvaluator {
  id: string;
  name: LocalizedText;
  evidenceTypes: RubricCriterion["requiredEvidenceTypes"];
  permissions: readonly ["observe", "validate"];
  realityChecker: boolean;
}

export const readOnlyEvaluators: readonly ReadOnlyEvaluator[] = immutableCopy([
  ["requirements-evaluator", "מעריך דרישות", "Requirements Evaluator", ["requirement"]],
  ["code-quality-evaluator", "מעריך איכות קוד", "Code Quality Evaluator", ["review", "test"]],
  ["security-evaluator", "מעריך אבטחה", "Security Evaluator", ["security"]],
  ["accessibility-evaluator", "מעריך נגישות", "Accessibility Evaluator", ["accessibility"]],
  ["ux-evaluator", "מעריך חוויית משתמש", "UX Evaluator", ["review"]],
  ["sql-correctness-evaluator", "מעריך נכונות SQL", "SQL Correctness Evaluator", ["output", "test"]],
  ["test-coverage-evaluator", "מעריך כיסוי בדיקות", "Test Coverage Evaluator", ["test"]],
  ["reality-checker", "בודק מציאות", "Reality Checker", ["trace", "review"]],
].map(([id, he, en, evidenceTypes]) => ({
  id: id as string,
  name: t(he as string, en as string),
  evidenceTypes: evidenceTypes as RubricCriterion["requiredEvidenceTypes"],
  permissions: ["observe", "validate"] as const,
  realityChecker: id === "reality-checker",
})));

export function cloneBuiltInRubric(id: string, newId: string, nowIso: string): EvaluationRubric {
  const source = builtInRubrics.find((item) => item.id === id);
  if (!source) throw new Error("Unknown built-in rubric.");
  return immutableCopy({
    ...source,
    id: newId,
    source: "user" as const,
    sourceRubricId: source.id,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}
