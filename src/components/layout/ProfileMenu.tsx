import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { user, signOut } = useAuth()
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const close = (restoreFocus = true) => {
    setOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  if (!user) return null
  const name = language === 'he' ? user.displayNameHe : user.displayNameEn
  return <div className="profile-menu" ref={wrapperRef}>
    <button ref={triggerRef} type="button" className="profile-trigger" aria-expanded={open} aria-haspopup="menu" aria-label={t('a11y.openProfile')} onClick={() => setOpen((value) => !value)}>
      <span className="profile-avatar" aria-hidden="true">{user.avatarInitials}</span><span className="profile-trigger-copy"><strong>{name}</strong><span>{user.role}</span></span>
    </button>
    {open && <div className="profile-popover" role="menu" aria-label={t('profile.menu')}>
      <div className="profile-summary"><strong>{name}</strong><span>{user.role}</span></div>
      <Link role="menuitem" to="/settings" onClick={() => close(false)}>{t('nav.settings')}</Link>
      <Link role="menuitem" to="/about" onClick={() => close(false)}>About / אודות</Link>
      <Link role="menuitem" to="/developer" onClick={() => close(false)}>{t('nav.developer')}</Link>
      <button role="menuitem" type="button" onClick={() => { signOut(); navigate('/login', { replace: true }) }}>{t('auth.signOut')}</button>
    </div>}
  </div>
}
