import { useLanguage } from '../../i18n/LanguageContext'
import type { TranslationKey } from '../../i18n/types'
export function ProgressBar({ value, labelKey = 'a11y.progressLabel' }: { value: number; labelKey?: TranslationKey }) {
  const { t } = useLanguage()
  return <div className="progress-track" role="progressbar" aria-label={t(labelKey)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span className="progress-fill" style={{ width: `${value}%` }} /></div>
}
