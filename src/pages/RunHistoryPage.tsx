import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../components/prompts/ConfirmDialog";
import { ApprovalDialog } from "../components/runtime/ApprovalDialog";
import { useLanguage } from "../i18n/LanguageContext";
import { useRuntime } from "../runtime/RuntimeContext";
import { modeLabels, runtimeUi, statusLabels } from "../runtime/runtimeUi";
import type { ExecutionMode, RunStatus } from "../runtime";
export function RunHistoryPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = runtimeUi[ui];
  const runtime = useRuntime();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<ExecutionMode | "all">("all");
  const [status, setStatus] = useState<RunStatus | "all">("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const approvalRun = runtime.runs.find(
    (run) => run.result.status === "waitingForApproval",
  );
  const filtered = useMemo(
    () =>
      runtime.runs.filter(
        (run) =>
          (mode === "all" || run.request.mode === mode) &&
          (status === "all" || run.result.status === status) &&
          (!search ||
            [run.id, run.request.input, run.result.status]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())),
      ),
    [mode, runtime.runs, search, status],
  );
  const run = async (scenario: Parameters<typeof runtime.startDemo>[0]) => {
    await runtime.startDemo(scenario);
  };
  return (
    <div className="page runtime-page">
      <header className="page-header">
        <div className="page-header-content">
          <h1>{s.history}</h1>
          <p>{s.description}</p>
          <p className="runtime-privacy">{s.privacy}</p>
        </div>
        <div className="page-actions">
          <Link to="/how-to#runtime-engine">{s.help}</Link>
        </div>
      </header>
      {runtime.storageWarning && (
        <p role="alert">
          {s.storageWarning}: {runtime.storageWarning}
        </p>
      )}
      <section className="runtime-demo" aria-labelledby="runtime-demo-title">
        <h2 id="runtime-demo-title">{s.demo}</h2>
        <p>{s.demoNotice}</p>
        <div className="runtime-demo-actions">
          <button onClick={() => run("success")}>{s.mockSuccess}</button>
          <button onClick={() => run("retryThenSuccess")}>{s.mockRetry}</button>
          <button onClick={() => run("retryExhausted")}>
            {s.mockRetryFail}
          </button>
          <button onClick={() => run("approvalRequired")}>
            {s.mockApproval}
          </button>
          <button onClick={() => run("cancelled")}>{s.mockCancel}</button>
          <button onClick={() => runtime.createDryRun()}>{s.dryRun}</button>
          <button disabled title={s.liveDisabled}>
            {s.liveRun}
          </button>
        </div>
        <p>{s.liveDisabled}</p>
        <p>{s.noTools}</p>
      </section>
      <section
        className="prompt-filters runtime-filters"
        aria-label={s.history}
      >
        <label className="filter-search">
          {s.search}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          {s.mode}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as typeof mode)}
          >
            <option value="all">{s.all}</option>
            {(["mock", "dryRun", "liveReserved"] as const).map((value) => (
              <option key={value} value={value}>
                {modeLabels[ui][value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {s.status}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="all">{s.all}</option>
            {Object.entries(statusLabels[ui]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="secondary-button"
          onClick={() => {
            setSearch("");
            setMode("all");
            setStatus("all");
          }}
        >
          {s.clearFilters}
        </button>
      </section>
      <div className="runtime-summary">
        <p aria-live="polite">
          {s.count}: {filtered.length}
        </p>
        {runtime.runs.length > 0 && (
          <button className="destructive" onClick={() => setConfirmClear(true)}>
            {s.clearHistory}
          </button>
        )}
      </div>
      {!filtered.length ? (
        <section className="prompt-empty">
          <h2>{s.noRuns}</h2>
        </section>
      ) : (
        <div className="runtime-grid">
          {filtered.map((record) => (
            <article className="runtime-card" key={record.id}>
              <div>
                <span
                  className={`runtime-status status-${record.result.status}`}
                >
                  {statusLabels[ui][record.result.status]}
                </span>
                <span>{modeLabels[ui][record.request.mode]}</span>
              </div>
              <h2>
                <Link to={`/runs/${record.id}`}>{record.request.input}</Link>
              </h2>
              <p>
                {s.provider}: {record.request.providerId}
              </p>
              <p>
                {s.attempts}: {record.result.attempts}
              </p>
              <time data-visual-mask="runtime-time" dateTime={record.updatedAt}>
                {new Date(record.updatedAt).toLocaleString(language)}
              </time>
            </article>
          ))}
        </div>
      )}
      {approvalRun?.result.approval && (
        <ApprovalDialog
          labels={{
            title: s.approvalRequired,
            description:
              ui === "he"
                ? "יש לבדוק את הפעולה המסוכנת המדומה לפני המשך ההרצה המקומית."
                : approvalRun.result.approval.description,
            risk: ui === "he" ? "סיכון" : "Risk",
            riskValue:
              ui === "he" ? "גבוה" : approvalRun.result.approval.riskLevel,
            action: ui === "he" ? "פעולה" : "Action",
            actionText:
              ui === "he"
                ? "המשך שלב הכלי המתוכנן בסימולציה."
                : approvalRun.result.approval.proposedAction,
            consequence: ui === "he" ? "משמעות" : "Consequence",
            consequenceText:
              ui === "he"
                ? "לא תתרחש פעולה חיצונית; האישור מקדם רק את סימולציית ה-Mock המקומית."
                : approvalRun.result.approval.consequenceSummary,
            approve: s.approve,
            reject: s.reject,
          }}
          onApprove={() => runtime.approve(approvalRun.id)}
          onReject={() => runtime.reject(approvalRun.id)}
        />
      )}
      {confirmClear && (
        <ConfirmDialog
          title={s.clearHistory}
          description={s.clearConfirm}
          cancel={s.cancel}
          confirm={s.confirm}
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            runtime.clearHistory();
            setConfirmClear(false);
          }}
        />
      )}
    </div>
  );
}
