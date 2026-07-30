import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ConnectorPreview } from "../components/evaluations/ConnectorPreview";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { EvaluationBadge } from "../components/evaluations/EvaluationBadge";
import { EvaluationSubnav } from "../components/evaluations/EvaluationSubnav";
import {
  exportCodexAgent,
  readOnlyEvaluators,
  type CodexExportResult,
  type EvaluationCompetitorResult,
  useEvaluations,
} from "../evaluations";
import { useLanguage } from "../i18n/LanguageContext";
import { useMissions } from "../missions";

function averageScore(results: readonly EvaluationCompetitorResult[]): number | undefined {
  const scores = results.flatMap((result) => result.certification.score ?? []);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : undefined;
}

function downloadText(filename: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EvaluationResultsPage() {
  const { evaluationId = "" } = useParams();
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const missions = useMissions();
  const he = language === "he";
  const [exportResult, setExportResult] = useState<CodexExportResult>();
  const [failureMessage, setFailureMessage] = useState("");
  const experiment = evaluations.experiments.find((item) => item.id === evaluationId);
  const run = [...evaluations.runs].reverse().find((item) => item.experimentId === evaluationId && item.status === "completed");
  const rubric = evaluations.snapshot.rubrics.find((item) => item.id === experiment?.rubricId);
  const grouped = useMemo(() => {
    const groups = new Map<string, EvaluationCompetitorResult[]>();
    for (const result of run?.results ?? []) {
      groups.set(result.competitorId, [...(groups.get(result.competitorId) ?? []), result]);
    }
    return [...groups.entries()];
  }, [run]);
  const evaluatorName = (id: string) => readOnlyEvaluators.find((item) => item.id === id)?.name[language] ?? (he ? "מעריך עצמאי" : "Independent evaluator");

  if (!experiment || !run || !rubric || grouped.length === 0) {
    return (
      <div className="page evaluation-page" data-testid="evaluation-results">
        <header className="page-heading">
          <div>
            <p className="eyebrow">{he ? "תוצאות מבוססות ראיות בלבד" : "Evidence-backed results only"}</p>
            <h1>{he ? "עדיין אין תוצאה שמורה" : "No saved result yet"}</h1>
            <p>{he ? "יש להתחיל ולהשלים הערכת Academy דטרמיניסטית. לא יוצגו ציונים לדוגמה או תוצאות ספק מדומות." : "Start and complete an Academy deterministic evaluation. No sample scores or fabricated provider results are shown."}</p>
          </div>
        </header>
        <DeterministicNotice language={language} />
        {experiment ? <Link className="primary-button" to={`/evaluations/${experiment.id}`}>{he ? "חזרה לסביבת ההרצה" : "Return to run workspace"}</Link> : <Link className="primary-button" to="/evaluations">{he ? "פתיחת זירת ההערכות" : "Open Evaluation Arena"}</Link>}
      </div>
    );
  }

  const leader = [...grouped].sort((a, b) => (averageScore(b[1]) ?? -1) - (averageScore(a[1]) ?? -1))[0];
  const allCertified = run.results.every((result) => result.certification.status === "certified");
  const savedPreview = [...evaluations.snapshot.previews].reverse().find((item) => item.targetSummary === `Evaluation ${evaluationId}`);
  const createFailure = () => {
    const finding = run.results.flatMap((result) => result.findings).find((item) => item.status !== "pass");
    if (!finding) {
      setFailureMessage(he ? "לא נמצא ממצא כשל שניתן להפוך למקרה למידה." : "No failing finding is available for a learning case.");
      return;
    }
    const now = new Date().toISOString();
    const failure = evaluations.createFailureCase({
      schemaVersion: 1,
      id: `failure-${crypto.randomUUID()}`,
      title: { he: "ממצא הערכה לשימוש חוזר", en: "Reusable evaluation finding" },
      category: "requirement gap",
      symptom: finding.summary,
      rootCause: { he: "הקריטריון לא עמד בסף ההערכה הדטרמיניסטית.", en: "The criterion did not meet the deterministic evaluation threshold." },
      missedSignal: { he: "הראיות היו זמינות רק לאחר הערכה עצמאית.", en: "The evidence became visible during independent evaluation." },
      correctiveAction: finding.remediation[0] ?? { he: "שיפור והרצה חדשה.", en: "Improve and create a new run." },
      reusableRule: { he: "אין לאשר ללא ראיה לכל קריטריון נדרש.", en: "Do not certify without evidence for every required criterion." },
      evidenceIds: finding.evidenceIds,
      sourceRunIds: [run.id],
      createdAt: now,
      updatedAt: now,
    });
    const evidenceSaved = missions.addEvaluationSkillEvidence({
      id: `skill-${crypto.randomUUID()}`,
      skillId: "qa",
      source: "evaluation",
      sourceId: run.id,
      completedAt: now,
      outcome: "practice",
      evaluatorId: finding.evaluatorId,
      confidence: finding.confidence,
      evidenceIds: failure.evidenceIds,
    });
    setFailureMessage(evidenceSaved
      ? (he ? "מקרה הכשל נשמר מקומית ונוספה ראיית תרגול ניתנת להסרה למפת המיומנויות; לא הוענקה שליטה." : "The failure case was saved locally and removable practice evidence was added to the Skill Map; no mastery was granted.")
      : (he ? "מקרה הכשל נשמר, אך ראיית התרגול לא עברה אימות ולא שינתה את מפת המיומנויות." : "The failure case was saved, but the practice evidence did not validate and did not change the Skill Map."));
  };
  const savePreview = () => {
    const createdAt = new Date().toISOString();
    evaluations.createPreview({
      id: `preview-${crypto.randomUUID()}`,
      connectorType: "github",
      actionType: "create-draft-pull-request",
      targetSummary: `Evaluation ${evaluationId}`,
      payloadSummary: { he: "טיוטת Pull Request המסכמת את תוצאות ההערכה.", en: "A draft pull request summarizing the evaluation results." },
      requiredPermissions: ["repository:read", "pull-request:write"],
      riskLevel: "medium",
      reversible: true,
      recoveryPlan: { he: "מחיקת הטיוטה לאחר אישור מפורש.", en: "Delete the draft after explicit approval." },
      connectorAvailable: false,
      createdAt,
      expiresAt: new Date(Date.parse(createdAt) + 60 * 60 * 1000).toISOString(),
    });
  };
  const generateExport = () => setExportResult(exportCodexAgent({
    name: "academy_reviewer",
    description: "Evidence-first Academy reviewer",
    developerInstructions: "Review evidence and report missing proof. Never self-approve.",
    permissions: ["read", "unsupported-install"],
    provenance: `Academy local evaluation ${experiment.name}`,
  }));

  return (
    <div className="page evaluation-page" data-testid="evaluation-results">
      <header className="page-heading evaluation-heading">
        <div>
          <p className="eyebrow">{he ? "תוצאות מוסברות · גרסאות מדויקות" : "Explainable results · exact versions"}</p>
          <h1>{experiment.name}</h1>
          <p>{he ? `${run.results.length} תוצאות שמורות על בסיס ${experiment.repetitionCount} חזרות לכל מתחרה.` : `${run.results.length} immutable results across ${experiment.repetitionCount} repetitions per competitor.`}</p>
        </div>
        <EvaluationBadge tone={allCertified ? "positive" : "warning"}>{allCertified ? (he ? "מאושר לפי ה־rubric" : "Rubric certified") : (he ? "לא מאושר · נדרשת בדיקה" : "Uncertified · review required")}</EvaluationBadge>
      </header>
      <DeterministicNotice language={language} />
      <EvaluationSubnav language={language} evaluationPath={`/evaluations/${evaluationId}`} current="results" />

      <section className="evaluation-result-summary" aria-labelledby="result-summary-heading">
        <div>
          <p className="eyebrow">{he ? "מוביל בתנאים שנבדקו" : "Leader under tested conditions"}</p>
          <h2 id="result-summary-heading">{he ? "מתחרה " : "Competitor "}{experiment.competitorIds.indexOf(leader[0]) + 1}</h2>
          <p>{averageScore(leader[1]) ?? (he ? "לא ניתן לניקוד" : "Not scored")} / 100. {he ? "זה אינו ציון AI גלובלי." : "This is not a global AI score."}</p>
        </div>
        <dl>
          <div><dt>{he ? "גודל מדגם" : "Sample size"}</dt><dd>{experiment.competitorIds.length} × {experiment.repetitionCount}</dd></div>
          <div><dt>{he ? "ראיות" : "Evidence"}</dt><dd>{run.evidenceIds.length}</dd></div>
          <div><dt>{he ? "גרסאות מתחרים קפואות" : "Frozen competitor versions"}</dt><dd>{run.results.filter((result, index, items) => items.findIndex((item) => item.competitorId === result.competitorId) === index).map((result) => `${result.competitorId} v${result.competitorRef.version}`).join(", ")}</dd></div>
          <div><dt>Checksum</dt><dd><code>{leader[1][0].resultChecksum}</code></dd></div>
        </dl>
      </section>

      <section className="evaluation-panel evaluation-comparison" aria-labelledby="comparison-heading">
        <div className="evaluation-section-heading"><h2 id="comparison-heading">{he ? "תוצאות לפי קריטריון ומתחרה" : "Results by criterion and competitor"}</h2><EvaluationBadge tone="positive">{rubric.criteria.length} {he ? "קריטריונים" : "criteria"}</EvaluationBadge></div>
        <div className="evaluation-table-wrap" tabIndex={0}>
          <table>
            <caption className="sr-only">{he ? "השוואת ציונים, ראיות וביטחון לפי קריטריון ומתחרה" : "Comparison of scores, evidence, and confidence by criterion and competitor"}</caption>
            <thead><tr><th scope="col">{he ? "מתחרה" : "Competitor"}</th><th scope="col">{he ? "קריטריון" : "Criterion"}</th><th scope="col">{he ? "סטטוס" : "Status"}</th><th scope="col">{he ? "ציון" : "Score"}</th><th scope="col">{he ? "מעריך" : "Evaluator"}</th><th scope="col">{he ? "ראיות וביטחון" : "Evidence and confidence"}</th></tr></thead>
            <tbody>{grouped.flatMap(([competitorId, results]) => {
              const first = results[0];
              return first.findings.map((finding) => {
                const criterion = rubric.criteria.find((item) => item.id === finding.criterionId);
                return <tr key={`${competitorId}-${finding.criterionId}`}><th scope="row">{he ? "מתחרה " : "Competitor "}{experiment.competitorIds.indexOf(competitorId) + 1}</th><td>{criterion?.name[language] ?? (he ? "קריטריון" : "Criterion")}</td><td>{finding.status.toUpperCase()}</td><td>{finding.score ?? (he ? "לא ניתן לניקוד" : "Not scored")}</td><td>{evaluatorName(finding.evaluatorId)}</td><td>{finding.evidenceIds.length} · {finding.confidence}</td></tr>;
              });
            })}</tbody>
          </table>
        </div>
        <p className="evaluation-chart-alt"><strong>{he ? "חלופת טקסט לתרשים:" : "Chart text alternative:"}</strong> {he ? `המוביל קיבל ממוצע ${averageScore(leader[1]) ?? "ללא ציון"}; המדגם כולל ${experiment.repetitionCount} חזרות דטרמיניסטיות לכל מתחרה.` : `The leader averaged ${averageScore(leader[1]) ?? "not scored"}; the sample contains ${experiment.repetitionCount} deterministic repetitions per competitor.`}</p>
      </section>

      <div className="evaluation-results-grid">
        <section className="evaluation-panel" aria-labelledby="findings-heading">
          <h2 id="findings-heading">{he ? "ממצאי מעריכים" : "Evaluator findings"}</h2>
          {run.results[0].findings.map((finding) => <article className="evaluation-finding" key={finding.criterionId}><div><strong>{evaluatorName(finding.evaluatorId)}</strong><EvaluationBadge tone={finding.status === "pass" ? "positive" : "warning"}>{finding.status.toUpperCase()}</EvaluationBadge></div><p>{finding.summary[language]}</p><small>{finding.confidence} · {finding.evidenceIds.length} {he ? "הפניות לראיות" : "evidence references"}{finding.missingEvidence.length ? ` · ${he ? "חסר" : "missing"}: ${finding.missingEvidence.map((item) => item[language]).join(", ")}` : ""}</small></article>)}
          <button type="button" onClick={createFailure}>{he ? "יצירת מקרה כשל" : "Create failure case"}</button>
          {failureMessage ? <p role="status">{failureMessage}</p> : null}
        </section>
        <ConnectorPreview language={language} preview={savedPreview} onSave={savePreview} />
      </div>

      <section className="evaluation-panel evaluation-export-panel" aria-labelledby="codex-export-heading">
        <div><h2 id="codex-export-heading">{he ? "ייצוא Agent מאומת ל־Codex" : "Validated Codex Agent export"}</h2><p>{he ? "הקובץ נבדק ב־round-trip ומורד מקומית בלבד; הוא אינו מותקן בדפדפן." : "The file is round-trip validated and downloaded locally only; this does not install an Agent."}</p></div>
        <div className="evaluation-run-actions">
          <button type="button" onClick={generateExport}>{he ? "יצירת ייצוא Codex" : "Generate Codex export"}</button>
          {exportResult ? <button type="button" onClick={() => downloadText("academy-reviewer.toml", exportResult.toml, "application/toml")}>{he ? "הורדת TOML" : "Download TOML"}</button> : null}
        </div>
        {exportResult ? <div><p>Checksum: <code>{exportResult.checksum}</code></p><p>{he ? "שדות שהושמטו" : "Omitted fields"}: {exportResult.omittedFields.join(", ") || (he ? "אין" : "None")}</p><pre tabIndex={0}>{exportResult.toml}</pre></div> : null}
      </section>
    </div>
  );
}
