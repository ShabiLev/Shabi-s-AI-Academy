import { StatusBadge } from '../common/StatusBadge'
import { useLanguage } from '../../i18n/LanguageContext'
export function WelcomePanel() {
  const { t } = useLanguage()
  return <section className="welcome-panel"><div className="welcome-copy"><span className="eyebrow">{t('dashboard.eyebrow')}</span><h1>{t('dashboard.welcome')}</h1><p>{t('dashboard.level')}</p><div className="mission"><span>{t('dashboard.missionLabel')}</span><strong>{t('dashboard.mission')}</strong></div></div><div className="welcome-visual" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="core">AI</span></div><StatusBadge tone="online">{t('header.online')}</StatusBadge></section>
}
