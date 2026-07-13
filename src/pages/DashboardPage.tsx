import { AppCard } from "../components/common/AppCard";
import { Icon } from "../components/common/Icon";
import { PrimaryButton } from "../components/common/PrimaryButton";
import { ProgressBar } from "../components/common/ProgressBar";
import { SectionHeader } from "../components/common/SectionHeader";
import { StatusBadge } from "../components/common/StatusBadge";
import { WelcomePanel } from "../components/dashboard/WelcomePanel";
import { courseLessons } from "../course/courseData";
import { useCourseProgress } from "../course/CourseProgressContext";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { promptUi } from "../prompts/uiText";
import { Link } from "react-router-dom";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { agentUi } from "../agents/agentUi";
import { starterCatalog } from "../prompts/catalog";
import { catalogCounts } from "../config/catalogCounts";
import { useProjects } from "../projects";
import { useKnowledge } from "../knowledge";
import { useRuntime } from "../runtime/RuntimeContext";
import { useWorkspace } from "../workspace";
import { useWorkflows } from "../workflows";

export function DashboardPage() {
  const { t, language } = useLanguage();
  const { progress, percent, completedCount, availableCount } =
    useCourseProgress();
  const { state: promptState } = usePromptLibrary();
  const { state: agentState } = useAgentLibrary();
  const { state: projectState } = useProjects();
  const { state: knowledgeState } = useKnowledge();
  const { runs } = useRuntime();
  const { state: workspaceState } = useWorkspace();
  const { state: workflowState } = useWorkflows();
  const agentStrings = agentUi[language];
  const promptStrings = promptUi[language];
  const latestPrompt = [...promptState.prompts].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )[0];
  const available = courseLessons.filter((lesson) => lesson.available);
  const activeProject = projectState.projects.find((project) => project.status === "active") ?? projectState.projects[0];
  const currentLesson =
    available.find(
      (lesson) =>
        lesson.id === progress.lastOpenedLessonId &&
        !progress.lessons[lesson.id]?.completed,
    ) ??
    available.find((lesson) => !progress.lessons[lesson.id]?.completed) ??
    available[0];
  return (
    <div className="page dashboard-page">
      <WelcomePanel />
      <div className="dashboard-grid">
        <AppCard className="progress-card">
          <SectionHeader
            title={t("dashboard.overallProgress")}
            accessory={<strong className="progress-value">{percent}%</strong>}
          />
          <ProgressBar value={percent} />
          <div className="progress-meta">
            <span>
              {t("course.completedOf")
                .replace("{completed}", String(completedCount))
                .replace("{total}", String(availableCount))}
            </span>
            <span>
              <Icon name="clock" />
              {t("dashboard.dailyTime")}
            </span>
          </div>
        </AppCard>
        <AppCard className="learning-card">
          <SectionHeader
            title={t("dashboard.continueLearning")}
            accessory={
              <span className="card-index">
                {String(currentLesson.order).padStart(2, "0")}
              </span>
            }
          />
          <span className="eyebrow">
            {t("dashboard.lessonNumber").replace(
              "3",
              String(currentLesson.order),
            )}
          </span>
          <h3>{currentLesson.title[language]}</h3>
          <div className="lesson-meta">
            <span>
              <Icon name="clock" />
              {currentLesson.estimatedMinutes} {t("common.minutes")}
            </span>
            <StatusBadge>{t("common.beginner")}</StatusBadge>
          </div>
          <PrimaryButton to={`/lessons/${currentLesson.slug}`}>
            {t("dashboard.continue")}
          </PrimaryButton>
        </AppCard>
        <AppCard>
          <SectionHeader title={language === "he" ? "המשך עבודה" : "Continue working"} accessory={<Icon name="clock" />} />
          {workspaceState.activities.length ? <ul className="dashboard-activity-list">{workspaceState.activities.slice(-3).reverse().map((activity) => <li key={activity.id}><Link to={activity.route}>{activity.title}</Link><small>{activity.kind}</small></li>)}</ul> : <p>{language === "he" ? "פריטים שייפתחו או יורצו יופיעו כאן." : "Opened and run items will appear here."}</p>}
          <div className="dashboard-prompt-actions"><Link to="/workflows">{workflowState.workflows.length} {language === "he" ? "תהליכים" : "workflows"}</Link><Link to="/analytics">{language === "he" ? "מדדי סביבת עבודה" : "Workspace metrics"}</Link></div>
        </AppCard>
        <AppCard>
          <SectionHeader title={language === "he" ? "מועדפים ופעולות מהירות" : "Favorites and quick actions"} accessory={<Icon name="prompts" />} />
          <strong className="metric-title">{workspaceState.preferences.filter((item) => item.favorite).length + promptState.prompts.filter((item) => item.isFavorite).length + agentState.agents.filter((item) => item.isFavorite).length} {language === "he" ? "מועדפים" : "favorites"}</strong>
          <div className="dashboard-prompt-actions"><Link to="/search">{language === "he" ? "חיפוש" : "Search"}</Link><Link to="/assistant">{language === "he" ? "עוזר מקומי" : "Local Assistant"}</Link><Link to="/workflows/new">{language === "he" ? "תהליך חדש" : "New workflow"}</Link></div>
        </AppCard>
        <AppCard>
          <SectionHeader
            title={t("dashboard.promptLibrary")}
            accessory={<Icon name="prompts" />}
          />
          <strong className="metric-title">
            {promptState.prompts.length} {promptStrings.total}
          </strong>
          <p>
            {promptState.prompts.filter((p) => p.isFavorite).length}{" "}
            {promptStrings.favorites}
            {latestPrompt ? ` · ${latestPrompt.title}` : ""}
            {` · ${starterCatalog.length} ${language === "he" ? "בקטלוג ההתחלתי" : "Starter Catalog prompts"}`}
          </p>
          <div className="dashboard-prompt-actions">
            <PrimaryButton to="/prompts">
              {t("dashboard.openLibrary")}
            </PrimaryButton>
            <Link to="/prompts/new">{promptStrings.createPrompt}</Link>
            <Link to="/prompts/catalog">
              {language === "he" ? "קטלוג התחלתי" : "Starter Catalog"}
            </Link>
          </div>
        </AppCard>
        <AppCard>
          <SectionHeader
            title={t("dashboard.myAgents")}
            accessory={<Icon name="agents" />}
          />
          <strong className="metric-title">
            {agentState.agents.length} {agentStrings.counts}
          </strong>
          <p>
            {agentState.agents.filter((a) => a.status === "ready").length}{" "}
            {agentStrings.ready} ·{" "}
            {agentState.agents.filter((a) => a.status === "draft").length}{" "}
            {agentStrings.draft} ·{" "}
            {agentState.agents.filter((a) => a.isFavorite).length} ★
          </p>
          <div className="dashboard-prompt-actions">
            <PrimaryButton to="/agents">
              {t("dashboard.exploreAgents")}
            </PrimaryButton>
            <Link to="/agents/new">{agentStrings.newAgent}</Link>
          </div>
        </AppCard>
        <AppCard>
          <SectionHeader
            title={t("dashboard.activeProject")}
            accessory={<Icon name="projects" />}
          />
          <strong className="metric-title">{activeProject?.name ?? t("dashboard.projectName")}</strong>
          <div className="project-status">
            <StatusBadge>{t("dashboard.planning")}</StatusBadge>
            <strong>{projectState.projects.length} {language === "he" ? "פרויקטים" : "projects"}</strong>
          </div>
          <ProgressBar
            value={activeProject?.status === "completed" ? 100 : activeProject?.status === "active" ? 50 : 0}
            labelKey="a11y.projectProgressLabel"
          />
          <PrimaryButton to="/projects">
            {t("dashboard.viewProject")}
          </PrimaryButton>
        </AppCard>
        <AppCard>
          <SectionHeader title={language === "he" ? "פעילות מקומית" : "Local activity"} accessory={<Icon name="clock" />} />
          <strong className="metric-title">{runs.length} {language === "he" ? "הרצות" : "runs"}</strong>
          <p>{knowledgeState.documents.length} {language === "he" ? "מסמכי ידע" : "knowledge documents"} · {projectState.projects.length} {language === "he" ? "פרויקטים" : "projects"}</p>
          <p>{catalogCounts.packedPrompts} {language === "he" ? "פרומפטים בחבילות" : "packed prompts"} · {catalogCounts.starterAgents} {language === "he" ? "סוכנים התחלתיים" : "starter agents"}</p>
          <div className="dashboard-prompt-actions"><Link to="/runs">Run History</Link><Link to="/knowledge">Knowledge Base</Link></div>
        </AppCard>
        <AppCard>
          <SectionHeader
            title={t("dashboard.aiRadar")}
            accessory={<Icon name="radar" />}
          />
          <strong className="metric-title">{t("dashboard.noUpdates")}</strong>
          <p>{t("dashboard.radarDescription")}</p>
          <div className="radar-topics">
            <span>AI</span>
            <span>Agents</span>
            <span>MCP</span>
            <span>Prompts</span>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
