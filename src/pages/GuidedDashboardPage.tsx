import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AppCard } from "../components/common/AppCard";
import { PrimaryButton } from "../components/common/PrimaryButton";
import { SectionHeader } from "../components/common/SectionHeader";
import { courseLessons } from "../course/courseData";
import { useCourseProgress } from "../course/CourseProgressContext";
import { useExperience } from "../experience";
import { useLanguage } from "../i18n/LanguageContext";
import { getRecommendation, useOnboarding } from "../onboarding";
import { useProjects } from "../projects";
import { radarItems } from "../radar";
import { MigrationNotice } from "../components/data/MigrationNotice";

export function GuidedDashboardPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useOnboarding();
  const { mode } = useExperience();
  const { progress } = useCourseProgress();
  const { state: projects } = useProjects();
  const he = language === "he";
  const recommendation = getRecommendation(profile.recommendationId);
  const available = courseLessons.filter((lesson) => lesson.available);
  const currentLesson = available.find((lesson) => lesson.id === progress.lastOpenedLessonId) ?? available.find((lesson) => !progress.lessons[lesson.id]?.completed) ?? available[0];
  const activeProject = projects.projects.find((project) => project.status === "active") ?? projects.projects[0];

  return <div className="page guided-dashboard" data-testid="dashboard-page">
    <MigrationNotice />
    <section className="dashboard-continue"><span className="eyebrow">{he ? "המשך מהמקום שבו עצרת" : "Continue where you left off"}</span><h1>{he ? `ברוך שובך, ${user?.displayNameHe ?? "אורח"}` : `Welcome back, ${user?.displayNameEn ?? "Guest"}`}</h1><h2>{currentLesson.title[language]}</h2><p>{he ? "המשך בפריט המשמעותי האחרון שלך, או בחר משימה חדשה." : "Continue your most meaningful current item, or choose a new task."}</p><PrimaryButton to={`/lessons/${currentLesson.slug}`}>{he ? "המשך השיעור" : "Continue lesson"}</PrimaryButton></section>
    <section aria-labelledby="today-title" data-testid="dashboard-content"><h2 id="today-title">{he ? "מה תרצה לעשות היום?" : "What would you like to do today?"}</h2><div className="dashboard-primary-actions"><Link to="/lessons">{he ? "ללמוד שיעור" : "Learn a lesson"}</Link><Link to="/prompts">{he ? "למצוא פרומפט" : "Find a prompt"}</Link><Link to="/agents/catalog">{he ? "להשתמש בסוכן" : "Use an agent"}</Link><Link to="/projects/new">{he ? "להתחיל פרויקט" : "Start a project"}</Link></div></section>
    <div className="dashboard-support-grid">
      <AppCard><SectionHeader title={he ? "מומלץ עבורך" : "Recommended for you"} /><h2>{recommendation.title[language]}</h2><p>{recommendation.description[language]}</p><PrimaryButton to={recommendation.route}>{he ? "פתיחת ההמלצה" : "Open recommendation"}</PrimaryButton>{!profile.completed && <Link to="/onboarding">{he ? "התאמת ההמלצה" : "Personalize this"}</Link>}</AppCard>
      <AppCard><SectionHeader title={he ? "פרויקט פעיל" : "Active project"} /><h2>{activeProject?.name ?? (he ? "אין עדיין פרויקט פעיל" : "No active project yet")}</h2><p>{projects.projects.length} {he ? "פרויקטים מקומיים" : "local projects"}</p><Link to={activeProject ? `/projects/${activeProject.id}` : "/projects/new"}>{activeProject ? (he ? "פתיחת הפרויקט" : "Open project") : (he ? "יצירת פרויקט ראשון" : "Create your first project")}</Link></AppCard>
      <AppCard><SectionHeader title="AI Radar" /><p>{radarItems[0].title[language]}</p><Link to="/radar">{he ? "צפייה ב־Radar" : "View the Radar"}</Link></AppCard>
      {mode === "advanced" && <AppCard><SectionHeader title={he ? "איכות ואבחון" : "Quality and diagnostics"} /><p>{he ? "כלי QA וניתוח מפורט זמינים במצב מתקדם." : "QA and detailed analytics are available in Advanced Mode."}</p><Link to="/qa">{he ? "פתיחת מרכז QA" : "Open QA Center"}</Link></AppCard>}
    </div>
  </div>;
}
