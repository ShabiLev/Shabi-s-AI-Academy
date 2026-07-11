import { useState } from "react";
import type { QuizQuestion } from "../../course/types";
import { useLanguage } from "../../i18n/LanguageContext";
import { useCourseProgress } from "../../course/CourseProgressContext";
export function Quiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const { language, t } = useLanguage(),
    { saveQuizScore } = useCourseProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({}),
    [submitted, setSubmitted] = useState(false),
    [error, setError] = useState(false);
  const score = questions.filter(
    (q) => answers[q.id] === q.correctOptionId,
  ).length;
  const submit = () => {
    if (Object.keys(answers).length < questions.length) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitted(true);
    saveQuizScore(lessonId, score);
  };
  return (
    <section className="quiz" aria-labelledby="quiz-title">
      <h2 id="quiz-title">{t("quiz.title")}</h2>
      {questions.map((q, index) => (
        <fieldset key={q.id}>
          <legend>
            {index + 1}. {q.prompt[language]}
          </legend>
          {q.options.map((option) => (
            <label key={option.id}>
              <input
                type="radio"
                name={q.id}
                value={option.id}
                checked={answers[q.id] === option.id}
                disabled={submitted}
                onChange={() => setAnswers({ ...answers, [q.id]: option.id })}
              />
              <span>{option.label[language]}</span>
            </label>
          ))}
          {submitted && (
            <p className="quiz-feedback">
              <strong>
                {answers[q.id] === q.correctOptionId
                  ? t("quiz.correct")
                  : t("quiz.incorrect")}
              </strong>{" "}
              — {q.explanation[language]}
            </p>
          )}
        </fieldset>
      ))}
      {error && <p role="alert">{t("quiz.answerRequired")}</p>}
      {submitted ? (
        <div className="quiz-result" role="status">
          <strong>
            {t("quiz.score")
              .replace("{score}", String(score))
              .replace("{total}", String(questions.length))}
          </strong>
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            {t("quiz.retry")}
          </button>
        </div>
      ) : (
        <button type="button" onClick={submit}>
          {t("quiz.submit")}
        </button>
      )}
    </section>
  );
}
