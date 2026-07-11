import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { categoryLabels, promptUi } from "../prompts/uiText";
import { buildPrompt } from "../prompts/promptTemplate";
import { evaluatePrompt } from "../prompts/promptQuality";
import { downloadPrompt } from "../prompts/promptExport";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
export function PromptDetailsPage() {
  const { promptId = "" } = useParams(),
    { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = promptUi[ui],
    { get, remove, favorite, duplicate } = usePromptLibrary(),
    navigate = useNavigate(),
    [deleting, setDeleting] = useState(false),
    [message, setMessage] = useState(""),
    p = get(promptId);
  if (!p)
    return (
      <div className="page">
        <h1>{s.notFound}</h1>
        <Link to="/prompts">{s.back}</Link>
      </div>
    );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildPrompt(p, ui));
      setMessage(s.copied);
    } catch {
      setMessage(s.copyError);
    }
  };
  return (
    <div className="page prompt-details">
      <Link to="/prompts">← {s.back}</Link>
      <header>
        <button
          className="favorite-button"
          aria-label={p.isFavorite ? s.unfavorite : s.favorite}
          aria-pressed={p.isFavorite}
          onClick={() => favorite(p.id)}
        >
          ★ {p.isFavorite ? s.unfavorite : s.favorite}
        </button>
        <h1>{p.title}</h1>
        <p>{p.description}</p>
      </header>
      <dl>
        <div>
          <dt>{s.category}</dt>
          <dd>{categoryLabels[ui][p.category]}</dd>
        </div>
        <div>
          <dt>{s.language}</dt>
          <dd>{p.language}</dd>
        </div>
        <div>
          <dt>{s.version}</dt>
          <dd aria-label={`${s.version} ${p.version}`}>{p.version}</dd>
        </div>
        <div>
          <dt>{s.quality}</dt>
          <dd>{evaluatePrompt(p).score}/100</dd>
        </div>
      </dl>
      <pre className="details-prompt">{buildPrompt(p, ui)}</pre>
      <div className="card-actions">
        <Link to={`/prompts/${p.id}/edit`}>{s.edit}</Link>
        <button
          onClick={() => {
            const n = duplicate(p.id, s.copySuffix);
            if (n) navigate(`/prompts/${n.id}/edit`);
          }}
        >
          {s.duplicate}
        </button>
        <button onClick={copy}>{s.copy}</button>
        <button onClick={() => downloadPrompt(p, "txt", ui)}>{s.txt}</button>
        <button onClick={() => downloadPrompt(p, "md", ui)}>{s.md}</button>
        <button onClick={() => setDeleting(true)}>{s.delete}</button>
      </div>
      <p aria-live="polite">{message}</p>
      {deleting && (
        <ConfirmDialog
          title={s.confirmDelete}
          description={s.confirmDescription}
          cancel={s.cancel}
          confirm={s.delete}
          onCancel={() => setDeleting(false)}
          onConfirm={() => {
            remove(p.id);
              navigate("/prompts", { state: { deleted: true } });
          }}
        />
      )}
    </div>
  );
}
