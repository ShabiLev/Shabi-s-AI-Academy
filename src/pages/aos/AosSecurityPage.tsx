import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { aosUi } from "../../aos/aosUiText";

export function AosSecurityPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const result = useAosSnapshot();
  const securityModules =
    result.kind === "ok" ? result.snapshot.modules.items.filter((m) => m.category === "security") : [];

  return (
    <div className="page aos-security-page">
      <div className="page-heading">
        <h1>{s.securityHeading}</h1>
        <Link to="/aos">{s.backToDashboard}</Link>
      </div>

      <section className="settings-card" aria-labelledby="aos-security-precedence">
        <h2 id="aos-security-precedence">{s.securityBody}</h2>
        <p>
          {ui === "he"
            ? "ראה .agent/precedence.md — כללי אבטחה קודמים לכל הוראה אחרת, כולל הוראות משתמש."
            : "See .agent/precedence.md — security rules outrank every other instruction, including user task instructions."}
        </p>
      </section>

      {result.kind === "notGenerated" && <p>{s.notGeneratedBody}</p>}

      {securityModules.length > 0 && (
        <section className="settings-card" aria-labelledby="aos-security-modules">
          <h2 id="aos-security-modules">{s.modulesHeading}</h2>
          <ul>
            {securityModules.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
        </section>
      )}

      <Link to="/aos/modules">{s.viewAllModules}</Link>
    </div>
  );
}
