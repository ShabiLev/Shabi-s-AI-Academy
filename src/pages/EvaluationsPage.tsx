import { Link } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { EvaluationBadge } from "../components/evaluations/EvaluationBadge";
import { EvaluationRecoveryNotice } from "../components/evaluations/EvaluationRecoveryNotice";
import { EvaluationSubnav } from "../components/evaluations/EvaluationSubnav";
import { useLanguage } from "../i18n/LanguageContext";
import { buildTeamRecommendation, builtInFailureCases, useEvaluations } from "../evaluations";
import { evaluationStatusText, evaluationText } from "../evaluations/uiText";

export function EvaluationsPage() {
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const { experiments } = evaluations;
  const he = language === "he";
  const confidenceText = (value: string) => he ? ({ low: "נמוכה", medium: "בינונית", high: "גבוהה" }[value] ?? value) : value;
  const failureCategoryText = (value: string) => he ? ({ "requirement gap": "פער בדרישות", "hallucinated capability": "יכולת מומצאת", "test fixture masking": "הסתרה בנתוני בדיקה", "stale context": "הקשר מיושן", "scope creep": "חריגת היקף", "self-approval": "אישור עצמי", "permission violation": "הפרת הרשאה", "accessibility regression": "רגרסיית נגישות", "security failure": "כשל אבטחה", "performance regression": "רגרסיית ביצועים", "repository hygiene": "היגיינת מאגר", "deployment mismatch": "אי־התאמת פריסה" }[value] ?? value) : value;
  const recent = [...experiments].reverse();
  const completedRuns = evaluations.runs.filter((run) => run.status === "completed");
  const certifiedResults = completedRuns.flatMap((run) => run.results)
    .filter((result) => result.certification.status === "certified").length;
  const resultCount = completedRuns.reduce((count, run) => count + run.results.length, 0);
  const recommendation = buildTeamRecommendation({
    teamId: "quality-core",
    source: "Observed locally",
    comparableRunCount: completedRuns.length,
    successRate: resultCount ? Math.round((certifiedResults / resultCount) * 100) : 0,
    averageRetries: 0,
    commonFailures: evaluations.failureCases.map((item) => item.category).slice(0, 3),
    freshness: completedRuns.map((run) => run.completedAt ?? run.updatedAt).sort().at(-1) ?? (he ? "אין עדיין ראיות" : "No evidence yet"),
    limitations: [{ he: "מבוסס רק על הרצות מקומיות שמורות; אין נתוני ספק או קהילה.", en: "Based only on saved local runs; no provider or community data." }],
  });
  return (
    <div className="page evaluation-page" data-testid="evaluation-arena">
      <header className="page-heading evaluation-heading">
        <div>
          <p className="eyebrow">{he ? "Agent Lab · ראיות לפני מסקנות" : "Agent Lab · evidence before conclusions"}</p>
          <h1>{he ? "זירת ההערכה" : "Evaluation arena"}</h1>
          <p>{he ? "השוו סוכנים, פרומפטים וצוותים בתנאים קבועים, עם rubric וראיות ניתנות לבדיקה." : "Compare agents, prompts, and teams under fixed conditions, with an inspectable rubric and evidence."}</p>
        </div>
        <Link className="button primary-button" to="/evaluations/new">{he ? "הערכה חדשה" : "New evaluation"}</Link>
      </header>
      <DeterministicNotice language={language} />
      <EvaluationRecoveryNotice language={language} />
      <EvaluationSubnav language={language} current="arena" />
      <section className="evaluation-metrics" aria-label={he ? "סיכום מעבדת ההערכה" : "Evaluation lab summary"}>
        <article><strong>{experiments.length}</strong><span>{he ? "ניסויים שמורים" : "Saved experiments"}</span></article>
        <article><strong>{experiments.reduce((sum, item) => sum + item.competitorIds.length, 0)}</strong><span>{he ? "בחירות מתחרים" : "Competitor selections"}</span></article>
        <article><strong>{experiments.filter((item) => item.status === "completed").length}</strong><span>{he ? "ניסויים שהושלמו" : "Completed experiments"}</span></article>
        <article><strong>{experiments.filter((item) => item.status === "needs-evidence").length}</strong><span>{he ? "ניסויים המחכים לראיות" : "Experiments awaiting evidence"}</span></article>
      </section>
      <section className="evaluation-card-grid" aria-labelledby="experiments-heading">
        <h2 id="experiments-heading" className="evaluation-grid-title">{he ? "ניסויים אחרונים" : "Recent experiments"}</h2>
        {recent.map((experiment) => <article className="evaluation-card" key={experiment.id}>
          <div className="evaluation-card-topline">
            <EvaluationBadge tone={experiment.status === "completed" ? "positive" : experiment.status === "blocked" ? "danger" : "warning"}>{evaluationText(language, evaluationStatusText[experiment.status])}</EvaluationBadge>
            <span>{new Intl.DateTimeFormat(language === "he" ? "he-IL" : "en-US", { dateStyle: "medium" }).format(new Date(experiment.updatedAt))}</span>
          </div>
          <h3>{experiment.name}</h3>
          <p>{he ? "הניסוי משתמש ב־Mission snapshot קפוא ובגרסאות מתחרים מדויקות." : "This experiment uses a frozen Mission snapshot and exact competitor versions."}</p>
          <dl>
            <div><dt>{he ? "מתחרים" : "Competitors"}</dt><dd>{experiment.competitorIds.length}</dd></div>
            <div><dt>{he ? "מעריכים" : "Evaluators"}</dt><dd>{experiment.evaluatorIds.length}</dd></div>
            <div><dt>{he ? "חזרות" : "Repetitions"}</dt><dd>{experiment.repetitionCount}</dd></div>
          </dl>
          <Link to={`/evaluations/${experiment.id}`}>{he ? "פתיחת סביבת ההרצה" : "Open workspace"}</Link>
        </article>)}
        {recent.length === 0 ? <article className="evaluation-empty-card"><h3>{he ? "עדיין אין ניסויים שמורים" : "No saved experiments yet"}</h3><p>{he ? "התחילו בניסוי מקומי תחום. לא יוצגו תוצאות עד ליצירת ראיות." : "Start a bounded local experiment. No results appear until evidence is created."}</p></article> : null}
        <article className="evaluation-empty-card">
          <h3>{he ? "השוואה חדשה, ללא ציונים מוסתרים" : "A new comparison, without hidden scoring"}</h3>
          <p>{he ? "הגדירו 2–5 מתחרים, גרסאות מדויקות, rubric, מעריכים ו־seed לפני ההרצה." : "Define 2–5 competitors, exact versions, a rubric, evaluators, and a seed before running."}</p>
          <Link to="/evaluations/new">{he ? "הגדרת ניסוי" : "Set up experiment"}</Link>
        </article>
      </section>
      <div className="evaluation-results-grid">
        <section className="evaluation-panel" aria-labelledby="team-recommendation-heading">
          <h2 id="team-recommendation-heading">{he ? "המלצת צוות מבוססת ראיות" : "Evidence-based team recommendation"}</h2>
          <p><strong>Quality Core</strong> · {he ? "נצפה מקומית" : recommendation.source}</p>
          <dl className="evaluation-preview-details">
            <div><dt>{he ? "הרצות דומות" : "Comparable runs"}</dt><dd>{recommendation.comparableRunCount}</dd></div>
            <div><dt>{he ? "שיעור הצלחה" : "Success rate"}</dt><dd>{recommendation.successRate}%</dd></div>
            <div><dt>{he ? "ניסיונות חוזרים ממוצעים" : "Average retries"}</dt><dd>{recommendation.averageRetries}</dd></div>
            <div><dt>{he ? "רמת ביטחון" : "Confidence"}</dt><dd>{confidenceText(recommendation.confidence)}</dd></div>
            <div><dt>{he ? "עדכניות" : "Freshness"}</dt><dd>{recommendation.freshness}</dd></div>
            <div><dt>{he ? "כשלים נפוצים" : "Common failures"}</dt><dd>{recommendation.commonFailures.map((failure) => he ? ({ "requirement gap": "פער בדרישות", "hallucinated capability": "יכולת מדומה", "test fixture masking": "בדיקת fixture שהסתירה כשל", "stale context": "הקשר מיושן", "scope creep": "חריגת היקף", "self-approval": "אישור עצמי", "permission violation": "הפרת הרשאות", "accessibility regression": "רגרסיית נגישות", "security failure": "כשל אבטחה", "performance regression": "רגרסיית ביצועים", "repository hygiene": "היגיינת מאגר", "deployment mismatch": "אי־התאמת פריסה" }[failure] ?? "קטגוריית כשל") : failure).join(", ") || (he ? "אין עדיין" : "None yet")}</dd></div>
          </dl>
          {recommendation.limitations.map((item) => <p className="evaluation-chart-alt" key={item.en}>{item[language]}</p>)}
        </section>
        <section className="evaluation-panel" aria-labelledby="failure-library-heading">
          <h2 id="failure-library-heading">{he ? "ספריית מקרי כשל" : "Failure Case Library"}</h2>
          {[...builtInFailureCases, ...evaluations.failureCases].map((failure) => {
            const run = evaluations.runs.find((item) => failure.sourceRunIds.includes(item.id));
            const experiment = experiments.find((item) => item.id === run?.experimentId);
            return <article className="evaluation-finding" key={failure.id}>
              <div><strong>{failure.title[language]}</strong><EvaluationBadge tone={failure.sourceRunIds.length ? "warning" : "neutral"}>{failure.sourceRunIds.length ? (he ? "מקומי" : "Local") : (he ? "דוגמה בדוקה" : "Reviewed example")}</EvaluationBadge></div>
              <p>{failure.reusableRule[language]}</p>
              <small>{failureCategoryText(failure.category)} · {failure.evidenceIds.length} {he ? "ראיות" : "evidence items"}</small>
              {experiment ? <p><Link to={`/evaluations/${experiment.id}/results`}>{he ? "פתיחת הרצת המקור" : "Open source run"}</Link> · <Link to="/team">{he ? "פתיחת מפת המיומנויות" : "Open Skill Map"}</Link></p> : null}
            </article>;
          })}
        </section>
      </div>
    </div>
  );
}
