import { Link, useParams } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { EvaluationSubnav } from "../components/evaluations/EvaluationSubnav";
import { EvaluationRecoveryNotice } from "../components/evaluations/EvaluationRecoveryNotice";
import { TraceTimeline } from "../components/evaluations/TraceTimeline";
import { exportTraceJson, exportTraceMarkdown, useEvaluations } from "../evaluations";
import { useLanguage } from "../i18n/LanguageContext";

function downloadText(filename: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EvaluationTracePage() {
  const { evaluationId = "" } = useParams();
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const he = language === "he";
  const experiment = evaluations.experiments.find((item) => item.id === evaluationId);
  const run = [...evaluations.runs].reverse().find((item) => item.experimentId === evaluationId);
  const events = run ? evaluations.snapshot.traces.filter((event) => event.runId === run.id) : [];

  if (!experiment || !run || events.length === 0) {
    return <div className="page evaluation-page" data-testid="evaluation-trace"><header className="page-heading"><div><p className="eyebrow">{he ? "עקבות בטוחים בלבד" : "Safe trace only"}</p><h1>{he ? "עדיין אין אירועי trace" : "No trace events yet"}</h1><p>{he ? "אירועים נוצרים רק מתוך הרצת הערכת Academy אמיתית שנשמרה. לא מוצגת דוגמת log." : "Events appear only after a saved Academy evaluation run. No sample log is displayed."}</p></div></header><DeterministicNotice language={language} />{experiment ? <Link className="primary-button" to={`/evaluations/${experiment.id}`}>{he ? "חזרה להרצה" : "Return to run"}</Link> : <Link className="primary-button" to="/evaluations">{he ? "פתיחת זירת ההערכות" : "Open Evaluation Arena"}</Link>}</div>;
  }

  return (
    <div className="page evaluation-page" data-testid="evaluation-trace">
      <header className="page-heading">
        <div><p className="eyebrow">{he ? "עקבות בטוחים וראיות ניתנות לבדיקה" : "Safe trace and inspectable evidence"}</p><h1>{experiment.name}</h1><p>{he ? "העקבות מציגים פעולות, gates, הרשאות והפניות—לא מחשבות פרטיות, נתיבים מקומיים או תוכן Mission גולמי." : "The trace shows actions, gates, permissions, and references—not private reasoning, local paths, or raw Mission content."}</p></div>
      </header>
      <DeterministicNotice language={language} />
      <EvaluationRecoveryNotice language={language} />
      <EvaluationSubnav language={language} evaluationPath={`/evaluations/${evaluationId}`} current="trace" />
      <TraceTimeline language={language} events={events} results={run.results} evidence={evaluations.snapshot.evidence.filter((item) => run.evidenceIds.includes(item.id))} evaluationId={evaluationId} />
      <section className="evaluation-panel evaluation-export-panel" aria-labelledby="trace-export-heading">
        <div><h2 id="trace-export-heading">{he ? "ייצוא trace מסונן" : "Export sanitized trace"}</h2><p>{he ? "הייצוא משמיט סודות, נתיבים מקומיים, מסמכים פרטיים ותוכן Mission גולמי." : "Export omits secrets, local paths, private documents, and raw Mission content."}</p></div>
        <div className="evaluation-run-actions">
          <button type="button" onClick={() => downloadText("evaluation-trace.json", exportTraceJson(events), "application/json")}>{he ? "הורדת JSON" : "Download JSON"}</button>
          <button type="button" onClick={() => downloadText("evaluation-trace.md", exportTraceMarkdown(events, language), "text/markdown")}>{he ? "הורדת Markdown" : "Download Markdown"}</button>
          <button type="button" onClick={() => window.print()}>{he ? "תצוגה להדפסה" : "Print view"}</button>
        </div>
      </section>
    </div>
  );
}
