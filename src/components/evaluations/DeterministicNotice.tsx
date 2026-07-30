import { academyEvaluationLabel, evaluationText, type EvaluationLanguage } from "../../evaluations/uiText";

export function DeterministicNotice({ language }: { language: EvaluationLanguage }) {
  return (
    <aside className="evaluation-deterministic-notice" aria-label={evaluationText(language, academyEvaluationLabel)}>
      <strong>{evaluationText(language, academyEvaluationLabel)}</strong>
      <span>
        {language === "he"
          ? "התוצאות מבוססות על סימולציה מקומית וקלטים קפואים. אין כאן השוואת ספקי מודלים חיים."
          : "Results use local simulation and frozen inputs. This is not a live model-provider comparison."}
      </span>
    </aside>
  );
}
