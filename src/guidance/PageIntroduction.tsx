import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { getAreaLabel, getPageById, resolvePageMetadata } from "./pageRegistry";
import { localize } from "./types";
import { useGuidedTour } from "./tours/GuidedTourContext";
import { GlossaryTrigger } from "../glossary/GlossaryTrigger";

export function PageIntroduction() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const page = resolvePageMetadata(pathname);
  const parent = page.parent ? getPageById(page.parent) : undefined;
  const { startTour } = useGuidedTour();
  if (page.id === "onboarding") return null;

  return <section className="page-introduction" aria-labelledby="page-context-title">
    <nav className="breadcrumbs" aria-label={language === "he" ? "פירורי לחם" : "Breadcrumbs"}>
      <Link to="/">{language === "he" ? "בית" : "Home"}</Link>
      {page.area !== "home" && <><span aria-hidden="true">›</span><span>{localize(getAreaLabel(page.area), language)}</span></>}
      {parent && <><span aria-hidden="true">›</span><Link to={parent.route}>{localize(parent.title, language)}</Link></>}
      {page.id !== "dashboard" && <><span aria-hidden="true">›</span><span aria-current="page">{localize(page.title, language)}</span></>}
    </nav>
    <div className="page-introduction-row">
      <div><p className="eyebrow">{localize(getAreaLabel(page.area), language)}</p><p className="page-context-title" id="page-context-title">{localize(page.title, language)}</p><p>{localize(page.summary, language)}</p>{page.glossaryTerms.length > 0 && <div className="page-glossary-terms" aria-label={language === "he" ? "מונחים קשורים" : "Related terms"}>{page.glossaryTerms.map((termId) => <GlossaryTrigger key={termId} termId={termId} />)}</div>}</div>
      <div className="page-introduction-actions">
        {page.primaryAction && <Link className="button button-primary" to={page.primaryAction.to}>{localize(page.primaryAction.label, language)}</Link>}
        {page.secondaryAction && <Link className="button button-secondary" to={page.secondaryAction.to}>{localize(page.secondaryAction.label, language)}</Link>}
        <Link className="text-link" to={`/help?article=${page.helpId}`}>{language === "he" ? "עזרה למסך זה" : "Help for this screen"}</Link>
        {page.tourId && <button className="text-button" type="button" onClick={() => startTour(page.tourId!)}>{language === "he" ? "סיור מודרך" : "Guided tour"}</button>}
      </div>
    </div>
  </section>;
}
