import { useEffect, useRef, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Icon } from '../common/Icon'

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
      if (event.key === 'Tab') {
        const drawer = closeButtonRef.current?.closest('[role="dialog"]')
        const controls = drawer?.querySelectorAll<HTMLElement>('button, a[href]')
        if (!controls?.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKeyDown) }
  }, [drawerOpen])

  const closeDrawer = () => { setDrawerOpen(false); requestAnimationFrame(() => menuButtonRef.current?.focus()) }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">{t('a11y.skipToContent')}</a>
    <aside className="desktop-sidebar"><Sidebar /></aside>
    <div className="app-column" aria-hidden={drawerOpen || undefined}>
      <Header ref={menuButtonRef} onOpenMenu={() => setDrawerOpen(true)} />
      <main id="main-content" tabIndex={-1}><Outlet /></main>
      <footer><strong>{t('brand.name')}</strong><span>{t('footer.version')}</span><Link to="/about">About / אודות</Link><span>{t('footer.builtWhileLearning')}</span></footer>
    </div>
    {drawerOpen && <div className="drawer-layer" role="presentation">
      <button className="drawer-overlay" aria-label={t('a11y.closeMenu')} onClick={closeDrawer} />
      <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label={t('header.workspace')}>
        <button ref={closeButtonRef} type="button" className="icon-button drawer-close" onClick={closeDrawer} aria-label={t('a11y.closeMenu')}><Icon name="close" /></button>
        <Sidebar mobile onNavigate={closeDrawer} />
      </aside>
    </div>}
  </div>
}
