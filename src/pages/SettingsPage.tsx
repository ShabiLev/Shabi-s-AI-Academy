import { useLanguage } from '../i18n/LanguageContext'

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  return <div className="page settings-page">
    <div className="page-heading"><h1>{t('pages.settingsTitle')}</h1><p>{t('pages.settingsDescription')}</p></div>
    <section className="settings-card" aria-labelledby="language-settings-title">
      <h2 id="language-settings-title">{t('settings.languageTitle')}</h2>
      <p>{t('settings.languageDescription')}</p>
      <div className="language-options" role="radiogroup" aria-label={t('settings.languageTitle')}>
        <button type="button" role="radio" aria-checked={language === 'he'} onClick={() => setLanguage('he')}><span lang="he">{t('settings.hebrew')}</span>{language === 'he' && <small>{t('settings.selected')}</small>}</button>
        <button type="button" role="radio" aria-checked={language === 'en'} onClick={() => setLanguage('en')}><span lang="en">{t('settings.english')}</span>{language === 'en' && <small>{t('settings.selected')}</small>}</button>
      </div>
    </section>
  </div>
}
