import { Link } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { EvaluationBadge } from "../components/evaluations/EvaluationBadge";
import { EvaluationSubnav } from "../components/evaluations/EvaluationSubnav";
import { createReactAccessibilitySuite, useEvaluations } from "../evaluations";
import { useLanguage } from "../i18n/LanguageContext";

export function EvaluationSuitesPage() {
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const he = language === "he";
  const createSuite = () => {
    if (!evaluations.suites.some((item) => item.id === "react-accessibility")) {
      evaluations.createSuite(createReactAccessibilitySuite(new Date().toISOString()));
    }
  };
  return (
    <div className="page evaluation-page" data-testid="evaluation-suites">
      <header className="page-heading evaluation-heading">
        <div><p className="eyebrow">{he ? "Baseline מוגן · אין החלפה שקטה" : "Protected baseline · no silent replacement"}</p><h1>{he ? "סדרות רגרסיה" : "Regression suites"}</h1><p>{he ? "הריצו מקרי הערכה חוזרים מול גרסאות baseline בלתי משתנות, עם סיווג והיסטוריה שמורה." : "Run repeatable evaluation cases against immutable baseline versions, with classification and preserved history."}</p></div>
        <button type="button" className="primary-button" onClick={createSuite}>{he ? "יצירת סדרה מבוקרת" : "Create controlled suite"}</button>
      </header>
      <DeterministicNotice language={language} />
      <EvaluationSubnav language={language} current="suites" />
      <section className="evaluation-suite-grid" aria-label={he ? "סדרות רגרסיה שמורות" : "Saved regression suites"}>
        {evaluations.suites.map((suite) => {
          const latest = suite.runHistory?.at(-1);
          return <article className="evaluation-card" key={suite.id}>
            <div className="evaluation-card-topline"><EvaluationBadge tone={suite.status === "blocked" ? "danger" : suite.status === "completed" ? "positive" : "warning"}>{suite.status === "blocked" ? (he ? "רגרסיה חוסמת" : "Blocking regression") : suite.status === "completed" ? (he ? "הושלמה" : "Completed") : (he ? "מוכנה להרצה" : "Ready to run")}</EvaluationBadge><span>{suite.missionSnapshotIds.length} {he ? "מקרים" : "cases"}</span></div>
            <h2>{suite.name}</h2>
            <p>{he ? `ה־baseline נשמר בגרסה ${suite.baselineEntityRefs[0]?.version}. ${suite.runHistory?.length ?? 0} הרצות היסטוריות נשמרו.` : `The baseline remains version ${suite.baselineEntityRefs[0]?.version}. ${suite.runHistory?.length ?? 0} historical runs are preserved.`}</p>
            {latest ? <p>{he ? "הרצה אחרונה" : "Latest run"}: {latest.status} · {latest.results.length} {he ? "תוצאות" : "results"}</p> : null}
            <Link to={`/evaluation-suites/${suite.id}`}>{he ? "פתיחת הסדרה" : "Open suite"}</Link>
          </article>;
        })}
        {evaluations.suites.length === 0 ? <article className="evaluation-empty-card"><h2>{he ? "עדיין אין סדרה שמורה" : "No saved suite yet"}</h2><p>{he ? "יצירת הסדרה מוסיפה תבנית מקומית מוכנה בלבד; התוצאות ייווצרו רק לאחר הפעלת ההרצה." : "Creating the suite adds a local ready template only; results appear only after an explicit run."}</p></article> : null}
        <article className="evaluation-empty-card"><h2>{he ? "ה־baseline נשאר בשליטתכם" : "The baseline stays under your control"}</h2><p>{he ? "הרצה חדשה אינה מחליפה baseline. החלפה דורשת גרסה חדשה ופעולה מפורשת." : "A new run never replaces the baseline. Replacement requires a new version and explicit action."}</p></article>
      </section>
    </div>
  );
}
