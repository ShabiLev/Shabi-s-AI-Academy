import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { EvaluationBadge } from "../components/evaluations/EvaluationBadge";
import { EvaluationSubnav } from "../components/evaluations/EvaluationSubnav";
import { EvaluationRecoveryNotice } from "../components/evaluations/EvaluationRecoveryNotice";
import { RubricSummary } from "../components/evaluations/RubricSummary";
import { useLanguage } from "../i18n/LanguageContext";
import { useEvaluations } from "../evaluations";
import { evaluationStatusText, evaluationText } from "../evaluations/uiText";

export function EvaluationWorkspacePage() {
  const { evaluationId = "sample-evaluation" } = useParams();
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const navigate = useNavigate();
  const he = language === "he";
  const [message, setMessage] = useState("");
  const experiment = evaluations.experiments.find((item) => item.id === evaluationId);
  const run = [...evaluations.runs].reverse().find((item) => item.experimentId === evaluationId);
  if (!experiment) return <div className="page evaluation-page"><section className="evaluation-empty-card"><h1>{he ? "הניסוי לא נמצא" : "Experiment not found"}</h1><p>{he ? "ייתכן שהניסוי שייך לפרופיל מקומי אחר או הוסר." : "The experiment may belong to another local profile or was removed."}</p></section></div>;
  const status = run?.status ?? experiment.status;
  const requiresRevalidation = Boolean(run?.results.some((result) => result.certification.status === "needs-evidence"));
  const totalUnits = experiment.competitorIds.length * experiment.repetitionCount * Math.max(1, experiment.evaluatorIds.length);
  const completedUnits = run ? (run.progress.competitorIndex * experiment.repetitionCount * experiment.evaluatorIds.length) + (run.progress.repetitionIndex * experiment.evaluatorIds.length) + run.progress.evaluatorIndex : 0;
  const progress = status === "completed" ? 100 : run ? Math.min(99, Math.round((completedUnits / Math.max(1, totalUnits)) * 100)) : 0;
  const act = () => {
    try {
      if (status === "draft" || status === "ready") evaluations.start(experiment.id);
      else if (status === "running") evaluations.pause(experiment.id);
      else if (status === "paused" || status === "needs-evidence") evaluations.continue(experiment.id);
      setMessage(he ? "המעבר נשמר במאגר המקומי." : "The transition was saved in the local repository.");
    } catch {
      setMessage(he ? "המעבר נחסם כדי לשמור על שלמות הגרסאות והראיות." : "The transition was blocked to protect version and evidence integrity.");
    }
  };
  const complete = () => {
    try {
      evaluations.complete(experiment.id);
      setMessage(he ? "ההערכה הדטרמיניסטית הושלמה והתוצאות נשמרו ללא שינוי הגרסאות." : "The deterministic evaluation completed and the immutable results were saved.");
    } catch {
      setMessage(he ? "לא ניתן להשלים את ההרצה במצבה הנוכחי." : "The run cannot be completed in its current state.");
    }
  };
  const cancel = () => {
    try {
      evaluations.cancel(experiment.id);
      setMessage(he ? "ההרצה בוטלה ללא יצירת ציונים חלקיים." : "The run was cancelled without fabricating partial scores.");
    } catch {
      setMessage(he ? "לא ניתן לבטל הרצה סופית." : "A terminal run cannot be cancelled.");
    }
  };
  const action = status === "draft" || status === "ready" ? (he ? "התחלת הרצה" : "Start run") : status === "running" ? (he ? "השהיה בטוחה" : "Safe pause") : status === "paused" ? (he ? "המשך מאותה נקודה" : "Continue exact progress") : (he ? "המשך לאחר הוספת ראיה" : "Continue after evidence");
  return (
    <div className="page evaluation-page" data-testid="evaluation-workspace">
      <header className="page-heading evaluation-heading">
        <div><p className="eyebrow">{he ? "ניסוי שמור · גרסאות קפואות" : "Saved experiment · frozen versions"}</p><h1>{experiment.name}</h1><p>{he ? "כל המתחרים מקבלים קלט, seed, rubric ומגבלות זהים." : "Every competitor receives identical input, seed, rubric, and constraints."}</p></div>
        <EvaluationBadge tone={status === "running" ? "positive" : status === "blocked" ? "danger" : "warning"}>{evaluationText(language, evaluationStatusText[status])}</EvaluationBadge>
      </header>
      <DeterministicNotice language={language} />
      <EvaluationRecoveryNotice language={language} />
      <EvaluationSubnav language={language} evaluationPath={`/evaluations/${evaluationId}`} current="workspace" />
      {message ? <div className="evaluation-alert" role="status">{message}</div> : null}
      <div className="evaluation-control-room">
        <aside className="evaluation-panel evaluation-setup-rail">
          <h2>{he ? "חוזה הניסוי" : "Experiment contract"}</h2>
          <dl>
            <div><dt>{he ? "Snapshot" : "Snapshot"}</dt><dd>{he ? "משימת React נגישה" : "Accessible React mission"}</dd></div>
            <div><dt>Seed</dt><dd><code>{experiment.seed}</code></dd></div>
            <div><dt>{he ? "חזרות" : "Repetitions"}</dt><dd>{experiment.repetitionCount}</dd></div>
            <div><dt>{he ? "מדיניות שינוי" : "Mutation policy"}</dt><dd>{he ? "קלט קפוא" : "Frozen input"}</dd></div>
          </dl>
          <h3>{he ? "מתחרים" : "Competitors"}</h3>
          <ol className="evaluation-competitor-list">{experiment.competitorIds.map((competitorId, index) => <li key={competitorId}>{he ? `מתחרה ${index + 1} · גרסה קפואה` : `Competitor ${index + 1} · frozen version`}</li>)}</ol>
        </aside>
        <section className="evaluation-panel evaluation-run-panel">
          <p className="eyebrow">{he ? "התקדמות נוכחית" : "Current progress"}</p>
          <h2>{progress === 0 ? (he ? "הניסוי מוכן לאימות" : "Experiment ready to validate") : progress < 50 ? (he ? "הרצת המתחרה הראשון" : "Running first competitor") : (he ? "הרצת המתחרה השני" : "Running second competitor")}</h2>
          <div className="evaluation-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label={he ? "התקדמות ניסוי" : "Experiment progress"}><span style={{ inlineSize: `${progress}%` }} /></div>
          <p aria-live="polite">{he ? `${progress}% הושלמו. ההתקדמות המדויקת נשמרת מקומית.` : `${progress}% complete. Exact progress is persisted locally.`}</p>
          <ol className="evaluation-run-steps">
            <li data-state={progress >= 0 ? "current" : "pending"}>{he ? "אימות הגדרה" : "Validate setup"}</li>
            <li data-state={progress >= 25 ? "current" : "pending"}>{he ? "הקפאת snapshots" : "Freeze snapshots"}</li>
            <li data-state={progress >= 50 ? "current" : "pending"}>{he ? "הרצת מתחרים" : "Run competitors"}</li>
            <li data-state="pending">{he ? "הערכה עצמאית" : "Independent evaluation"}</li>
            <li data-state="pending">{he ? "אישור או דרישת ראיות" : "Certify or request evidence"}</li>
          </ol>
          <div className="evaluation-run-actions">
            {requiresRevalidation ? <button type="button" className="primary-button" onClick={() => { const created = evaluations.createRevalidation(experiment.id); navigate(`/evaluations/${created.id}`); }}>{he ? "יצירת הרצת אימות מקומית חדשה" : "Create a new local revalidation run"}</button> : ["draft", "ready", "running", "paused", "needs-evidence"].includes(status) ? <button type="button" className="primary-button" onClick={act}>{action}</button> : <span>{he ? "אין פעולת מעבר זמינה במצב זה." : "No transition action is available in this state."}</span>}
            {status === "running" ? <button type="button" onClick={complete}>{he ? "השלמת הערכה דטרמיניסטית" : "Complete deterministic evaluation"}</button> : null}
            {run && !["completed", "cancelled"].includes(status) ? <button type="button" onClick={cancel}>{he ? "ביטול ללא ציון" : "Cancel without score"}</button> : null}
          </div>
        </section>
        <aside><RubricSummary language={language} /></aside>
      </div>
    </div>
  );
}
