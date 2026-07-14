import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { aosUi } from "../../aos/aosUiText";

export function AosResearchPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const result = useAosSnapshot();

  return (
    <div className="page aos-research-page">
      <div className="page-heading">
        <h1>{s.researchHeading}</h1>
        <Link to="/aos">{s.backToDashboard}</Link>
      </div>

      {result.kind === "notGenerated" && <p>{s.notGeneratedBody}</p>}

      {result.kind === "ok" && (
        <section className="settings-card" aria-labelledby="aos-research-counts">
          <h2 id="aos-research-counts">{s.researchHeading}</h2>
          <dl className="qa-header-grid">
            <div>
              <dt>{s.researchSources}</dt>
              <dd>{result.snapshot.research.sources}</dd>
            </div>
            <div>
              <dt>{s.researchClaims}</dt>
              <dd>{result.snapshot.research.claims}</dd>
            </div>
            <div>
              <dt>{s.researchCandidates}</dt>
              <dd>{result.snapshot.research.candidates}</dd>
            </div>
            <div>
              <dt>{s.researchReviews}</dt>
              <dd>{result.snapshot.research.reviews}</dd>
            </div>
            <div>
              <dt>{s.researchPublished}</dt>
              <dd>{result.snapshot.research.published}</dd>
            </div>
          </dl>
          <p>
            {ui === "he"
              ? "מקורות מסופקים באופן מפורש, ללא סריקה אוטומטית. ראה מדיניות המחקר לפרטים."
              : "Sources are supplied explicitly, never by autonomous crawling. See the research policy module for details."}
          </p>
        </section>
      )}

      <Link to="/aos/modules">{s.viewAllModules}</Link>
    </div>
  );
}
