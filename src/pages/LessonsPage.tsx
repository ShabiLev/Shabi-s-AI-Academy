import { Link } from "react-router-dom";
import { courseLessons, courseModules } from "../course/courseData";
import { useCourseProgress } from "../course/CourseProgressContext";
import { useLanguage } from "../i18n/LanguageContext";
import { ProgressBar } from "../components/common/ProgressBar";
const statusKeys = { "not-started": "course.status.notStarted", "in-progress": "course.status.inProgress", completed: "course.status.completed", "coming-soon": "course.status.comingSoon" } as const;
export function LessonsPage() {
  const { language, t } = useLanguage(),
    { percent, completedCount, availableCount, getStatus } =
      useCourseProgress(),
    module = courseModules[0];
  return (
    <div className="page lessons-page">
      <header className="page-heading">
        <span className="eyebrow">{t("course.module")} 1</span>
        <h1>{module.title[language]}</h1>
        <p>{module.description[language]}</p>
      </header>
      <section className="catalog-progress" aria-label={t("course.progress")}>
        <strong>
          {t("course.completedOf")
            .replace("{completed}", String(completedCount))
            .replace("{total}", String(availableCount))}
        </strong>
        <span>{percent}%</span>
        <ProgressBar value={percent} />
      </section>
      <div className="lesson-catalog">
        {courseLessons.map((lesson) => {
          const status = getStatus(lesson.id, lesson.available),
            action =
              status === "completed"
                ? "review"
                : status === "in-progress"
                  ? "continue"
                  : "start";
          return (
            <article className="lesson-card" key={lesson.id}>
              <span className={`lesson-status status-${status}`}>
                {t(statusKeys[status])}
              </span>
              <span className="lesson-number">
                {String(lesson.order).padStart(2, "0")}
              </span>
              <h2>{lesson.title[language]}</h2>
              <p>{lesson.summary[language]}</p>
              <div className="lesson-meta">
                <span>
                  {lesson.estimatedMinutes} {t("course.minutes")}
                </span>
                <span>{t(`course.difficulty.${lesson.difficulty}`)}</span>
              </div>
              {lesson.available ? (
                <Link className="primary-button" to={`/lessons/${lesson.slug}`}>
                  {t(`course.action.${action}`)}
                </Link>
              ) : (
                <button className="primary-button" disabled>
                  {t("course.status.comingSoon")}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
