import { NavLink } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { useLanguage } from '../../i18n/LanguageContext'
import { navigationItems } from './navigation'

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t } = useLanguage()
  return <div className={mobile ? 'sidebar sidebar-mobile' : 'sidebar'}>
    <div className="brand-mark"><span className="brand-orbit" aria-hidden="true">A</span><div><strong>{t('brand.name')}</strong><span>{t('brand.tagline')}</span></div></div>
    <nav aria-label={t('header.workspace')} className="main-nav">
      {navigationItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon name={item.icon} /><span>{t(item.label)}</span></NavLink>)}
    </nav>
    <div className="sidebar-system"><span className="status-dot" /><div><strong>{t('header.online')}</strong><span>ACADEMY OS · 0.1.0</span></div></div>
  </div>
}
