import { useState } from "react";
import { useParams } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { EvaluationBadge } from "../components/evaluations/EvaluationBadge";
import { EvaluationSubnav } from "../components/evaluations/EvaluationSubnav";
import {
  createReactAccessibilitySuite,
  reactAccessibilityCases,
  useEvaluations,
} from "../evaluations";
import { useLanguage } from "../i18n/LanguageContext";

const caseNames: Record<string, { he: string; en: string }> = {
  "keyboard-operation": { he: "תפעול מקלדת", en: "Keyboard operation" },
  "accessible-names": { he: "שמות נגישים", en: "Accessible names" },
  "mobile-webkit": { he: "Mobile WebKit", en: "Mobile WebKit" },
  "focus-after-dialog": { he: "מוקד לאחר dialog", en: "Focus after dialog" },
};

export function EvaluationSuitePage() {
  const { suiteId = "" } = useParams();
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const he = language === "he";
  const classificationText = (value: string) => he ? ({ improvement: "שיפור", regression: "רגרסיה", "no-change": "ללא שינוי", "not-scored": "לא ניתן לניקוד" }[value] ?? value) : value;
  const [message, setMessage] = useState("");
  const suite = evaluations.suites.find((item) => item.id === suiteId);
  const latest = suite?.runHistory?.at(-1);
  const ensureSuite = () => {
    if (suiteId !== "react-accessibility") return;
    evaluations.createSuite(createReactAccessibilitySuite(new Date().toISOString()));
    setMessage(he ? "הסדרה נוצרה מקומית ומוכנה להרצה; עדיין אין תוצאות." : "The suite was created locally and is ready to run; no results exist yet.");
  };
  const runSuite = () => {
    if (!suite) return;
    evaluations.runSuite(suite.id, reactAccessibilityCases);
    setMessage(he ? "כל מקרי הסדרה הורצו וההרצה נשמרה בלי להחליף את ה־baseline." : "Every suite case ran and the run was preserved without replacing the baseline.");
  };
  const createFailure = () => {
    if (!suite || !latest) return;
    const regression = latest.results.find((item) => item.classification === "regression");
    if (!regression) return;
    const now = new Date().toISOString();
    evaluations.createFailureCase({
      schemaVersion: 1,
      id: `failure-${crypto.randomUUID()}`,
      title: { he: "רגרסיית מוקד לאחר dialog", en: "Focus regression after dialog" },
      category: "accessibility regression",
      symptom: { he: "המוקד לא חזר למפעיל לאחר סגירת dialog.", en: "Focus did not return to the trigger after the dialog closed." },
      rootCause: { he: "גרסת המועמד ירדה מתחת ל־baseline בקריטריון קריטי.", en: "The candidate fell below the baseline on a critical criterion." },
      missedSignal: { he: "הבדיקה החוזרת חשפה פער שלא היה נראה בתוצאה מצטברת.", en: "The repeated case exposed a gap hidden by aggregate status." },
      correctiveAction: { he: "לתקן החזרת מוקד וליצור הרצת סדרה חדשה.", en: "Restore focus return and create a new suite run." },
      reusableRule: { he: "רגרסיית נגישות קריטית חוסמת פרסום.", en: "A critical accessibility regression blocks publication." },
      evidenceIds: regression.evidenceIds,
      sourceRunIds: [latest.id],
      createdAt: now,
      updatedAt: now,
    });
    setMessage(he ? "מקרה הכשל נשמר מקומית כתרגול; לא פורסם תוכן Mission פרטי." : "The failure case was saved locally as practice; no private Mission content was published.");
  };

  if (!suite) {
    return <div className="page evaluation-page" data-testid="evaluation-suite"><header className="page-heading"><div><p className="eyebrow">{he ? "סדרת רגרסיה מקומית" : "Local regression suite"}</p><h1>{he ? "הסדרה עדיין לא נוצרה" : "Suite not created yet"}</h1><p>{he ? "התבנית אינה כוללת תוצאות. צרו אותה במפורש לפני ההרצה." : "The template contains no results. Create it explicitly before running."}</p></div></header><DeterministicNotice language={language} />{suiteId === "react-accessibility" ? <button type="button" className="primary-button" onClick={ensureSuite}>{he ? "יצירת סדרת נגישות" : "Create accessibility suite"}</button> : null}{message ? <p role="status">{message}</p> : null}</div>;
  }

  return (
    <div className="page evaluation-page" data-testid="evaluation-suite">
      <header className="page-heading evaluation-heading">
        <div><p className="eyebrow">{he ? "סדרה: נגישות React" : "Suite: React accessibility"}</p><h1>{he ? `השוואה ל־baseline גרסה ${suite.baselineEntityRefs[0]?.version}` : `Comparison with baseline version ${suite.baselineEntityRefs[0]?.version}`}</h1><p>{latest ? (latest.status === "blocked" ? (he ? "הפרסום חסום; ה־baseline לא השתנה וההרצה נשמרה בהיסטוריה." : "Publication is blocked; the baseline was not changed and the run remains in history.") : (he ? "הסדרה הושלמה מול baseline בלתי משתנה." : "The suite completed against an immutable baseline.")) : (he ? "הסדרה מוכנה; עדיין אין תוצאות." : "The suite is ready; no results exist yet.")}</p></div>
        <EvaluationBadge tone={latest?.status === "blocked" ? "danger" : latest ? "positive" : "warning"}>{latest?.status === "blocked" ? (he ? "פרסום חסום" : "Publication blocked") : latest ? (he ? "הושלמה" : "Completed") : (he ? "מוכנה" : "Ready")}</EvaluationBadge>
      </header>
      <DeterministicNotice language={language} />
      <EvaluationSubnav language={language} current="suites" />
      <div className="evaluation-run-actions"><button type="button" className="primary-button" onClick={runSuite}>{he ? "הרצת כל מקרי הסדרה" : "Run all suite cases"}</button><span>{he ? `${suite.runHistory?.length ?? 0} הרצות שמורות` : `${suite.runHistory?.length ?? 0} preserved runs`}</span></div>
      {message ? <p role="status">{message}</p> : null}
      {latest ? <section className="evaluation-panel" aria-labelledby="suite-cases-heading">
        <div className="evaluation-section-heading"><h2 id="suite-cases-heading">{he ? "תוצאות לפי מקרה" : "Per-case results"}</h2><span>{latest.results.length} {he ? "מקרים" : "cases"}</span></div>
        <div className="evaluation-table-wrap" tabIndex={0}>
          <table>
            <caption className="sr-only">{he ? "השוואת baseline ומועמד לפי מקרה וראיות" : "Comparison of baseline and candidate by case and evidence"}</caption>
            <thead><tr><th scope="col">{he ? "מקרה" : "Case"}</th><th scope="col">Baseline</th><th scope="col">{he ? "מועמד" : "Candidate"}</th><th scope="col">{he ? "סיווג" : "Classification"}</th><th scope="col">{he ? "ראיות" : "Evidence"}</th></tr></thead>
            <tbody>{latest.results.map((item) => <tr key={item.caseId}><th scope="row">{caseNames[item.caseId]?.[language] ?? (he ? "מקרה" : "Case")}</th><td>{item.baselineScore ?? (he ? "לא ניתן לניקוד" : "Not scored")}</td><td>{item.candidateScore ?? (he ? "לא ניתן לניקוד" : "Not scored")}</td><td><EvaluationBadge tone={item.classification === "regression" ? "danger" : item.classification === "improvement" ? "positive" : "warning"}>{classificationText(item.classification)}</EvaluationBadge></td><td>{item.evidenceIds.length}</td></tr>)}</tbody>
          </table>
        </div>
      </section> : <section className="evaluation-empty-card"><h2>{he ? "אין תוצאות מפוברקות" : "No fabricated results"}</h2><p>{he ? "הטבלה תופיע רק לאחר הרצת כל המקרים." : "The table appears only after every case is run."}</p></section>}
      {latest?.status === "blocked" ? <section className="evaluation-panel evaluation-blocker" role="alert"><div><h2>{he ? "רגרסיה קריטית או ראיה חסרה" : "Critical regression or missing evidence"}</h2><p>{he ? "נדרש תיקון או השלמת ראיה והרצה חדשה. אין לאשר את התוצאה הנוכחית." : "A fix or additional evidence and a new run are required. The current result must not be certified."}</p></div><button type="button" onClick={createFailure}>{he ? "יצירת מקרה כשל מקומי" : "Create local failure case"}</button></section> : null}
    </div>
  );
}
