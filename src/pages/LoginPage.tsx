import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'

export function LoginPage() {
  const { isAuthenticated, demoLogin } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const requested = new URLSearchParams(location.search).get('from')
  const destination = requested && requested.startsWith('/') && !requested.startsWith('//') && requested !== '/login' ? requested : '/'
  if (isAuthenticated) return <Navigate to={destination} replace />
  return <main className="login-page">
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-orbit" aria-hidden="true">AI</div>
      <span className="eyebrow">{t('brand.name')}</span>
      <h1 id="login-title">{t('auth.login')}</h1>
      <p>{t('auth.description')}</p>
      <button className="demo-login-button" type="button" onClick={() => { demoLogin(); navigate(destination, { replace: true }) }}>{t('auth.demoLogin')}</button>
      <p className="development-notice" role="note">{t('auth.developmentNotice')}</p>
      <Link to="/about">About / אודות</Link>
    </section>
  </main>
}
