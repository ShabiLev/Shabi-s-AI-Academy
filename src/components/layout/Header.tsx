import { forwardRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../common/Icon";
import { useLanguage } from "../../i18n/LanguageContext";
import type { TranslationKey } from "../../i18n/types";
import { useCommandPalette } from "../../commands";
import { NotificationCenter } from "../workspace/NotificationCenter";

const routeTitles: Record<string, TranslationKey> = {
  "/": "nav.dashboard",
  "/dashboard": "nav.dashboard",
  "/lessons": "nav.lessons",
  "/prompt-library": "nav.prompts",
  "/prompts": "nav.prompts",
  "/agents": "nav.agents",
  "/projects": "nav.projects",
  "/knowledge": "nav.knowledge",
  "/journey": "nav.journey",
  "/roadmap": "nav.roadmap",
  "/changelog": "nav.changelog",
  "/docs": "nav.documentation",
  "/release": "nav.release",
  "/developer": "nav.developer",
  "/radar": "nav.radar",
  "/settings": "nav.settings",
  "/qa": "nav.qa",
  "/how-to": "nav.howTo",
  "/search": "nav.search",
  "/assistant": "nav.assistant",
  "/workflows": "nav.workflows",
  "/analytics": "nav.analytics",
};

export const Header = forwardRef<HTMLButtonElement, { onOpenMenu: () => void }>(
  function Header({ onOpenMenu }, menuRef) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { direction, t } = useLanguage();
    const { openPalette } = useCommandPalette();
    const isDashboard = pathname === "/dashboard";
    const title = t(
      routeTitles[pathname] ??
        (pathname.startsWith("/lessons/")
          ? "nav.lessons"
          : pathname.startsWith("/prompts/")
            ? "nav.prompts"
            : pathname.startsWith("/agents/")
              ? "nav.agents"
              : pathname.startsWith("/workflows/")
                ? "nav.workflows"
              : "nav.dashboard"),
    );
    const goBack = () => {
      const historyIndex = (window.history.state as { idx?: number } | null)
        ?.idx;
      if (typeof historyIndex === "number" && historyIndex > 0) navigate(-1);
      else navigate("/dashboard");
    };

    return (
      <header className="top-header">
        <div className="mobile-header-actions">
          <button
            ref={menuRef}
            type="button"
            className="icon-button menu-button"
            onClick={onOpenMenu}
            aria-label={t("a11y.openMenu")}
          >
            <Icon name="menu" />
          </button>
          {!isDashboard && (
            <>
              <button
                type="button"
                className="icon-button mobile-route-button"
                onClick={goBack}
                aria-label={t("a11y.back")}
              >
                <Icon
                  name="arrow"
                  className={direction === "ltr" ? "back-icon" : ""}
                />
              </button>
              <button
                type="button"
                className="icon-button mobile-route-button"
                onClick={() => navigate("/dashboard")}
                aria-label={t("a11y.home")}
              >
                <Icon name="home" />
              </button>
            </>
          )}
        </div>
        <div className="header-copy">
          <strong>{title}</strong>
          <span>{t("header.workspace")}</span>
        </div>
        <div className="header-tools">
          <button type="button" className="icon-button command-trigger" onClick={openPalette} aria-label={direction === "rtl" ? "פתיחת לוח הפקודות" : "Open Command Palette"}><Icon name="prompts" /></button>
          <NotificationCenter />
          <span className="compact-status">
            <span className="status-dot" />
            {t("header.online")}
          </span>
        </div>
      </header>
    );
  },
);
