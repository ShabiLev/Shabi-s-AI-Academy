import { Icon } from '../common/Icon'
import { useLanguage } from '../../i18n/LanguageContext'
export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { language, setLanguage, t } = useLanguage()
  return <header className="top-header">
    <button type="button" className="icon-button menu-button" onClick={onOpenMenu} aria-label={t('a11y.openMenu')}><Icon name="menu" /></button>
    <div className="header-title"><span className="header-pulse" />{t('header.workspace')}</div>
    <div className="language-switcher" role="group" aria-label={t('a11y.changeLanguage')}>
      <button type="button" aria-pressed={language === 'he'} onClick={() => setLanguage('he')}>{t('header.hebrew')}</button>
      <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>{t('header.english')}</button>
    </div>
  </header>
}
