import { NavLink } from "react-router-dom";
import { Icon } from "../common/Icon";
import { useLanguage } from "../../i18n/LanguageContext";
import { useExperience } from "../../experience";
import { navigationGroups } from "./navigation";
import { ProfileMenu } from "./ProfileMenu";

const GROUP_STORAGE_KEY = "shabis-ai-academy:navigation-groups:v1";

function loadGroupState(): Record<string, boolean> {
  try {
    const value = JSON.parse(localStorage.getItem(GROUP_STORAGE_KEY) ?? "null") as unknown;
    return value && typeof value === "object" ? value as Record<string, boolean> : {};
  } catch { return {}; }
}

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t, language } = useLanguage();
  const { mode, developerModeEnabled } = useExperience();
  const groupNames = language === "he"
    ? { home: "בית", learn: "ללמוד", build: "ליצור", workspace: "סביבת העבודה", more: "עוד" }
    : { home: "Home", learn: "Learn", build: "Build", workspace: "Workspace", more: "More" };
  const groupState = loadGroupState();
  const isVisible = (visibility: "all" | "advanced" | "developer" = "all") => visibility === "all" || (visibility === "advanced" && mode === "advanced") || (visibility === "developer" && developerModeEnabled);

  return <div className={mobile ? "sidebar sidebar-mobile" : "sidebar"}>
    <div className="brand-mark"><span className="brand-orbit" aria-hidden="true">A</span><div><strong>{t("brand.name")}</strong><span>{t("brand.tagline")}</span></div></div>
    <div className="sidebar-profile"><ProfileMenu mobile={mobile} /></div>
    <nav aria-label={t("header.workspace")} className="main-nav">
      {navigationGroups.map((group) => {
        const items = group.items.filter((item) => isVisible(item.visibility));
        if (!items.length) return null;
        return <details key={group.id} open={groupState[group.id] ?? group.id !== "more"} onToggle={(event) => {
          try { localStorage.setItem(GROUP_STORAGE_KEY, JSON.stringify({ ...loadGroupState(), [group.id]: event.currentTarget.open })); }
          catch { /* Optional navigation preference. */ }
        }}>
          <summary>{groupNames[group.id]}</summary>
          <div>{items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><Icon name={item.icon} /><span>{t(item.label)}</span></NavLink>)}</div>
        </details>;
      })}
    </nav>
  </div>;
}
