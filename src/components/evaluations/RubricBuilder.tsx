import { useState } from "react";
import type { EvaluationRubric } from "../../evaluations";
import type { EvaluationLanguage } from "../../evaluations/uiText";
import { EvaluationBadge } from "./EvaluationBadge";

export function RubricBuilder({ language, rubric }: { language: EvaluationLanguage; rubric: EvaluationRubric }) {
  const he = language === "he";
  const [cloned, setCloned] = useState(false);
  const [weights, setWeights] = useState(() => rubric.criteria.map((criterion) => criterion.weight));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return (
    <section className="evaluation-panel evaluation-rubric" aria-labelledby="rubric-builder-heading">
      <div className="evaluation-section-heading">
        <div><p className="eyebrow">{cloned ? (he ? "עותק משתמש · המקור נשמר" : "User copy · source preserved") : (he ? "Rubric מובנה ובלתי משתנה" : "Immutable built-in rubric")}</p><h2 id="rubric-builder-heading">{rubric.name[language]}</h2></div>
        <EvaluationBadge tone={total === 100 ? "positive" : "danger"}>{total}%</EvaluationBadge>
      </div>
      <p>{rubric.description[language]}</p>
      <ol className="evaluation-criteria-list">
        {rubric.criteria.map((criterion, index) => (
          <li key={criterion.id}>
            <div><strong>{criterion.name[language]}</strong><span>{criterion.blocking ? (he ? "חוסם אישור" : "Blocks certification") : (he ? "לא חוסם" : "Non-blocking")} · {criterion.scoringScale.min}–{criterion.scoringScale.max}</span></div>
            {cloned ? <label><span className="sr-only">{he ? "משקל" : "Weight"}: {criterion.name[language]}</span><input aria-invalid={total !== 100} type="number" min="1" max="100" value={weights[index]} onChange={(event) => setWeights((current) => current.map((weight, itemIndex) => itemIndex === index ? Number(event.target.value) : weight))} /></label> : <strong>{criterion.weight}%</strong>}
          </li>
        ))}
      </ol>
      <p className={total === 100 ? "field-hint" : "evaluation-alert"} aria-live="polite">{total === 100 ? (he ? "המשקלים מסתכמים בדיוק ב־100." : "Weights total exactly 100.") : (he ? `נדרש סך 100; הסך הנוכחי הוא ${total}.` : `A total of 100 is required; current total is ${total}.`)}</p>
      {!cloned ? <button type="button" onClick={() => setCloned(true)}>{he ? "שכפול לעריכה" : "Clone to edit"}</button> : <p className="field-hint">{he ? "שמירת העותק תתבצע רק לאחר חיבור פעולת repository. המקור המובנה לא השתנה." : "The copy will be saved only when the repository action is connected. The built-in source is unchanged."}</p>}
    </section>
  );
}
