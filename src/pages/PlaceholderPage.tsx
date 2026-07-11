import type { TranslationKey } from '../i18n/types'
import { useLanguage } from '../i18n/LanguageContext'
import { EmptyState } from '../components/common/EmptyState'
import { StatusBadge } from '../components/common/StatusBadge'

export function PlaceholderPage({ titleKey, descriptionKey }: { titleKey: TranslationKey; descriptionKey: TranslationKey }) {
  const { t } = useLanguage()
  return <div className="page placeholder-page"><div className="page-heading"><StatusBadge>{t('common.comingSoon')}</StatusBadge><h1>{t(titleKey)}</h1><p>{t(descriptionKey)}</p></div><div className="placeholder-grid" aria-hidden="true"><span /><span /><span /></div><EmptyState title={t('pages.futureLabel')} description={t('pages.futureDescription')} /></div>
}
