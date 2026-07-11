import { AppCard } from '../components/common/AppCard'
import { Icon } from '../components/common/Icon'
import { PrimaryButton } from '../components/common/PrimaryButton'
import { ProgressBar } from '../components/common/ProgressBar'
import { SectionHeader } from '../components/common/SectionHeader'
import { StatusBadge } from '../components/common/StatusBadge'
import { WelcomePanel } from '../components/dashboard/WelcomePanel'
import { activeProject, currentLesson, progressSummary } from '../data/courseData'
import { useLanguage } from '../i18n/LanguageContext'

export function DashboardPage() {
  const { t } = useLanguage()
  return <div className="page dashboard-page">
    <WelcomePanel />
    <div className="dashboard-grid">
      <AppCard className="progress-card"><SectionHeader title={t('dashboard.overallProgress')} accessory={<strong className="progress-value">{progressSummary.percent}%</strong>} /><ProgressBar value={progressSummary.percent} /><div className="progress-meta"><span>{t('dashboard.lessonsCompleted')}</span><span><Icon name="clock" />{t('dashboard.dailyTime')}</span></div></AppCard>
      <AppCard className="learning-card"><SectionHeader title={t('dashboard.continueLearning')} accessory={<span className="card-index">03</span>} /><span className="eyebrow">{t('dashboard.lessonNumber')}</span><h3>{t('dashboard.lessonTitle')}</h3><div className="lesson-meta"><span><Icon name="clock" />{currentLesson.durationMinutes} {t('common.minutes')}</span><StatusBadge>{t('common.beginner')}</StatusBadge></div><PrimaryButton to="/lessons">{t('dashboard.continue')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.promptLibrary')} accessory={<Icon name="prompts" />} /><strong className="metric-title">{t('dashboard.noPrompts')}</strong><p>{t('dashboard.promptDescription')}</p><PrimaryButton to="/prompt-library">{t('dashboard.openLibrary')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.myAgents')} accessory={<Icon name="agents" />} /><strong className="metric-title">{t('dashboard.noAgents')}</strong><p>{t('dashboard.agentsDescription')}</p><div className="agent-tags"><span>QA</span><span>SQL</span><span>Release</span></div><PrimaryButton to="/agents">{t('dashboard.exploreAgents')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.activeProject')} accessory={<Icon name="projects" />} /><strong className="metric-title">{t('dashboard.projectName')}</strong><div className="project-status"><StatusBadge>{t('dashboard.planning')}</StatusBadge><strong>{activeProject.progress}%</strong></div><ProgressBar value={activeProject.progress} labelKey="a11y.projectProgressLabel" /><PrimaryButton to="/projects">{t('dashboard.viewProject')}</PrimaryButton></AppCard>
      <AppCard><SectionHeader title={t('dashboard.aiRadar')} accessory={<Icon name="radar" />} /><strong className="metric-title">{t('dashboard.noUpdates')}</strong><p>{t('dashboard.radarDescription')}</p><div className="radar-topics"><span>AI</span><span>Agents</span><span>MCP</span><span>Prompts</span></div></AppCard>
    </div>
  </div>
}
