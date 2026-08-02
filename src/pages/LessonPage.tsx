import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { courseLessons, getLessonBySlug } from "../course/courseData";
import { useCourseProgress } from "../course/CourseProgressContext";
import { deterministicHash } from "../evaluations/hash";
import { useLanguage } from "../i18n/LanguageContext";
import { useOutcomes } from "../outcomes";
import { ProgressBar } from "../components/common/ProgressBar";
import { Quiz } from "../components/course/Quiz";
import { promptUi } from "../prompts/uiText";
export function LessonPage() {
  const { lessonSlug = "" } = useParams(),
    lesson = getLessonBySlug(lessonSlug),
    { language, t } = useLanguage(),
    { progress, startLesson, completeLesson, saveDraft } = useCourseProgress(),
    outcomesState = useOutcomes(),
    [completionMessage, setCompletionMessage] = useState(""),
    lessonOutcomeCreated = useRef(new Set<string>());
  useEffect(() => {
    if (
      lesson?.available &&
      (!progress.lessons[lesson.id]?.started ||
        progress.lastOpenedLessonId !== lesson.id)
    )
      startLesson(lesson.id);
  }, [
    lesson?.id,
    lesson?.available,
    progress.lastOpenedLessonId,
    progress.lessons,
    startLesson,
  ]);
  const lessonRecord = lesson ? progress.lessons[lesson.id] : undefined;
  // Derives at most one linked "Learning Result" Outcome once a Lesson is genuinely completed with
  // real evidence (never from a bare "mark complete" click) — mirrors the Mission completion pattern.
  useEffect(() => {
    if (!lesson?.available || !lessonRecord?.completed || !lessonRecord.verified) return;
    if (lessonOutcomeCreated.current.has(lesson.id)) return;
    lessonOutcomeCreated.current.add(lesson.id);
    if (outcomesState.outcomes.some((outcome) => outcome.sourceModule === "lesson" && outcome.sourceEntityId === lesson.id)) return;
    const he = language === "he";
    const created = outcomesState.create({
      title: lesson.title[language], summary: lesson.summary[language], intent: lesson.title[language],
      status: "ready", realityMode: "local", sourceModule: "lesson", sourceEntityId: lesson.id, resultType: "learning-result",
      resultLocation: `/lessons/${lesson.slug}`,
      usageInstructions: he ? "סקירת סיכום הלמידה ותרגול נוסף במידת הצורך." : "Review the learning summary and practice further if needed.",
      nextActions: [{ id: "review", label: he ? "סקירת השיעור" : "Review the lesson", route: `/lessons/${lesson.slug}` }],
      limitations: [he ? "מקומי בלבד; אינו מהווה תעודה רשמית." : "Local only; not a formal credential."],
      deliverableIds: [], evidenceIds: [], verificationState: "unverified",
    });
    if (!created) return;
    const now = new Date().toISOString();
    const quizScore = lessonRecord.quizScore ?? 0;
    outcomesState.addEvidence({
      schemaVersion: 2, id: `evidence-${created.id}`, actorId: created.actorId, outcomeId: created.id,
      evidenceType: "quiz-result",
      summary: he ? `ציון שאלון: ${quizScore}/${lesson.quiz.length}` : `Quiz score: ${quizScore}/${lesson.quiz.length}`,
      sourceEntityId: lesson.id, sourceEntityVersion: lesson.version,
      contentHash: deterministicHash({ lessonId: lesson.id, quizScore }), verificationState: "verified",
      createdAt: now, createdBy: created.actorId, verifiedAt: now,
    });
    outcomesState.update(created.id, { status: "completed" });
  // Runs once per lesson reaching a genuinely verified completion; re-reading outcomesState here
  // would refire the effect on every persisted mutation it makes — the ref latch guards duplication.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, lessonRecord?.completed, lessonRecord?.verified]);
  if (!lesson?.available)
    return (
      <div className="page lesson-not-found">
        <h1>{t("lesson.notFoundTitle")}</h1>
        <p>{t("lesson.notFoundDescription")}</p>
        <Link className="primary-button" to="/lessons">
          {t("lesson.breadcrumb")}
        </Link>
      </div>
    );
  const available = courseLessons.filter((l) => l.available),
    index = available.findIndex((l) => l.id === lesson.id),
    record = lessonRecord;
  return (
    <article className="page lesson-page">
      <nav className="breadcrumb" aria-label={t("lesson.breadcrumb")}>
        <Link to="/lessons">{t("lesson.breadcrumb")}</Link>
        <span aria-hidden="true">/</span>
        <span>{lesson.title[language]}</span>
      </nav>
      <header className="lesson-hero">
        <span className="eyebrow">
          {lesson.estimatedMinutes} {t("course.minutes")} ·{" "}
          {t(`course.difficulty.${lesson.difficulty}`)}
        </span>
        <h1>{lesson.title[language]}</h1>
        <p>{lesson.summary[language]}</p>
        <ProgressBar
          value={record?.completed ? 100 : record?.started ? 10 : 0}
        />
      </header>
      <section className="lesson-objectives">
        <h2>{t("course.objectives")}</h2>
        <ul>
          {lesson.learningObjectives.map((objective, i) => (
            <li key={i}>{objective[language]}</li>
          ))}
        </ul>
      </section>
      <nav className="lesson-toc" aria-label={language === "he" ? "תוכן השיעור" : "Lesson contents"}>
        <strong>{language === "he" ? "תוכן השיעור" : "Lesson contents"}</strong>
        <ol>
          {lesson.sections.map((section) => (
            <li key={section.id}><a href={`#${section.id}`}>{section.title[language]}</a></li>
          ))}
        </ol>
      </nav>
      {lesson.sections.map((section) => (
        <section className="lesson-section" id={section.id} key={section.id}>
          <h2>{section.title[language]}</h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className={p[language].includes("\n") ? "pre-line" : ""}>
              {p[language]}
            </p>
          ))}
          {section.steps && (
            <ol className="agent-loop">
              {section.steps.map((step, i) => (
                <li key={i}>{step[language]}</li>
              ))}
            </ol>
          )}
          {section.table && (
            <div
              className="table-wrap"
              tabIndex={0}
              aria-label={t("lesson.tableScrollHint")}
            >
              <table>
                <thead>
                  <tr>
                    {section.table.headers.map((h, i) => (
                      <th key={i}>{h[language]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell[language]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
      {lesson.examples.map((example) => (
        <section className="lesson-section" key={example.id}>
          <h2>{example.title[language]}</h2>
          {example.before && (
            <blockquote>{example.before[language]}</blockquote>
          )}
          {example.after && <blockquote>{example.after[language]}</blockquote>}
          <p>{example.explanation[language]}</p>
        </section>
      ))}
      {lesson.exercise && (
        <section className="lesson-section exercise">
          <h2>
            {t("course.exercise")}: {lesson.exercise.title[language]}
          </h2>
          <p>{lesson.exercise.instructions[language]}</p>
          {lesson.exercise.tasks && <ul>{lesson.exercise.tasks.map((task, index) => <li key={index}>{task[language]}</li>)}</ul>}
          {lesson.exercise.solution && (
            <details>
              <summary>{t("course.solution")}</summary>
              <p>{lesson.exercise.solution[language]}</p>
            </details>
          )}
          {lesson.assignmentDraft && (
            <>
              <label htmlFor="prompt-draft">
                {t("lesson.assignmentLabel")}
              </label>
              <textarea
                id="prompt-draft"
                value={record?.draft ?? ""}
                onChange={(e) => saveDraft(lesson.id, e.target.value)}
                rows={8}
              />
              <small>{t("lesson.localDraftNotice")}</small>
              <Link
                className="primary-button workshop-link"
                to="/prompts/new?source=lesson2"
              >
                {promptUi[language].openWorkshop}
              </Link>
            </>
          )}
          {lesson.id === "anatomy-of-an-agent" && (
            <Link
              className="primary-button workshop-link"
              to="/agents/new?source=lesson-agent"
            >
              {language === "he" ? "פתיחת בונה הסוכנים" : "Open Agent Builder"}
            </Link>
          )}
        </section>
      )}
      <section className="lesson-section">
        <h2>{language === "he" ? "מיני־פרויקט" : "Mini-project"}</h2>
        <p>{lesson.miniProject[language]}</p>
        <h3>{language === "he" ? "מקורות והמשך למידה" : "References and further learning"}</h3>
        <ul>{lesson.references.map((reference) => <li key={reference}>{reference}</li>)}</ul>
      </section>
      <Quiz lessonId={lesson.id} questions={lesson.quiz} />
      <div className="lesson-completion">
        {record?.completed ? (
          <strong role="status">{t("lesson.completed")}</strong>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                const ok = completeLesson(lesson.id, record?.quizScore !== undefined);
                setCompletionMessage(ok ? "" : (language === "he" ? "יש להשלים את השאלון שלמעלה לפני סימון השיעור כהושלם." : "Complete the quiz above before marking this lesson complete."));
              }}
            >
              {t("lesson.markComplete")}
            </button>
            {completionMessage && <p role="alert">{completionMessage}</p>}
          </>
        )}
      </div>
      <nav className="lesson-pager" aria-label={t("lesson.breadcrumb")}>
        {index > 0 && (
          <Link to={`/lessons/${available[index - 1].slug}`}>
            {t("lesson.previous")}: {available[index - 1].title[language]}
          </Link>
        )}
        {index < available.length - 1 && (
          <Link to={`/lessons/${available[index + 1].slug}`}>
            {t("lesson.next")}: {available[index + 1].title[language]}
          </Link>
        )}
      </nav>
    </article>
  );
}
