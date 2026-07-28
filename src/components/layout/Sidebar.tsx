import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth";
import { useExperience } from "../../experience";
import { useLanguage } from "../../i18n/LanguageContext";
import { Icon } from "../common/Icon";
import { navigationGroups } from "./navigation";
import { ProfileMenu } from "./ProfileMenu";
import { useGuidedTour } from "../../guidance/tours";

const storageKey = (userId: string) => `shabis-ai-academy:navigation-groups:v3:${userId}`;
function loadGroupState(key: string): Record<string, boolean> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([group, open]) => /^[a-z-]{1,30}$/.test(group) && typeof open === "boolean"));
  } catch { return {}; }
}

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { mode, developerModeEnabled, setMode } = useExperience();
  const walkthrough = useGuidedTour();
  const key = storageKey(user?.id ?? "anonymous");
  const currentGroup = useMemo(() => navigationGroups.find((group) => group.items.some((item) => pathname === item.to || (!item.end && pathname.startsWith(`${item.to}/`))))?.id, [pathname]);
  const [stored, setStored] = useState<{ key: string; groups: Record<string, boolean> }>(() => ({ key, groups: loadGroupState(key) }));
  const groupState = stored.key === key ? stored.groups : loadGroupState(key);
  const visible = (visibility: "all" | "advanced" | "developer" = "all") => visibility === "all" || (visibility === "advanced" && mode === "advanced") || (visibility === "developer" && developerModeEnabled);
  const toggle = (id: string, open: boolean) => {
    const next = { ...groupState, [id]: open };
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Optional per-user preference. */ }
    setStored({ key, groups: next });
  };

  return <div className={mobile ? "sidebar sidebar-mobile" : "sidebar"}>
    <div className="brand-mark"><span className="brand-orbit" aria-hidden="true">A</span><div><strong>{t("brand.name")}</strong><span>{t("brand.tagline")}</span></div></div>
    <div className="sidebar-profile"><ProfileMenu mobile={mobile} /></div>
    <button className="sidebar-mode-switch" data-walkthrough="experience-mode" type="button" aria-pressed={mode === "advanced"} onClick={() => setMode(mode === "beginner" ? "advanced" : "beginner")}>
      <strong>{language === "he" ? (mode === "beginner" ? "מצב מתחילים" : "מצב מתקדם") : (mode === "beginner" ? "Beginner Mode" : "Advanced Mode")}</strong>
      <span>{language === "he" ? (mode === "beginner" ? "הצגת כלים מתקדמים" : "חזרה לניווט ממוקד") : (mode === "beginner" ? "Show advanced tools" : "Return to focused navigation")}</span>
    </button>
    <nav aria-label={t("header.workspace")} className="main-nav" data-walkthrough={mobile ? undefined : "main-navigation"}>
      {navigationGroups.map((group) => {
        const items = group.items.filter((item) => visible(item.visibility));
        if (!items.length) return null;
        const expanded = Boolean(groupState[group.id]) || currentGroup === group.id;
        return <details key={group.id} open={expanded} onToggle={(event) => {
          if (event.currentTarget.open !== expanded) toggle(group.id, event.currentTarget.open);
        }}><summary>{group.title[language]}</summary><div>{items.map((item) => {
          const walkthroughTarget = item.to === "/lessons" ? "lessons"
            : item.to === "/prompts" ? "creation-tools"
              : item.to === "/radar" ? "radar"
                : item.to === "/help" ? "help"
                  : undefined;
          return <NavLink key={item.to} to={item.to} end={item.end} data-walkthrough={walkthroughTarget} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><Icon name={item.icon} /><span>{t(item.label)}</span></NavLink>;
        })}</div></details>;
      })}
    </nav>
    {walkthrough.firstVisit.status === "completed" && <button
      type="button"
      className="walkthrough-replay"
      data-walkthrough="replay"
      aria-label={language === "he" ? "הפעלת WALK ME מחדש" : "Replay WALK ME"}
      title={language === "he" ? "הפעלת WALK ME מחדש" : "Replay WALK ME"}
      onClick={() => {
        walkthrough.restartFirstVisit();
        onNavigate?.();
      }}
    >
      <Icon name="lessons" />
      <span>{language === "he" ? "הדרכה" : "Guide"}</span>
    </button>}
  </div>;
}
