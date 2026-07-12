import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
import { useLanguage } from "../i18n/LanguageContext";
import { useRuntime } from "../runtime/RuntimeContext";
import {
  localizeRuntimeText,
  modeLabels,
  runtimeUi,
  statusLabels,
} from "../runtime/runtimeUi";
export function RunDetailsPage() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = runtimeUi[ui];
  const runtime = useRuntime();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const run = runId ? runtime.getRun(runId) : undefined;
  if (!run)
    return (
      <div className="page">
        <h1>{s.notFound}</h1>
        <p>{s.notFoundText}</p>
        <Link to="/runs">{s.back}</Link>
      </div>
    );
  return (
    <div className="page runtime-details">
      <header className="page-header">
        <div className="page-header-content">
          <p>
            <Link to="/runs">{s.back}</Link>
          </p>
          <h1>{run.request.input}</h1>
          <p className="runtime-privacy">{s.privacy}</p>
        </div>
        <div className="page-actions">
          <Link to="/how-to#run-details">{s.help}</Link>
          <button
            className="destructive"
            onClick={() => setConfirmDelete(true)}
          >
            {s.delete}
          </button>
        </div>
      </header>
      <section className="runtime-facts" aria-label={s.request}>
        <dl>
          <div>
            <dt>ID</dt>
            <dd className="code-value" data-visual-mask="runtime-id">
              {run.id}
            </dd>
          </div>
          <div>
            <dt>{s.mode}</dt>
            <dd>{modeLabels[ui][run.request.mode]}</dd>
          </div>
          <div>
            <dt>{s.status}</dt>
            <dd>
              <span className={`runtime-status status-${run.result.status}`}>
                {statusLabels[ui][run.result.status]}
              </span>
            </dd>
          </div>
          <div>
            <dt>{s.provider}</dt>
            <dd>{run.request.providerId}</dd>
          </div>
          <div>
            <dt>{s.attempts}</dt>
            <dd>{run.result.attempts}</dd>
          </div>
        </dl>
      </section>
      {run.request.mode === "mock" && run.result.output && (
        <section>
          <h2>{s.output}</h2>
          <p>{s.simulated}</p>
          <pre className="runtime-output">{run.result.output}</pre>
        </section>
      )}
      {run.result.dryRunPreview && (
        <section className="dry-run-preview">
          <h2>{s.dryRun}</h2>
          <p>{ui === "he" ? s.dryLabel : run.result.dryRunPreview.label}</p>
          <h3>{s.request}</h3>
          <pre className="runtime-output">
            {run.result.dryRunPreview.assembledPrompt}
          </pre>
          <h3>{s.plannedTools}</h3>
          <ul>
            {run.result.dryRunPreview.plannedTools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          <p>{run.result.dryRunPreview.privacyNotice}</p>
        </section>
      )}
      {run.result.warnings.length > 0 && (
        <section>
          <h2>{s.warnings}</h2>
          <ul>
            {run.result.warnings.map((warning) => (
              <li key={warning}>{localizeRuntimeText(ui, warning)}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2>{s.validation}</h2>
        <p>
          {run.result.validation.valid ? "✓" : "✕"}{" "}
          {run.result.validation.valid
            ? statusLabels[ui].completed
            : statusLabels[ui].failed}
        </p>
      </section>
      <section>
        <h2>{s.timeline}</h2>
        <ol className="runtime-timeline">
          {run.result.events.map((event) => (
            <li key={event.id}>
              <span className={`runtime-status status-${event.status}`}>
                {statusLabels[ui][event.status]}
              </span>
              <div>
                <strong>{localizeRuntimeText(ui, event.safeSummary)}</strong>
                <time
                  data-visual-mask="runtime-time"
                  dateTime={event.timestamp}
                >
                  {new Date(event.timestamp).toLocaleString(language)}
                </time>
                {event.details && (
                  <small>
                    {Object.entries(event.details)
                      .map(([key, value]) => `${key}: ${String(value)}`)
                      .join(" · ")}
                  </small>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
      {confirmDelete && (
        <ConfirmDialog
          title={s.delete}
          description={s.deleteConfirm}
          cancel={s.cancel}
          confirm={s.confirm}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            runtime.deleteRun(run.id);
            navigate("/runs");
          }}
        />
      )}
    </div>
  );
}
