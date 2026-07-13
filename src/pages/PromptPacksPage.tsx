import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { findPackedCopies, packedPrompts, promptPacks } from "../prompts/packs";

export function PromptPacksPage() {
  const { language } = useLanguage();
  const { state, importPacked, importPackedSelection } = usePromptLibrary();
  const [packId, setPackId] = useState("all");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const items = useMemo(() => packedPrompts.filter((prompt) =>
    (packId === "all" || prompt.packId === packId) &&
    (difficulty === "all" || prompt.difficulty === difficulty) &&
    `${prompt.title.he} ${prompt.title.en} ${prompt.tags.join(" ")}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [packId, search, difficulty]);
  const text = language === "he" ? {
    title: "חבילות פרומפטים", description: "250 פרומפטים מובנים, דו־לשוניים וניתנים לייבוא לספרייה המקומית.", search: "חיפוש", pack: "חבילה", difficulty: "רמה", all: "הכול", selected: "נבחרו", import: "ייבוא", importSelected: "ייבוא נבחרים", importPack: "ייבוא החבילה", imported: "כבר יובא", back: "הפרומפטים שלי",
  } : {
    title: "Prompt Packs", description: "250 structured bilingual prompts ready to import into your local library.", search: "Search", pack: "Pack", difficulty: "Difficulty", all: "All", selected: "Selected", import: "Import", importSelected: "Import selected", importPack: "Import pack", imported: "Already imported", back: "My Prompts",
  };
  const chosen = packedPrompts.filter((prompt) => selected.includes(prompt.id));
  const activePack = packId === "all" ? [] : packedPrompts.filter((prompt) => prompt.packId === packId);
  return <div className="page prompt-packs-page">
    <header className="page-header"><div><h1>{text.title}</h1><p>{text.description}</p></div><Link to="/prompts">{text.back}</Link></header>
    <section className="prompt-filters" aria-label={text.title}>
      <label>{text.search}<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <label>{text.pack}<select value={packId} onChange={(event) => { setPackId(event.target.value); setSelected([]); }}><option value="all">{text.all}</option>{promptPacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.title[language]} ({pack.count})</option>)}</select></label>
      <label>{text.difficulty}<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">{text.all}</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      <button disabled={!chosen.length} onClick={() => { importPackedSelection(chosen, language); setSelected([]); }}>{text.importSelected} ({chosen.length})</button>
      <button disabled={!activePack.length} onClick={() => importPackedSelection(activePack, language)}>{text.importPack}</button>
    </section>
    <p aria-live="polite">{items.length} · {text.selected}: {selected.length}</p>
    <div className="prompt-grid">{items.map((prompt) => {
      const imported = findPackedCopies(state.prompts, prompt.id).length > 0;
      return <article className="prompt-card" key={prompt.id}>
        <label className="check-filter"><input type="checkbox" checked={selected.includes(prompt.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, prompt.id] : current.filter((id) => id !== prompt.id))} />{text.selected}</label>
        <h2>{prompt.title[language]}</h2><p>{prompt.description[language]}</p>
        <div className="prompt-tags"><span>{prompt.difficulty}</span><span>{prompt.contentLanguage}</span>{prompt.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
        {imported && <p role="status">✓ {text.imported}</p>}
        <button onClick={() => importPacked(prompt, language)}>{text.import}</button>
      </article>;
    })}</div>
  </div>;
}
