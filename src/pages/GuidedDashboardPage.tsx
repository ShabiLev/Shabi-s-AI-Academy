import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { MigrationNotice } from "../components/data/MigrationNotice";
import { PrimaryButton } from "../components/common/PrimaryButton";
import { courseLessons } from "../course/courseData";
import { useCourseProgress } from "../course/CourseProgressContext";
import { useLanguage } from "../i18n/LanguageContext";
import { getRecommendation, useOnboarding } from "../onboarding";
import { skillCatalog, useMissions } from "../missions";

const dashboardActions = [
  { to: "/missions/new", he: "התחלת משימה עם צוות", en: "Start mission with a team", descriptionHe: "פירוש, תכנית והרשאות לפני פעולה", descriptionEn: "Interpretation, plan, and permissions before action" },
  { to: "/team", he: "בחירת צוות", en: "Choose a team", descriptionHe: "תבניות מוסברות ומומחים מיוחסים", descriptionEn: "Explained presets and attributed specialists" },
  { to: "/lessons", he: "למידת מיומנות", en: "Learn a skill", descriptionHe: "התקדמות המבוססת על ראיות השלמה", descriptionEn: "Progress backed by completion evidence" },
] as const;

export function GuidedDashboardPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useOnboarding();
  const { progress } = useCourseProgress();
  const { currentMission } = useMissions();
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
        <h2 id="continue-title">{currentMission?.title ?? currentLesson.title[language]}</h2>
        <p>{currentMission ? (he ? "המשימה שומרת את השלב, הצוות והראיות המדויקים." : "The mission preserves its exact phase, team, and evidence.") : (he ? "הפריט האחרון המשמעותי שלך מוכן להמשך." : "Your latest meaningful item is ready to continue.")}</p>
      </div>
      <PrimaryButton to={currentMission ? `/missions/${currentMission.id}` : `/lessons/${currentLesson.slug}`}>{currentMission ? (he ? "המשך משימה" : "Continue mission") : (he ? "המשך בשיעור" : "Continue lesson")}</PrimaryButton>
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
    <section className="dashboard-intelligence" aria-label={he ? "למידה ועדכונים" : "Learning and updates"}>
      <article><span className="eyebrow">{he ? "מיומנות הבאה" : "Next skill"}</span><h2>{skillCatalog[0].name[language]}</h2><p>{he ? "רק שיעור, תרגיל או משימה שהושלמו מעלים רמה." : "Only a completed lesson, exercise, or mission raises a level."}</p><Link to={skillCatalog[0].lessonRoute}>{he ? "פתיחת מסלול" : "Open learning path"}</Link></article>
      <article><span className="eyebrow">AI Radar</span><h2>{he ? "עדכונים נבחרים" : "Curated updates"}</h2><p>{he ? "ה־Radar נשאר מקור משני ועדכני ללמידה." : "Radar remains a focused secondary learning source."}</p><Link to="/radar">{he ? "פתיחת Radar" : "Open Radar"}</Link></article>
    </section>
  </div>;
}
