import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { aosUi } from "../../aos/aosUiText";

export function AosReleasesPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const result = useAosSnapshot();
  const releaseModules =
    result.kind === "ok" ? result.snapshot.modules.items.filter((m) => m.category === "release") : [];

  return (
    <div className="page aos-releases-page">
      <div className="page-heading">
        <h1>{s.releasesHeading}</h1>
        <Link to="/aos">{s.backToDashboard}</Link>
      </div>

      {result.kind === "notGenerated" && <p>{s.notGeneratedBody}</p>}

      {result.kind === "ok" && (
        <section className="settings-card" aria-labelledby="aos-release-current">
          <h2 id="aos-release-current">{s.appVersion}</h2>
          <p>{result.snapshot.applicationVersion}</p>
          <Link to="/release">{ui === "he" ? "מרכז שחרור" : "Release Center"}</Link>
        </section>
      )}

      {releaseModules.length > 0 && (
        <section className="settings-card" aria-labelledby="aos-release-modules">
          <h2 id="aos-release-modules">{s.modulesHeading}</h2>
          <ul>
            {releaseModules.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
        </section>
      )}

      <Link to="/aos/modules">{s.viewAllModules}</Link>
    </div>
  );
}
