import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { categories } from "../prompts/types";
import { categoryLabels } from "../prompts/uiText";
import { catalogUi } from "../prompts/catalog/catalogUi";
import {
  defaultCatalogFilters,
  filterCatalog,
  findImportedCopies,
  starterCatalog,
  type CatalogEntry,
  type CatalogFilters,
} from "../prompts/catalog";

export function PromptCatalogPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = catalogUi[ui];
  const { state, importFromCatalog } = usePromptLibrary();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<CatalogFilters>(defaultCatalogFilters);
  const [duplicate, setDuplicate] = useState<{
    entry: CatalogEntry;
    existingId: string;
  }>();
  const firstDialogButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const items = filterCatalog(starterCatalog, filters);
  const patch = (value: Partial<CatalogFilters>) =>
    setFilters((current) => ({ ...current, ...value }));
  const requestImport = (entry: CatalogEntry) => {
    const existing = findImportedCopies(state.prompts, entry.id)[0];
    if (existing) {
      returnFocus.current = document.activeElement as HTMLElement;
      setDuplicate({ entry, existingId: existing.id });
    } else navigate(`/prompts/${importFromCatalog(entry).id}`);
  };
  useEffect(() => {
    if (!duplicate) return;
    firstDialogButton.current?.focus();
    return () => returnFocus.current?.focus();
  }, [duplicate]);
  return (
    <div className="page prompt-catalog-page">
      <header className="page-header prompt-page-header">
        <div className="page-header-content">
          <h1>{s.title}</h1>
          <p>{s.description}</p>
          <p>
            <strong>{s.source}:</strong> prompts.chat ·{" "}
            <strong>{s.license}:</strong> CC0-1.0
          </p>
        </div>
        <div className="page-actions">
          <Link to="/how-to#starter-catalog">{s.help}</Link>
        </div>
      </header>
      <nav
        className="prompt-tabs"
        aria-label={ui === "he" ? "בחירת ספרייה" : "Library view"}
      >
        <Link to="/prompts">{s.myPrompts}</Link>
        <Link aria-current="page" to="/prompts/catalog">
          {s.catalog}
        </Link>
      </nav>
      <p className="catalog-notice">{s.noAffiliation}</p>
      <section className="prompt-filters catalog-filters" aria-label={s.search}>
        <label className="filter-search">
          {s.search}
          <input
            type="search"
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
          />
        </label>
        <label>
          {s.category}
          <select
            value={filters.category}
            onChange={(e) =>
              patch({ category: e.target.value as CatalogFilters["category"] })
            }
          >
            <option value="all">{s.all}</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {categoryLabels[ui][category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {s.language}
          <select
            value={filters.language}
            onChange={(e) =>
              patch({ language: e.target.value as CatalogFilters["language"] })
            }
          >
            <option value="all">{s.all}</option>
            <option value="en">English</option>
            <option value="he">עברית</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label>
          {s.sort}
          <select
            value={filters.sort}
            onChange={(e) =>
              patch({ sort: e.target.value as CatalogFilters["sort"] })
            }
          >
            <option value="title">{ui === "he" ? "שם" : "Title"}</option>
            <option value="category">{s.category}</option>
          </select>
        </label>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setFilters(defaultCatalogFilters)}
        >
          {s.clear}
        </button>
      </section>
      <p aria-live="polite">
        {s.results}: {items.length}
      </p>
      {!items.length ? (
        <section className="prompt-empty">
          <h2>{s.noResults}</h2>
        </section>
      ) : (
        <div className="prompt-grid catalog-grid">
          {items.map((entry) => {
            const existing = findImportedCopies(state.prompts, entry.id)[0];
            return (
              <article className="prompt-card catalog-card" key={entry.id}>
                <h2>{entry.title}</h2>
                <p>{entry.description}</p>
                <div className="prompt-tags">
                  <span>{categoryLabels[ui][entry.category]}</span>
                  {entry.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <small>
                  {s.source}: prompts.chat · {s.license}: CC0-1.0
                </small>
                {existing && <p role="status">✓ {s.imported}</p>}
                <div className="card-actions">
                  <Link to={`/prompts/catalog/${entry.id}`}>{s.preview}</Link>
                  {existing ? (
                    <>
                      <Link to={`/prompts/${existing.id}`}>{s.openCopy}</Link>
                      <button onClick={() => requestImport(entry)}>
                        {s.another}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => requestImport(entry)}>
                      {s.import}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {duplicate && (
        <div className="modal-layer" role="presentation">
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-duplicate-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") setDuplicate(undefined);
            }}
          >
            <h2 id="catalog-duplicate-title">{s.duplicateTitle}</h2>
            <p>{s.duplicateText}</p>
            <div>
              <button
                ref={firstDialogButton}
                onClick={() => {
                  navigate(`/prompts/${duplicate.existingId}`);
                  setDuplicate(undefined);
                }}
              >
                {s.openCopy}
              </button>
              <button
                onClick={() => {
                  const prompt = importFromCatalog(duplicate.entry);
                  setDuplicate(undefined);
                  navigate(`/prompts/${prompt.id}`);
                }}
              >
                {s.another}
              </button>
              <button onClick={() => setDuplicate(undefined)}>
                {s.cancel}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
