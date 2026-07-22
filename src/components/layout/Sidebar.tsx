import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth";
import { useExperience } from "../../experience";
import { useLanguage } from "../../i18n/LanguageContext";
import { Icon } from "../common/Icon";
import { navigationGroups } from "./navigation";
import { ProfileMenu } from "./ProfileMenu";

const storageKey = (userId: string) => `shabis-ai-academy:navigation-groups:v2:${userId}`;

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
  const { mode, developerModeEnabled } = useExperience();
  const key = storageKey(user?.id ?? "anonymous");
  const currentGroup = useMemo(() => navigationGroups.find((group) => group.items.some((item) => pathname === item.to || (!item.end && pathname.startsWith(`${item.to}/`))))?.id, [pathname]);
  const [stored, setStored] = useState<{ key: string; groups: Record<string, boolean> }>(() => ({ key, groups: loadGroupState(key) }));
  const groupState = stored.key === key ? stored.groups : loadGroupState(key);
  const names = language === "he" ? { home: "בית", learn: "ללמוד", build: "ליצור", workspace: "סביבת העבודה", more: "עוד" } : { home: "Home", learn: "Learn", build: "Build", workspace: "Workspace", more: "More" };
  const visible = (visibility: "all" | "advanced" | "developer" = "all") => visibility === "all" || (visibility === "advanced" && mode === "advanced") || (visibility === "developer" && developerModeEnabled);
  const toggle = (id: string, open: boolean) => {
    const next = { ...groupState, [id]: open };
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Optional per-user preference. */ }
    setStored({ key, groups: next });
  };

  return <div className={mobile ? "sidebar sidebar-mobile" : "sidebar"}>
    <div className="brand-mark"><span className="brand-orbit" aria-hidden="true">A</span><div><strong>{t("brand.name")}</strong><span>{t("brand.tagline")}</span></div></div>
    <div className="sidebar-profile"><ProfileMenu mobile={mobile} /></div>
    <nav aria-label={t("header.workspace")} className="main-nav">
      {navigationGroups.map((group) => {
        const items = group.items.filter((item) => visible(item.visibility));
        if (!items.length) return null;
        const expanded = Boolean(groupState[group.id]) || currentGroup === group.id;
        return <details key={group.id} open={expanded} onToggle={(event) => {
          if (event.currentTarget.open !== expanded) toggle(group.id, event.currentTarget.open);
        }}><summary>{names[group.id]}</summary><div>{items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><Icon name={item.icon} /><span>{t(item.label)}</span></NavLink>)}</div></details>;
      })}
    </nav>
  </div>;
}
