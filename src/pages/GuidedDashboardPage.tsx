import { Link } from "react-router-dom";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
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
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { radarItems } from "../radar";
import { useWorkspace } from "../workspace";
import { SyncStatusIndicator } from "../components/data/SyncStatusIndicator";
import { MigrationNotice } from "../components/data/MigrationNotice";
import { starterCatalog } from "../prompts/catalog";
import { useKnowledge } from "../knowledge";
import { useRuntime } from "../runtime/RuntimeContext";
import { useWorkflows } from "../workflows";

export function GuidedDashboardPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { profile } = useOnboarding();
  const { mode } = useExperience();
  const { progress, percent, completedCount, availableCount } = useCourseProgress();
  const { state: prompts } = usePromptLibrary();
  const { state: agents } = useAgentLibrary();
  const { state: projects } = useProjects();
  const { state: workspace } = useWorkspace();
  const { state: knowledge } = useKnowledge();
  const { runs } = useRuntime();
  const { state: workflows } = useWorkflows();
  const he = language === "he";
  const recommendation = getRecommendation(profile.recommendationId);
  const available = courseLessons.filter((lesson) => lesson.available);
  const currentLesson = available.find((lesson) => lesson.id === progress.lastOpenedLessonId) ?? available.find((lesson) => !progress.lessons[lesson.id]?.completed) ?? available[0];
  const activeProject = projects.projects.find((project) => project.status === "active") ?? projects.projects[0];
  const favoriteCount = prompts.prompts.filter((item) => item.isFavorite).length + agents.agents.filter((item) => item.isFavorite).length + workspace.preferences.filter((item) => item.favorite).length;

  return <div className="page guided-dashboard">
    <MigrationNotice />
    <section className="dashboard-continue"><span className="eyebrow">{he ? "המשך מהמקום שבו עצרת" : "Continue where you left off"}</span><h1>{he ? `ברוך שובך, ${user?.displayNameHe ?? "אורח"}` : `Welcome back, ${user?.displayNameEn ?? "Guest"}`}</h1><h2>{currentLesson.title[language]}</h2><p>{he ? "המשך בפריט המשמעותי האחרון שלך, או בחר משימה חדשה." : "Continue your most meaningful current item, or choose a new task."}</p><PrimaryButton to={`/lessons/${currentLesson.slug}`}>{he ? "המשך השיעור" : "Continue lesson"}</PrimaryButton></section>
    <section aria-labelledby="today-title"><h2 id="today-title">{he ? "מה תרצה לעשות היום?" : "What would you like to do today?"}</h2><div className="dashboard-primary-actions"><Link to="/lessons">{he ? "ללמוד שיעור" : "Learn a lesson"}</Link><Link to="/prompts">{he ? "למצוא פרומפט" : "Find a prompt"}</Link><Link to="/agents/catalog">{he ? "להשתמש בסוכן" : "Use an agent"}</Link><Link to="/projects/new">{he ? "להתחיל פרויקט" : "Start a project"}</Link></div></section>
    <div className="dashboard-support-grid">
      <AppCard><SectionHeader title={he ? "סקירת סביבת העבודה" : "Workspace overview"} /><dl className="account-facts"><div><dt>{he ? "התקדמות בלמידה" : "Learning progress"}</dt><dd>{percent}% · {completedCount}/{availableCount}</dd></div><div><dt>{he ? "ספריית פרומפטים" : "Prompt Library"}</dt><dd>{prompts.prompts.length} {he ? "פרומפטים" : "prompts"}</dd></div><div><dt>{he ? "קטלוג התחלתי" : "Starter Catalog"}</dt><dd>{starterCatalog.length} {he ? "פרומפטים בקטלוג ההתחלתי" : "Starter Catalog prompts"}</dd></div><div><dt>{he ? "סוכנים" : "Agents"}</dt><dd>{agents.agents.length}</dd></div><div><dt>{he ? "תהליכים והרצות" : "Workflows and runs"}</dt><dd>{workflows.workflows.length} · {runs.length}</dd></div><div><dt>{he ? "מסמכי ידע" : "Knowledge documents"}</dt><dd>{knowledge.documents.length}</dd></div></dl><div className="inline-actions"><Link to="/prompts">{he ? "פתיחת הספרייה" : "Open Library"}</Link><Link to="/analytics">{he ? "ניתוח מפורט" : "Detailed analytics"}</Link></div></AppCard>
      <AppCard><SectionHeader title={he ? "מומלץ עבורך" : "Recommended for you"} /><h2>{recommendation.title[language]}</h2><p>{recommendation.description[language]}</p><PrimaryButton to={recommendation.route}>{he ? "פתיחת ההמלצה" : "Open recommendation"}</PrimaryButton>{!profile.completed && <Link to="/onboarding">{he ? "התאמת ההמלצה" : "Personalize this"}</Link>}</AppCard>
      <AppCard><SectionHeader title={he ? "פרויקט פעיל" : "Active project"} /><h2>{activeProject?.name ?? (he ? "אין עדיין פרויקט פעיל" : "No active project yet")}</h2><p>{projects.projects.length} {he ? "פרויקטים מקומיים" : "local projects"}</p><Link to={activeProject ? `/projects/${activeProject.id}` : "/projects/new"}>{activeProject ? (he ? "פתיחת הפרויקט" : "Open project") : (he ? "יצירת פרויקט ראשון" : "Create your first project")}</Link></AppCard>
      <AppCard><SectionHeader title={he ? "פריטים אחרונים" : "Recent items"} />{workspace.activities.length ? <ul>{workspace.activities.slice(-4).reverse().map((item) => <li key={item.id}><Link to={item.route}>{item.title}</Link></li>)}</ul> : <p>{he ? "פריטים שתפתח או תריץ יופיעו כאן." : "Items you open or run will appear here."}</p>}<span>{favoriteCount} {he ? "מועדפים" : "favorites"}</span></AppCard>
      <AppCard><SectionHeader title="AI Radar" /><p>{radarItems[0].title[language]}</p><Link to="/radar">{he ? "צפייה ב־Radar" : "View the Radar"}</Link></AppCard>
      <AppCard><SectionHeader title={he ? "מצב סביבת העבודה" : "Workspace status"} /><dl className="runtime-facts"><div><dt>{he ? "חוויה" : "Experience"}</dt><dd>{mode === "beginner" ? (he ? "מתחיל" : "Beginner") : (he ? "מתקדם" : "Advanced")}</dd></div><div><dt>{he ? "נתונים" : "Data"}</dt><dd><SyncStatusIndicator /></dd></div></dl></AppCard>
      {mode === "advanced" && <AppCard><SectionHeader title={he ? "איכות ואבחון" : "Quality and diagnostics"} /><p>{he ? "כלי QA וניתוח מפורט זמינים במצב מתקדם." : "QA and detailed analytics are available in Advanced Mode."}</p><Link to="/qa">{he ? "פתיחת מרכז QA" : "Open QA Center"}</Link></AppCard>}
    </div>
  </div>;
}
