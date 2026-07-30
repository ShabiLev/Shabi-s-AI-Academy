import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { RubricBuilder } from "../components/evaluations/RubricBuilder";
import { builtInRubrics, readOnlyEvaluators, useEvaluations } from "../evaluations";
import { useLanguage } from "../i18n/LanguageContext";

const competitorOptions = [
  { value: "accessible-react-v1.3", he: "סוכן React נגיש — גרסה 1.3", en: "Accessible React Agent — version 1.3" },
  { value: "baseline-react-v1.2", he: "סוכן React בסיסי — גרסה 1.2", en: "Baseline React Agent — version 1.2" },
  { value: "guided-team-v2.0", he: "צוות מודרך — גרסה 2.0", en: "Guided Team — version 2.0" },
  { value: "expert-team-v2.0", he: "צוות Expert — גרסה 2.0", en: "Expert Team — version 2.0" },
] as const;

export function EvaluationBuilderPage() {
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const navigate = useNavigate();
  const he = language === "he";
  const [name, setName] = useState("");
  const [mission, setMission] = useState("mission-accessible-react-snapshot");
  const [competitors, setCompetitors] = useState<string[]>(["accessible-react-v1.3", "baseline-react-v1.2"]);
  const [repetitions, setRepetitions] = useState(2);
  const [seed, setSeed] = useState("academy-19-beta");
  const [rubricId, setRubricId] = useState("react-ui-feature");
  const [evaluatorIds, setEvaluatorIds] = useState<string[]>(["requirements-evaluator", "accessibility-evaluator", "reality-checker"]);
  const [submitted, setSubmitted] = useState(false);
  const valid = name.trim().length >= 4 && mission.length > 0 && competitors.length >= 2 && competitors.length <= 5 && repetitions >= 1 && repetitions <= 5 && seed.trim().length >= 4 && evaluatorIds.length > 0;
  const toggle = (value: string) => setCompetitors((current) => current.includes(value) ? current.filter((item) => item !== value) : current.length < 5 ? [...current, value] : current);
  const submit = () => {
    setSubmitted(true);
    if (!valid) return;
    const timestamp = new Date().toISOString();
    const experiment = evaluations.createExperiment({
      id: `evaluation-${crypto.randomUUID()}`,
      actorId: evaluations.actorId,
      name: name.trim(),
      missionSnapshotId: mission,
      competitorIds: competitors,
      rubricId,
      evaluatorIds,
      repetitionCount: repetitions,
      seed: seed.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    navigate(`/evaluations/${experiment.id}`);
  };

  return (
    <div className="page evaluation-page evaluation-builder-page" data-testid="evaluation-builder">
      <header className="page-heading">
        <div><p className="eyebrow">{he ? "קלט קפוא · השוואה חוזרת" : "Frozen input · repeatable comparison"}</p><h1>{he ? "בניית ניסוי הערכה" : "Build an evaluation experiment"}</h1><p>{he ? "אמתו את החוזה לפני ההרצה. לאחר התחלה, שינוי מתחרה או גרסה מחייב ניסוי חדש." : "Validate the contract before running. After start, changing a competitor or version requires a new experiment."}</p></div>
      </header>
      <DeterministicNotice language={language} />
      {submitted && !valid ? <div className="evaluation-alert" role="alert" tabIndex={-1}>{he ? "ההגדרה עדיין אינה תקינה. בדקו שם, snapshot, 2–5 מתחרים, מספר חזרות ו־seed." : "The setup is not valid yet. Check the name, snapshot, 2–5 competitors, repetition count, and seed."}</div> : null}
      <div className="evaluation-builder-grid">
        <main className="evaluation-panel evaluation-setup-panel">
          <h2>{he ? "1. הגדרת הניסוי" : "1. Experiment setup"}</h2>
          <label>{he ? "שם תיאורי" : "Descriptive name"}<input value={name} maxLength={120} onChange={(event) => setName(event.target.value)} placeholder={he ? "לדוגמה: נגישות בגרסה 1.3 מול 1.2" : "Example: accessibility in version 1.3 versus 1.2"} /></label>
          <label>{he ? "Mission snapshot בלתי משתנה" : "Immutable Mission snapshot"}<select value={mission} onChange={(event) => setMission(event.target.value)}><option value="mission-accessible-react-snapshot">{he ? "משימת React נגישה — snapshot הדגמה מובנה" : "Accessible React mission — built-in demo snapshot"}</option><option value="">{he ? "בחירת snapshot" : "Choose a snapshot"}</option></select></label>
          <fieldset>
            <legend>{he ? "מתחרים — נדרשים 2 עד 5" : "Competitors — 2 to 5 required"}</legend>
            <div className="evaluation-picker-grid">
              {competitorOptions.map((option) => (
                <label key={option.value} className="evaluation-picker">
                  <input type="checkbox" checked={competitors.includes(option.value)} onChange={() => toggle(option.value)} />
                  <span><strong>{option[language]}</strong><small>{he ? "גרסה בלתי משתנה · מקור מקומי" : "Immutable version · local source"}</small></span>
                </label>
              ))}
            </div>
            <p className="field-hint" aria-live="polite">{he ? `${competitors.length} מתחרים נבחרו` : `${competitors.length} competitors selected`}</p>
          </fieldset>
          <div className="evaluation-inline-fields">
            <label>{he ? "חזרות תחומות" : "Bounded repetitions"}<input type="number" min="1" max="5" value={repetitions} onChange={(event) => setRepetitions(Number(event.target.value))} /></label>
            <label>{he ? "Seed דטרמיניסטי" : "Deterministic seed"}<input dir="ltr" value={seed} maxLength={64} onChange={(event) => setSeed(event.target.value)} /></label>
          </div>
          <fieldset>
            <legend>{he ? "מעריכים בלתי תלויים, קריאה בלבד" : "Independent, read-only evaluators"}</legend>
            {readOnlyEvaluators.map((evaluator) => <label className="evaluation-picker" key={evaluator.id}><input type="checkbox" checked={evaluatorIds.includes(evaluator.id)} onChange={() => setEvaluatorIds((current) => current.includes(evaluator.id) ? current.filter((id) => id !== evaluator.id) : [...current, evaluator.id])} /><span><strong>{evaluator.name[language]}</strong><small>{evaluator.realityChecker ? (he ? "רשאי לחסום אישור, לא לערוך" : "May block certification, cannot edit") : (he ? "קריאה ואימות בלבד; אינו בעל המימוש" : "Observe and validate only; does not own implementation")}</small></span></label>)}
          </fieldset>
        </main>
        <aside className="evaluation-rubric-picker"><label>{he ? "Rubric מובנה" : "Built-in rubric"}<select value={rubricId} onChange={(event) => setRubricId(event.target.value)}>{builtInRubrics.map((rubric) => <option value={rubric.id} key={rubric.id}>{rubric.name[language]}</option>)}</select></label><RubricBuilder language={language} rubric={builtInRubrics.find((rubric) => rubric.id === rubricId) ?? builtInRubrics[0]} /></aside>
      </div>
      <div className="evaluation-sticky-actions">
        <button type="button" onClick={() => navigate("/evaluations")}>{he ? "ביטול" : "Cancel"}</button>
        <button type="button" className="primary-button" aria-disabled={!valid} onClick={submit}>{he ? "יצירת טיוטת ניסוי" : "Create experiment draft"}</button>
        <span className="evaluation-action-clearance" aria-hidden="true" />
      </div>
    </div>
  );
}
