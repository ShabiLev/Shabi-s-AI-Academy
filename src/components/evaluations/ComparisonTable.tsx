import { demoCompetitors, demoCriteria, evaluationText, type EvaluationLanguage } from "../../evaluations/uiText";
import { EvaluationBadge } from "./EvaluationBadge";

export function ComparisonTable({ language }: { language: EvaluationLanguage }) {
  const he = language === "he";
  return (
    <section className="evaluation-panel evaluation-comparison" aria-labelledby="comparison-heading">
      <div className="evaluation-section-heading">
        <div>
          <p className="eyebrow">{he ? "השוואה מוסברת" : "Explainable comparison"}</p>
          <h2 id="comparison-heading">{he ? "תוצאות לפי קריטריון" : "Results by criterion"}</h2>
        </div>
        <EvaluationBadge tone="positive">{he ? "4 קריטריונים עם ראיות" : "4 evidence-backed criteria"}</EvaluationBadge>
      </div>
      <div className="evaluation-table-wrap" tabIndex={0}>
        <table>
          <caption className="sr-only">
            {he
              ? "השוואת ציונים בין שני מתחרים לפי קריטריון, משקל וכמות ראיות"
              : "Comparison of two competitors by criterion, weight, and evidence count"}
          </caption>
          <thead>
            <tr>
              <th scope="col">{he ? "קריטריון" : "Criterion"}</th>
              <th scope="col">{he ? "משקל" : "Weight"}</th>
              <th scope="col">{evaluationText(language, demoCompetitors[0].name)}</th>
              <th scope="col">{evaluationText(language, demoCompetitors[1].name)}</th>
              <th scope="col">{he ? "ראיות" : "Evidence"}</th>
            </tr>
          </thead>
          <tbody>
            {demoCriteria.map((criterion) => (
              <tr key={criterion.name.en}>
                <th scope="row">{evaluationText(language, criterion.name)}</th>
                <td>{criterion.weight}%</td>
                <td>{criterion.first}/{criterion.weight}</td>
                <td>{criterion.second}/{criterion.weight}</td>
                <td>{criterion.evidence} {he ? "פריטים" : "items"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">{he ? "סך משוקלל" : "Weighted total"}</th>
              <td>100%</td>
              <td>86/100</td>
              <td>72/100</td>
              <td>16 {he ? "קישורים" : "references"}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="evaluation-chart-alt">
        <strong>{he ? "חלופת טקסט לתרשים:" : "Chart text alternative:"}</strong>{" "}
        {he
          ? "גרסה 1.3 מובילה ב־14 נקודות. הפער הגדול ביותר הוא בנגישות: 23 לעומת 15. המדגם כולל שתי חזרות דטרמיניסטיות לכל מתחרה."
          : "Version 1.3 leads by 14 points. The largest gap is accessibility: 23 versus 15. The sample includes two deterministic repetitions per competitor."}
      </p>
    </section>
  );
}
