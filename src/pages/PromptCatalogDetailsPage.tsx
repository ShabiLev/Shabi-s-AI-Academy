import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { catalogUi } from "../prompts/catalog/catalogUi";
import { findImportedCopies, starterCatalog } from "../prompts/catalog";

export function PromptCatalogDetailsPage() {
  const { catalogId = "" } = useParams();
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = catalogUi[ui];
  const { state, importFromCatalog } = usePromptLibrary();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const entry = starterCatalog.find((item) => item.id === catalogId);
  if (!entry)
    return (
      <div className="page">
        <h1>{s.noResults}</h1>
        <Link to="/prompts/catalog">{s.catalog}</Link>
      </div>
    );
  const existing = findImportedCopies(state.prompts, entry.id)[0];
  return (
    <div className="page prompt-details catalog-details">
      <Link to="/prompts/catalog">← {s.catalog}</Link>
      <header>
        <h1>{entry.title}</h1>
        <p>{entry.description}</p>
      </header>
      <dl>
        <div>
          <dt>{s.source}</dt>
          <dd>
            <a href={entry.sourceRepository} target="_blank" rel="noreferrer">
              {entry.sourceName}
            </a>
          </dd>
        </div>
        <div>
          <dt>{s.license}</dt>
          <dd>{entry.sourceLicense}</dd>
        </div>
        <div>
          <dt>{s.language}</dt>
          <dd>{entry.language}</dd>
        </div>
        <div>
          <dt>{s.category}</dt>
          <dd>{entry.category}</dd>
        </div>
      </dl>
      <pre className="details-prompt catalog-prompt-text">
        {entry.curatedContent ?? entry.prompt}
      </pre>
      <p className="catalog-notice">{s.noAffiliation}</p>
      <div className="card-actions">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(entry.prompt);
            setMessage(s.copied);
          }}
        >
          {s.copy}
        </button>
        {existing ? (
          <Link to={`/prompts/${existing.id}`}>{s.openCopy}</Link>
        ) : (
          <button
            onClick={() => navigate(`/prompts/${importFromCatalog(entry).id}`)}
          >
            {s.import}
          </button>
        )}
      </div>
      <p aria-live="polite">{message}</p>
    </div>
  );
}
