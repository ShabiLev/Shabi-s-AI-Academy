import { Link } from "react-router-dom";
import { RealityBadge } from "../components/outcomes";
import { useLanguage } from "../i18n/LanguageContext";
import { outcomeRealityToBadgeMode, useOutcomes } from "../outcomes";

const text = {
  he: { title: "תוצאות עבודה", description: "כל התוצאות שנוצרו ממשימות, פרויקטים ומודולים אחרים במקום אחד.", empty: "עדיין אין תוצאות שמורות.", open: "פתיחה" },
  en: { title: "Outcomes", description: "Every result created from Missions, Projects, and other modules, in one place.", empty: "No outcomes have been saved yet.", open: "Open" },
};

export function OutcomesPage() {
  const { language } = useLanguage();
  const { outcomes } = useOutcomes();
  const copy = text[language];
  const visible = [...outcomes].filter((outcome) => outcome.status !== "archived").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="page">
      <header className="page-header">
        <div><h1>{copy.title}</h1><p>{copy.description}</p></div>
      </header>
      {!visible.length ? <h2>{copy.empty}</h2> : (
        <div className="prompt-grid">
          {visible.map((outcome) => (
            <article className="prompt-card" key={outcome.id}>
              <RealityBadge language={language} mode={outcomeRealityToBadgeMode(outcome.realityMode)} />
              <h2>{outcome.title}</h2>
              <p>{outcome.summary}</p>
              <Link to={`/outcomes/${outcome.id}`}>{copy.open}</Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
