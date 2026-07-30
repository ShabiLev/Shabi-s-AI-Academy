import type { FailureCase, LearningEvidence, TeamRecommendation } from "./types";
import { validateFailureCase } from "./validation";

export type DerivedSkillLevel = "practised" | "demonstrated" | "mastered";

export function deriveSkillLevel(items: readonly LearningEvidence[]): DerivedSkillLevel {
  const independentHighConfidence = items.filter((item) =>
    item.outcome === "demonstrated" && item.confidence === "high" && item.evidenceIds.length > 0);
  const uniqueRuns = new Set(independentHighConfidence.map((item) => item.runId));
  const uniqueEvaluators = new Set(independentHighConfidence.map((item) => item.evaluatorId));
  if (uniqueRuns.size >= 3 && uniqueEvaluators.size >= 2) return "mastered";
  if (uniqueRuns.size >= 1) return "demonstrated";
  return "practised";
}

export function addLearningEvidence(existing: readonly LearningEvidence[], item: LearningEvidence): LearningEvidence[] {
  if (existing.some((current) => current.id === item.id)) return [...existing];
  return [...existing, item].slice(-500);
}

export function removeLearningEvidence(existing: readonly LearningEvidence[], id: string): LearningEvidence[] {
  return existing.filter((item) => item.id !== id);
}

export function createFailureCase(value: FailureCase): FailureCase {
  if (!validateFailureCase(value)) throw new Error("Invalid failure case.");
  return structuredClone(value);
}

export function buildTeamRecommendation(input: Omit<TeamRecommendation, "confidence">): TeamRecommendation {
  const confidence = input.comparableRunCount < 3 ? "low"
    : input.comparableRunCount < 10 ? "medium" : "high";
  return {
    ...input,
    successRate: Math.max(0, Math.min(100, input.successRate)),
    averageRetries: Math.max(0, input.averageRetries),
    confidence,
    limitations: input.comparableRunCount < 3
      ? [...input.limitations, { he: "מדגם קטן; אין להסיק על ביצועים כלליים.", en: "Small sample; do not generalize performance." }]
      : input.limitations,
  };
}

export const builtInFailureCases: readonly FailureCase[] = [{
  schemaVersion: 1,
  id: "self-approval-example",
  title: { he: "המיישם אישר את עבודתו", en: "Implementer approved their own work" },
  category: "self-approval",
  symptom: { he: "תוצאה סומנה כמאושרת ללא בודק עצמאי.", en: "A result was certified without an independent evaluator." },
  rootCause: { he: "לא נאכפה הפרדת תפקידים.", en: "Separation of duties was not enforced." },
  missedSignal: { he: "מזהה המעריך תאם לבעל המימוש.", en: "The evaluator ID matched the implementation owner." },
  correctiveAction: { he: "להקצות מעריך read-only עצמאי.", en: "Assign an independent read-only evaluator." },
  reusableRule: { he: "אין self-approval.", en: "Never allow self-approval." },
  evidenceIds: [],
  sourceRunIds: [],
  createdAt: "2026-07-30T00:00:00.000Z",
  updatedAt: "2026-07-30T00:00:00.000Z",
}];
