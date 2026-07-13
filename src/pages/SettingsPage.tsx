import { useLanguage } from "../i18n/LanguageContext";
import { useState } from "react";
import { useCourseProgress } from "../course/CourseProgressContext";
import { Link } from "react-router-dom";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { useRuntime } from "../runtime/RuntimeContext";
import { useProjects } from "../projects";
import { useKnowledge } from "../knowledge";

export function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { resetProgress } = useCourseProgress();
  const prompts = usePromptLibrary();
  const agents = useAgentLibrary();
  const runtime = useRuntime();
  const projects = useProjects();
  const knowledge = useKnowledge();
  const [resetMessage, setResetMessage] = useState("");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("shabis-ai-academy.motion") === "reduced");
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
      <section className="settings-card">
        <h2>{language === "he" ? "תנועה ופרטיות" : "Motion and privacy"}</h2>
        <label className="check-filter"><input type="checkbox" checked={reducedMotion} onChange={(event) => { setReducedMotion(event.target.checked); localStorage.setItem("shabis-ai-academy.motion", event.target.checked ? "reduced" : "full"); document.documentElement.dataset.motion = event.target.checked ? "reduced" : "full"; }} />{language === "he" ? "הפחתת תנועה" : "Reduce motion"}</label>
        <p>{language === "he" ? "הנתונים נשמרים בדפדפן. אין להזין מידע סודי או רגיש." : "Data stays in this browser. Do not enter confidential or sensitive information."}</p>
      </section>
      <section className="settings-card">
        <h2>{language === "he" ? "איפוס לפי תחום" : "Domain resets"}</h2>
        <p>{language === "he" ? "כל פעולה משפיעה רק על התחום המסומן." : "Each action affects only the named domain."}</p>
        <div className="card-actions"><button onClick={() => prompts.clear()}>My Prompts</button><button onClick={() => agents.clear()}>My Agents</button><button onClick={() => runtime.clearHistory()}>Run History</button><button onClick={() => projects.clear()}>Projects</button><button onClick={() => knowledge.clear()}>Knowledge Base</button></div>
      </section>
      <section className="settings-card">
        <h2>{language === "he" ? "ייצוא וייבוא מקומי" : "Local export and import"}</h2>
        <p>{language === "he" ? "קובץ הייצוא עשוי להכיל תוכן שכתבת. בדוק אותו לפני שיתוף." : "The export may contain content you authored. Review it before sharing."}</p>
        <button onClick={() => { const keys = ["shabi-ai-academy.course-progress.v1", "shabi-ai-academy.prompt-library.v1", "shabi-ai-academy.agent-library.v1", "shabis-ai-academy.runtime.runs.v1", "shabis-ai-academy.projects.v1", "shabis-ai-academy.knowledge.v1"]; const data = Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])); const url = URL.createObjectURL(new Blob([JSON.stringify({ schemaVersion: 1, data }, null, 2)], { type: "application/json" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "shabis-ai-academy-local-export.json"; anchor.click(); URL.revokeObjectURL(url); }}>{language === "he" ? "ייצוא" : "Export"}</button>
        <label>{language === "he" ? "ייבוא קובץ" : "Import file"}<input type="file" accept="application/json" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const parsed = JSON.parse(await file.text()) as { schemaVersion?: number; data?: Record<string, string | null> }; if (parsed.schemaVersion !== 1 || !parsed.data) throw new Error(); const allowed = new Set(["shabi-ai-academy.course-progress.v1", "shabi-ai-academy.prompt-library.v1", "shabi-ai-academy.agent-library.v1", "shabis-ai-academy.runtime.runs.v1", "shabis-ai-academy.projects.v1", "shabis-ai-academy.knowledge.v1"]); for (const [key, value] of Object.entries(parsed.data)) if (allowed.has(key) && typeof value === "string") { JSON.parse(value); localStorage.setItem(key, value); } location.reload(); } catch { setResetMessage(language === "he" ? "קובץ הייבוא אינו תקין." : "Import file is invalid."); } }} /></label>
        <Link to="/developer">{language === "he" ? "פתיחת מצב מפתחים" : "Open Developer Mode"}</Link>
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
