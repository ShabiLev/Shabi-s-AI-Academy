import { demoCriteria, evaluationText, type EvaluationLanguage } from "../../evaluations/uiText";

export function RubricSummary({ language, editable = false }: { language: EvaluationLanguage; editable?: boolean }) {
  const he = language === "he";
  return (
    <section className="evaluation-panel evaluation-rubric" aria-labelledby="rubric-heading">
      <div className="evaluation-section-heading">
        <div>
          <p className="eyebrow">{he ? "גרסת rubric קפואה 1.1" : "Frozen rubric version 1.1"}</p>
          <h2 id="rubric-heading">{he ? "איכות כללית למשימת React" : "General React mission quality"}</h2>
        </div>
        <span className="evaluation-weight-total" aria-label={he ? "סך משקלים 100 אחוז" : "Total weight 100 percent"}>100%</span>
      </div>
      <p>{he ? "כל ציון מחייב ראיה; ראיה חסרה מסומנת ״לא ניתן ניקוד״ ולא כאפס." : "Every score requires evidence; missing evidence is not-scored, never zero."}</p>
      <ol className="evaluation-criteria-list">
        {demoCriteria.map((criterion, index) => (
          <li key={criterion.name.en}>
            <div>
              <strong>{evaluationText(language, criterion.name)}</strong>
              <span>{criterion.weight}% · {index === 1 ? (he ? "חוסם אישור" : "Blocks certification") : (he ? "לא חוסם" : "Non-blocking")}</span>
            </div>
            {editable ? (
              <label>
                <span className="sr-only">{he ? "משקל" : "Weight"}: {evaluationText(language, criterion.name)}</span>
                <input type="number" min="1" max="100" defaultValue={criterion.weight} />
              </label>
            ) : <span>{criterion.evidence} {he ? "סוגי ראיות" : "evidence types"}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
