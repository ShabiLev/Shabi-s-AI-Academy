import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Icon } from '../common/Icon'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown) }
  }, [drawerOpen])

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">{t('a11y.skipToContent')}</a>
    <aside className="desktop-sidebar"><Sidebar /></aside>
    <div className="app-column">
      <Header onOpenMenu={() => setDrawerOpen(true)} />
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <footer><strong>{t('brand.name')}</strong><span>{t('footer.version')}</span><span>{t('footer.builtWhileLearning')}</span></footer>
    </div>
    {drawerOpen && <div className="drawer-layer" role="presentation">
      <button className="drawer-overlay" aria-label={t('a11y.closeMenu')} onClick={() => setDrawerOpen(false)} />
      <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label={t('header.workspace')}>
        <button ref={closeButtonRef} type="button" className="icon-button drawer-close" onClick={() => setDrawerOpen(false)} aria-label={t('a11y.closeMenu')}><Icon name="close" /></button>
        <Sidebar mobile onNavigate={() => setDrawerOpen(false)} />
      </aside>
    </div>}
  </div>
}
