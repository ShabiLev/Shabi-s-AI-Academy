import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useWorkspace } from "../../workspace";

export function NotificationCenter() {
  const { language } = useLanguage();
  const { state, unreadCount, markRead, markAllRead, deleteNotification, reset } = useWorkspace();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const he = language === "he";

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),select,input,textarea,[tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button")?.focus());
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [open]);

  return <div className="notification-center">
    <button ref={triggerRef} type="button" className="icon-button" aria-haspopup="dialog" aria-expanded={open} aria-controls="notification-panel" onClick={() => setOpen((value) => !value)} aria-label={he ? `התראות, ${unreadCount} לא נקראו` : `Notifications, ${unreadCount} unread`}>◉{unreadCount > 0 && <span>{unreadCount}</span>}</button>
    {open && <section ref={panelRef} id="notification-panel" role="dialog" aria-modal="false" aria-labelledby="notification-title">
      <header><h2 id="notification-title">{he ? "התראות מקומיות" : "Local notifications"}</h2><button type="button" aria-label={he ? "סגירת ההתראות" : "Close notifications"} onClick={() => close()}>×</button></header>
      <div className="notification-toolbar"><button type="button" onClick={markAllRead}>{he ? "סימון הכול כנקרא" : "Mark all read"}</button></div>
      {state.notifications.length ? <ul>{state.notifications.slice().reverse().map((item) => <li key={item.id} className={item.read ? "read" : "unread"}><strong>{item.title[language]}</strong><p>{item.message[language]}</p><div>{item.actionRoute && <Link to={item.actionRoute} onClick={() => markRead(item.id)}>{he ? "פתיחה" : "Open"}</Link>}<button type="button" onClick={() => markRead(item.id)}>{he ? "נקרא" : "Read"}</button><button type="button" onClick={() => deleteNotification(item.id)}>{he ? "מחיקה" : "Delete"}</button></div></li>)}</ul> : <p>{he ? "אין התראות." : "No notifications."}</p>}
      {state.notifications.length > 0 && <button type="button" onClick={() => reset("notifications")}>{he ? "ניקוי הכול" : "Clear all"}</button>}
    </section>}
  </div>;
}
