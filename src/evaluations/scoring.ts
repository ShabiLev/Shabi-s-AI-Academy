import type { CertificationResult, EvaluationEvidence, EvaluationFinding, EvaluationRubric, LocalizedText } from "./types";
import { validateFinding } from "./validation";

const reason = (he: string, en: string): LocalizedText => ({ he, en });

export function certifyFindings(
  rubric: EvaluationRubric,
  findings: readonly EvaluationFinding[],
  evidence: readonly EvaluationEvidence[],
  realityCheckerBlocked = false,
): CertificationResult {
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const criteria = rubric.criteria.map((criterion) => {
    const relevant = findings.filter((finding) => finding.criterionId === criterion.id && validateFinding(finding, rubric));
    if (relevant.length === 0) return { criterionId: criterion.id, status: "not-scored" as const, findings: [] };
    const statuses = new Set(relevant.map((finding) => finding.status));
    const scored = relevant.filter((finding) => {
      const foundTypes = new Set(finding.evidenceIds.map((id) => evidenceById.get(id)?.type).filter(Boolean));
      return finding.status !== "not-scored" && criterion.requiredEvidenceTypes.every((type) => foundTypes.has(type))
        && finding.evidenceIds.length >= rubric.evidencePolicy.minimumPerCriterion
        && (!rubric.evidencePolicy.requireIndependentEvaluator || finding.evaluatorId !== finding.implementationOwnerId);
    });
    if (scored.length === 0) return { criterionId: criterion.id, status: "not-scored" as const, findings: relevant };
    const scoredStatuses = new Set(scored.map((finding) => finding.status));
    if (scoredStatuses.has("pass") && scoredStatuses.has("fail")) {
      return { criterionId: criterion.id, status: "disagreement" as const, findings: relevant };
    }
    const normalizedScore = scored.reduce((sum, finding) => {
      const scale = criterion.scoringScale;
      return sum + ((finding.score! - scale.min) / (scale.max - scale.min)) * 100;
    }, 0) / scored.length;
    return {
      criterionId: criterion.id,
      status: statuses.has("fail") ? "fail" as const : statuses.has("partial") ? "partial" as const : "pass" as const,
      normalizedScore,
      weightedScore: normalizedScore * criterion.weight / 100,
      findings: relevant,
    };
  });
  const reasons: LocalizedText[] = [];
  if (realityCheckerBlocked) reasons.push(reason("Reality Checker חסם את ההסמכה.", "The Reality Checker blocked certification."));
  const missing = criteria.filter((item) => item.status === "not-scored" || item.status === "disagreement");
  if (missing.length) reasons.push(reason("חסרות ראיות או קיימת מחלוקת גלויה.", "Evidence is missing or evaluator disagreement remains."));
  const blockingFailure = rubric.criteria.some((criterion) => criterion.blocking
    && criteria.find((item) => item.criterionId === criterion.id)?.status === "fail");
  if (blockingFailure) reasons.push(reason("קריטריון חוסם נכשל.", "A blocking criterion failed."));
  const lowConfidencePass = findings.some((finding) => finding.status === "pass" && finding.confidence === "low");
  if (lowConfidencePass && rubric.id === "release-readiness") reasons.push(reason("PASS בביטחון נמוך אינו מסמיך release.", "A low-confidence PASS cannot certify a release."));
  if (realityCheckerBlocked) return { status: "blocked", passingScore: rubric.passingScore, criteria, reasons };
  if (missing.length || lowConfidencePass && rubric.id === "release-readiness") {
    return { status: "needs-evidence", passingScore: rubric.passingScore, criteria, reasons };
  }
  const score = criteria.reduce((sum, item) => sum + (item.weightedScore ?? 0), 0);
  if (blockingFailure || score < rubric.passingScore) {
    return { status: "failed", score, passingScore: rubric.passingScore, criteria, reasons };
  }
  return { status: "certified", score, passingScore: rubric.passingScore, criteria, reasons };
}
