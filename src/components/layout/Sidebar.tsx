import { NavLink } from "react-router-dom";
import { Icon } from "../common/Icon";
import { useLanguage } from "../../i18n/LanguageContext";
import { navigationGroups } from "./navigation";
import { ProfileMenu } from "./ProfileMenu";

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { t, language } = useLanguage();
  const groupNames = language === "he" ? { learn: "למידה", build: "בנייה", workspace: "סביבת עבודה", system: "מערכת" } : { learn: "Learn", build: "Build", workspace: "Workspace", system: "System" };
  return <div className={mobile ? "sidebar sidebar-mobile" : "sidebar"}>
    <div className="brand-mark"><span className="brand-orbit" aria-hidden="true">A</span><div><strong>{t("brand.name")}</strong><span>{t("brand.tagline")}</span></div></div>
    <div className="sidebar-profile"><ProfileMenu /></div>
    <nav aria-label={t("header.workspace")} className="main-nav">
      {navigationGroups.map((group) => <details key={group.id} open><summary>{groupNames[group.id]}</summary><div>{group.items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><Icon name={item.icon} /><span>{t(item.label)}</span></NavLink>)}</div></details>)}
    </nav>
  </div>;
}
