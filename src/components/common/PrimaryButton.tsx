import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { useLanguage } from '../../i18n/LanguageContext'
export function PrimaryButton({ to, children }: { to: string; children: React.ReactNode }) {
  const { direction } = useLanguage()
  return <Link className="primary-button" to={to}>{children}<Icon name="arrow" className={`button-arrow ${direction === 'rtl' ? 'flip' : ''}`} /></Link>
}
