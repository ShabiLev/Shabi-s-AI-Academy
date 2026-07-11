import { AppCard } from '../components/common/AppCard'
import { Icon } from '../components/common/Icon'
import { PrimaryButton } from '../components/common/PrimaryButton'
import { ProgressBar } from '../components/common/ProgressBar'
import { SectionHeader } from '../components/common/SectionHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { WelcomePanel } from '../components/dashboard/WelcomePanel'
import { activeProject } from '../data/courseData'
import { courseLessons } from '../course/courseData'
import { useCourseProgress } from '../course/CourseProgressContext'
import { useLanguage } from '../i18n/LanguageContext'
import { usePromptLibrary } from '../prompts/PromptLibraryContext'
import { promptUi } from '../prompts/uiText'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { t, language } = useLanguage()
  const { progress, percent, completedCount, availableCount } = useCourseProgress()
  const { state: promptState } = usePromptLibrary()
  const promptStrings = promptUi[language]
  const latestPrompt = [...promptState.prompts].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))[0]
  const available = courseLessons.filter((lesson) => lesson.available)
  const currentLesson = available.find((lesson) => lesson.id === progress.lastOpenedLessonId && !progress.lessons[lesson.id]?.completed) ?? available.find((lesson) => !progress.lessons[lesson.id]?.completed) ?? available[0]
  return <div className="page dashboard-page">
    <WelcomePanel />
    <div className="dashboard-grid">
      <AppCard className="progress-card"><SectionHeader title={t('dashboard.overallProgress')} accessory={<strong className="progress-value">{percent}%</strong>} /><ProgressBar value={percent} /><div className="progress-meta"><span>{t('course.completedOf').replace('{completed}',String(completedCount)).replace('{total}',String(availableCount))}</span><span><Icon name="clock" />{t('dashboard.dailyTime')}</span></div></AppCard>
      <AppCard className="learning-card"><SectionHeader title={t('dashboard.continueLearning')} accessory={<span className="card-index">{String(currentLesson.order).padStart(2,'0')}</span>} /><span className="eyebrow">{t('dashboard.lessonNumber').replace('3',String(currentLesson.order))}</span><h3>{currentLesson.title[language]}</h3><div className="lesson-meta"><span><Icon name="clock" />{currentLesson.estimatedMinutes} {t('common.minutes')}</span><StatusBadge>{t('common.beginner')}</StatusBadge></div><PrimaryButton to={`/lessons/${currentLesson.slug}`}>{t('dashboard.continue')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.promptLibrary')} accessory={<Icon name="prompts" />} /><strong className="metric-title">{promptState.prompts.length} {promptStrings.total}</strong><p>{promptState.prompts.filter(p=>p.isFavorite).length} {promptStrings.favorites}{latestPrompt?` · ${latestPrompt.title}`:''}</p><div className="dashboard-prompt-actions"><PrimaryButton to="/prompts">{t('dashboard.openLibrary')}</PrimaryButton><Link to="/prompts/new">{promptStrings.createPrompt}</Link></div></AppCard>
      <AppCard><SectionHeader title={t('dashboard.myAgents')} accessory={<Icon name="agents" />} /><strong className="metric-title">{t('dashboard.noAgents')}</strong><p>{t('dashboard.agentsDescription')}</p><div className="agent-tags"><span>QA</span><span>SQL</span><span>Release</span></div><PrimaryButton to="/agents">{t('dashboard.exploreAgents')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.activeProject')} accessory={<Icon name="projects" />} /><strong className="metric-title">{t('dashboard.projectName')}</strong><div className="project-status"><StatusBadge>{t('dashboard.planning')}</StatusBadge><strong>{activeProject.progress}%</strong></div><ProgressBar value={activeProject.progress} labelKey="a11y.projectProgressLabel" /><PrimaryButton to="/projects">{t('dashboard.viewProject')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.aiRadar')} accessory={<Icon name="radar" />} /><strong className="metric-title">{t('dashboard.noUpdates')}</strong><p>{t('dashboard.radarDescription')}</p><div className="radar-topics"><span>AI</span><span>Agents</span><span>MCP</span><span>Prompts</span></div></AppCard>
    </div>
  </div>
}
