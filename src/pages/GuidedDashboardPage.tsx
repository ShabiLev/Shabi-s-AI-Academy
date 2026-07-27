import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { MigrationNotice } from "../components/data/MigrationNotice";
import { PrimaryButton } from "../components/common/PrimaryButton";
import { courseLessons } from "../course/courseData";
import { useCourseProgress } from "../course/CourseProgressContext";
import { useLanguage } from "../i18n/LanguageContext";
import { getRecommendation, useOnboarding } from "../onboarding";

const dashboardActions = [
  { to: "/lessons", he: "ללמוד", en: "Learn", descriptionHe: "שיעורים קצרים ומעשיים", descriptionEn: "Short, practical lessons" },
  { to: "/prompts", he: "פרומפטים", en: "Prompts", descriptionHe: "למצוא ולבנות פרומפט", descriptionEn: "Find and build a prompt" },
  { to: "/agents/catalog", he: "סוכנים", en: "Agents", descriptionHe: "להתחיל מתבנית מוכנה", descriptionEn: "Start from a ready blueprint" },
  { to: "/projects/new", he: "התחלת פרויקט", en: "Start a project", descriptionHe: "להפוך רעיון לעבודה מסודרת", descriptionEn: "Turn an idea into structured work" },
] as const;

export function GuidedDashboardPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useOnboarding();
  const { progress } = useCourseProgress();
  const he = language === "he";
  const available = courseLessons.filter((lesson) => lesson.available);
  const currentLesson =
    available.find((lesson) => lesson.id === progress.lastOpenedLessonId) ??
    available.find((lesson) => !progress.lessons[lesson.id]?.completed) ??
    available[0];
  const recommendation = getRecommendation(profile.recommendationId);

  return <div className="page guided-dashboard" data-testid="dashboard-page">
    <MigrationNotice />
    <header className="dashboard-welcome">
      <p className="eyebrow">{he ? "האקדמיה שלך" : "Your Academy"}</p>
      <h1>{he ? `ברוך שובך, ${user?.displayNameHe ?? "אורח"}` : `Welcome back, ${user?.displayNameEn ?? "Guest"}`}</h1>
      <p>{he ? "מה הצעד הבא שלך?" : "What is your next step?"}</p>
    </header>

    <section className="dashboard-continue" aria-labelledby="continue-title">
      <div>
        <span className="eyebrow">{he ? "המשך מהמקום שבו עצרת" : "Continue where you left off"}</span>
        <h2 id="continue-title">{currentLesson.title[language]}</h2>
        <p>{he ? "הפריט האחרון המשמעותי שלך מוכן להמשך." : "Your latest meaningful item is ready to continue."}</p>
      </div>
      <PrimaryButton to={`/lessons/${currentLesson.slug}`}>{he ? "המשך בשיעור" : "Continue lesson"}</PrimaryButton>
    </section>

    <section aria-labelledby="today-title" data-testid="dashboard-content">
      <h2 id="today-title">{he ? "מה תרצה לעשות היום?" : "What would you like to do today?"}</h2>
      <div className="dashboard-primary-actions">
        {dashboardActions.map((action) => <Link key={action.to} to={action.to}>
          <strong>{he ? action.he : action.en}</strong>
          <span>{he ? action.descriptionHe : action.descriptionEn}</span>
        </Link>)}
      </div>
    </section>

    <p className="dashboard-recommendation">
      {he ? "המלצה אישית: " : "Personal recommendation: "}
      <Link to={recommendation.route}>{recommendation.title[language]}</Link>
      {!profile.completed && <> · <Link to="/onboarding">{he ? "התאמה אישית" : "Personalize"}</Link></>}
    </p>
  </div>;
}
