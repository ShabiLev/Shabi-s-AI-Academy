import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { categories } from "../prompts/types";
import { categoryLabels, promptUi } from "../prompts/uiText";
import { filterPrompts } from "../prompts/utils";
import { evaluatePrompt } from "../prompts/promptQuality";
import { downloadPrompt } from "../prompts/promptExport";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
import { catalogUi } from "../prompts/catalog/catalogUi";
import { starterCatalog } from "../prompts/catalog";
export function PromptLibraryPage() {
  const { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = promptUi[ui],
    catalogStrings = catalogUi[ui],
    { state, setFilters, remove, favorite, duplicate } = usePromptLibrary(),
    [deleting, setDeleting] = useState<string>(),
    navigate = useNavigate(),
    location = useLocation(),
    items = filterPrompts(
      state.prompts,
      state.filters,
      (c) => categoryLabels[ui][c as keyof typeof categoryLabels.he],
    );
  return (
    <div className="page prompt-library-page">
      <header className="page-header prompt-page-header">
        <div className="page-header-content">
          <h1>{s.library}</h1>
          <p>
            {ui === "he"
              ? "ניהול הפרומפטים המקומיים והניתנים לעריכה בדפדפן זה."
              : "Manage your editable prompts stored in this browser."}
          </p>
          <p>
            {state.prompts.length} {s.total} ·{" "}
            {state.prompts.filter((p) => p.isFavorite).length} {s.favorites}
          </p>
        </div>
        <div className="page-actions">
          <Link className="primary-button" to="/prompts/new">
            {s.newPrompt}
          </Link>
        </div>
      </header>
      <nav
        className="prompt-tabs"
        aria-label={ui === "he" ? "בחירת ספרייה" : "Library view"}
      >
        <Link aria-current="page" to="/prompts">
          {catalogStrings.myPrompts}
        </Link>
        <Link to="/prompts/catalog">
          {catalogStrings.catalog} ({starterCatalog.length})
        </Link>
        <Link to="/prompts/packs">{ui === "he" ? "חבילות פרומפטים" : "Prompt Packs"} (250)</Link>
      </nav>
      {(location.state as { deleted?: boolean } | null)?.deleted && (
        <p role="status">{s.deleted}</p>
      )}
      <section className="prompt-filters" aria-label={s.search}>
        <label className="filter-search">
          {s.search}
          <input
            type="search"
            value={state.filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
        </label>
        <label>
          {s.category}
          <select
            value={state.filters.category}
            onChange={(e) =>
              setFilters({
                category: e.target.value as typeof state.filters.category,
              })
            }
          >
            <option value="all">{s.all}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {categoryLabels[ui][c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {s.language}
          <select
            value={state.filters.language}
            onChange={(e) =>
              setFilters({
                language: e.target.value as typeof state.filters.language,
              })
            }
          >
            <option value="all">{s.all}</option>
            <option value="he">עברית</option>
            <option value="en">English</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label className="check-filter">
          <input
            type="checkbox"
            checked={state.filters.favoritesOnly}
            onChange={(e) => setFilters({ favoritesOnly: e.target.checked })}
          />
          {s.favoritesOnly}
        </label>
        <label>
          {s.sort}
          <select
            value={state.filters.sort}
            onChange={(e) =>
              setFilters({ sort: e.target.value as typeof state.filters.sort })
            }
          >
            <option value="updated">{s.updatedSort}</option>
            <option value="created">{s.createdSort}</option>
            <option value="title">{s.titleSort}</option>
            <option value="quality">{s.qualitySort}</option>
          </select>
        </label>
        <button
          className="secondary-button"
          type="button"
          onClick={() =>
            setFilters({
              search: "",
              category: "all",
              language: "all",
              favoritesOnly: false,
              sort: "updated",
            })
          }
        >
          {s.clear}
        </button>
      </section>
      <p>
        {items.length} {s.results}
      </p>
      {!state.prompts.length ? (
        <section className="prompt-empty">
          <h2>{s.empty}</h2>
          <Link className="primary-button" to="/prompts/new">
            {s.createFirst}
          </Link>
        </section>
      ) : !items.length ? (
        <p>{s.noResults}</p>
      ) : (
        <div className="prompt-grid">
          {items.map((p) => (
            <article className="prompt-card" key={p.id}>
              <button
                className="favorite-button"
                aria-label={p.isFavorite ? s.unfavorite : s.favorite}
                aria-pressed={p.isFavorite}
                onClick={() => favorite(p.id)}
              >
                ★ <span>{p.isFavorite ? s.unfavorite : s.favorite}</span>
              </button>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="prompt-tags">
                <span>{categoryLabels[ui][p.category]}</span>
                <span>{p.language}</span>
                {p.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p>
                {s.quality}: {evaluatePrompt(p).score}/100 · {s.version}{" "}
                {p.version}
              </p>
              <div className="card-actions">
                <Link to={`/prompts/${p.id}`}>{s.view}</Link>
                <Link to={`/prompts/${p.id}/edit`}>{s.edit}</Link>
                <button
                  onClick={() => {
                    const copy = duplicate(p.id, s.copySuffix);
                    if (copy) navigate(`/prompts/${copy.id}/edit`);
                  }}
                >
                  {s.duplicate}
                </button>
                <button onClick={() => downloadPrompt(p, "md", ui)}>
                  {s.export}
                </button>
                <button onClick={() => setDeleting(p.id)}>{s.delete}</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {deleting && (
        <ConfirmDialog
          title={s.confirmDelete}
          description={s.confirmDescription}
          cancel={s.cancel}
          confirm={s.delete}
          onCancel={() => setDeleting(undefined)}
          onConfirm={() => {
            remove(deleting);
            setDeleting(undefined);
          }}
        />
      )}
    </div>
  );
}
