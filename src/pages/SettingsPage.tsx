import { useLanguage } from "../i18n/LanguageContext";
import { useState } from "react";
import { useCourseProgress } from "../course/CourseProgressContext";
import { Link } from "react-router-dom";

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { resetProgress } = useCourseProgress();
  const [resetMessage, setResetMessage] = useState("");
  return (
    <div className="page settings-page">
      <div className="page-heading">
        <h1>{t("pages.settingsTitle")}</h1>
        <p>{t("pages.settingsDescription")}</p>
        <Link to="/how-to#settings">{language === "he" ? "עזרה" : "Help"}</Link>
      </div>
      <section
        className="settings-card"
        aria-labelledby="language-settings-title"
      >
        <h2 id="language-settings-title">{t("settings.languageTitle")}</h2>
        <p>{t("settings.languageDescription")}</p>
        <div
          className="language-options"
          role="radiogroup"
          aria-label={t("settings.languageTitle")}
        >
          <button
            type="button"
            role="radio"
            aria-checked={language === "he"}
            onClick={() => setLanguage("he")}
          >
            <span lang="he">{t("settings.hebrew")}</span>
            {language === "he" && <small>{t("settings.selected")}</small>}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={language === "en"}
            onClick={() => setLanguage("en")}
          >
            <span lang="en">{t("settings.english")}</span>
            {language === "en" && <small>{t("settings.selected")}</small>}
          </button>
        </div>
      </section>
      <section
        className="settings-card"
        aria-labelledby="progress-settings-title"
      >
        <h2 id="progress-settings-title">{t("settings.progressTitle")}</h2>
        <p>{t("settings.progressDescription")}</p>
        <button
          className="danger-button"
          type="button"
          onClick={() => {
            if (window.confirm(t("settings.resetConfirm"))) {
              resetProgress();
              setResetMessage(t("settings.resetSuccess"));
            }
          }}
        >
          {t("settings.resetProgress")}
        </button>
        {resetMessage && <p role="status">{resetMessage}</p>}
      </section>
    </div>
  );
}
