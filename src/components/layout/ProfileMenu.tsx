import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";

const viewportPadding = 12;

export function ProfileMenu({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 280 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const { user, signOut, isCloudAuthenticated, status } = useAuth();
  const { language, direction, t } = useLanguage();
  const navigate = useNavigate();

  const close = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [open]);

  const updatePosition = useCallback(() => {
    if (mobile || !triggerRef.current) return;
    const trigger = triggerRef.current.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - viewportPadding * 2);
    const measuredHeight = menuRef.current?.getBoundingClientRect().height ?? 260;
    const preferredLeft = direction === "rtl" ? trigger.right - width : trigger.left;
    const left = Math.min(Math.max(viewportPadding, preferredLeft), window.innerWidth - width - viewportPadding);
    const below = trigger.bottom + 8;
    const top = below + measuredHeight <= window.innerHeight - viewportPadding ? below : Math.max(viewportPadding, trigger.top - measuredHeight - 8);
    setPosition({ top, left, width });
  }, [direction, mobile]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    requestAnimationFrame(() => {
      updatePosition();
      menuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    });
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      const items = [...(menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? [])];
      if (!items.length) return;
      event.preventDefault();
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowUp" ? (current - 1 + items.length) % items.length : (current + 1) % items.length;
      items[next].focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [close, open, updatePosition]);

  if (!user) return null;
  const name = language === "he" ? user.displayNameHe : user.displayNameEn;
  const menu = open && <div className={`profile-layer${mobile ? " profile-layer-mobile" : ""}`} data-profile-layer="portal">
    <button type="button" tabIndex={-1} className="profile-backdrop" aria-label={language === "he" ? "סגירת תפריט הפרופיל" : "Close profile menu"} onClick={() => close()} />
    <div ref={menuRef} className={`profile-popover${mobile ? " profile-sheet" : ""}`} role="menu" aria-label={t("profile.menu")} style={mobile ? undefined : position}>
      <div className="profile-summary"><strong>{name}</strong><span>{user.role}</span><small>{isCloudAuthenticated ? (language === "he" ? "חשבון מחובר" : "Cloud account") : (language === "he" ? "אורח · מקומי בלבד" : "Guest · local only")}</small></div>
      <Link role="menuitem" to="/profile" onClick={() => close(false)}>{language === "he" ? "פרופיל" : "Profile"}</Link>
      {isCloudAuthenticated && <Link role="menuitem" to="/account/security" onClick={() => close(false)}>{language === "he" ? "אבטחת חשבון" : "Account security"}</Link>}
      {!isCloudAuthenticated && <Link role="menuitem" to="/auth/login" onClick={() => close(false)}>{language === "he" ? "כניסה או יצירת חשבון" : "Sign in or create account"}</Link>}
      <Link role="menuitem" to="/settings" onClick={() => close(false)}>{t("nav.settings")}</Link>
      <Link role="menuitem" to="/about" onClick={() => close(false)}>About / אודות</Link>
      <Link role="menuitem" to="/developer" onClick={() => close(false)}>{t("nav.developer")}</Link>
      <button role="menuitem" type="button" onClick={async () => { await signOut(); navigate("/login", { replace: true }); }}>{t("auth.signOut")}</button>
    </div>
  </div>;

  return <div className="profile-menu">
    <button ref={triggerRef} type="button" className="profile-trigger" aria-expanded={open} aria-haspopup="menu" aria-label={t("a11y.openProfile")} onClick={() => open ? close() : setOpen(true)}>
      <span className="profile-avatar" aria-hidden="true">{user.avatarInitials}</span><span className="profile-trigger-copy"><strong>{name}</strong><span>{status === "authenticated" ? (language === "he" ? "חשבון" : "Account") : (language === "he" ? "אורח" : "Guest")}</span></span>
    </button>
    {menu && createPortal(menu, document.body)}
  </div>;
}
