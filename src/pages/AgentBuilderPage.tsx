import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { agentTemplates } from "../agents/agentTemplates";
import { agentUi, stepKeys, toolNames } from "../agents/agentUi";
import { emptyAgent, toolCatalog, type AgentInput } from "../agents/types";
import { evaluateAgent } from "../agents/agentQuality";
import { validateAdvancedAgent } from "../builders";
export function AgentBuilderPage() {
  const { agentId } = useParams(),
    { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = agentUi[ui],
    { state, get, create, update, saveDraft } = useAgentLibrary(),
    navigate = useNavigate(),
    source = new URLSearchParams(useLocation().search).get("source"),
    existing = agentId ? get(agentId) : undefined,
    prefill = source === "lesson-agent" ? agentTemplates[0] : undefined;
  const [value, setValue] = useState<AgentInput>(() =>
      existing
        ? { ...existing }
        : ({
            ...emptyAgent,
            ...(prefill &&
            (!state.draft?.goal ||
              confirm(
                ui === "he" ? "להחליף טיוטה קיימת?" : "Replace existing draft?",
              ))
              ? prefill
              : state.draft),
          } as AgentInput),
    ),
    [step, setStep] = useState(0),
    [maxVisited, setMaxVisited] = useState(0),
    [errors, setErrors] = useState<string[]>([]),
    saveRef = useRef(saveDraft);
  useEffect(() => {
    saveRef.current = saveDraft;
  }, [saveDraft]);
  useEffect(() => {
    if (!existing) saveRef.current(value);
  }, [value, existing]);
  const set = <K extends keyof AgentInput>(k: K, v: AgentInput[K]) =>
    setValue((x) => ({ ...x, [k]: v }));
  const next = () => {
    setStep((x) => Math.min(11, x + 1));
    setMaxVisited((x) => Math.max(x, step + 1));
  };
  const save = useCallback(() => {
    const missing = [
      !value.name && s.name,
      !value.goal && s.goal,
      !value.instructions && s.instructions,
      !value.outputFormat && s.output,
      !value.completionCriteria && s.completion,
    ].filter(Boolean) as string[];
    if (
      value.retryPolicy.maximumRetries < 0 ||
      value.retryPolicy.maximumRetries > 10
    )
      missing.push("Maximum retries 0–10");
    if (
      value.retryPolicy.maximumRetries > 0 &&
      !value.retryPolicy.stopCondition
    )
      missing.push("Stop condition");
    const issueLabels: Record<string, { he: string; en: string }> = {
      "missing-goal": { he: "חסרה מטרת סוכן", en: "Missing agent goal" }, "missing-completion-criteria": { he: "חסרים תנאי השלמה", en: "Missing completion criteria" }, "unclear-output": { he: "הפלט אינו מוגדר", en: "Output is unclear" }, "unsafe-write-tool-without-approval": { he: "כלי בסיכון גבוה דורש אישור", en: "High-risk tool requires approval" }, "retry-without-stop-condition": { he: "ניסיון חוזר דורש תנאי עצירה", en: "Retry requires a stop condition" }, "excessive-memory-retention": { he: "יש לתעד סיכון בשמירת זיכרון", en: "Document the memory-retention risk" }, "missing-error-handling": { he: "חסר טיפול בשגיאות", en: "Missing error handling" }, "connected-tool-claim": { he: "אין לטעון שכלי מחובר", en: "Connected-tool claims are not allowed" },
    };
    missing.push(...validateAdvancedAgent(value).map((issue) => issueLabels[issue.code]?.[ui] ?? issue.code));
    setErrors(missing);
    if (missing.length) return;
    const a = existing ? update(existing.id, value) : create(value);
    if (a) navigate(`/agents/${a.id}`);
  }, [create, existing, navigate, s.completion, s.goal, s.instructions, s.name, s.output, ui, update, value]);
  useEffect(() => {
    const saveCurrent = () => save();
    window.addEventListener("academy:save-current", saveCurrent);
    return () => window.removeEventListener("academy:save-current", saveCurrent);
  }, [save]);
  const textArea = (label: string, key: keyof AgentInput) => (
    <label>
      {label}
      <textarea
        rows={7}
        value={String(value[key] ?? "")}
        onChange={(e) => set(key, e.target.value as never)}
      />
    </label>
  );
  if (agentId && !existing) return <div className="page"><h1>{s.unknown}</h1></div>;
  return (
    <div className="page agent-builder-page">
      <header className="library-heading">
        <h1>{s.builder}</h1>
        <Link to="/how-to#agent-builder">{s.help}</Link>
      </header>
      <nav className="wizard-steps" aria-label={s.builder}>
        {stepKeys.map((k, i) => (
          <button
            key={k}
            type="button"
            aria-current={step === i ? "step" : undefined}
            disabled={i > maxVisited}
            onClick={() => setStep(i)}
          >
            {i + 1}. {s[k]}
          </button>
        ))}
      </nav>
      <section className="agent-wizard-panel">
        <h2>
          {step + 1}. {s[stepKeys[step]]}
        </h2>
        {step === 0 && (
          <>
            <label>
              {s.name}
              <input
                value={value.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <label>
              {s.description}
              <textarea
                value={value.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </label>
            <label>
              Category
              <select
                value={value.category}
                onChange={(e) => set("category", e.target.value as never)}
              >
                {[
                  "qa",
                  "sql",
                  "jira",
                  "release",
                  "product",
                  "customer",
                  "development",
                  "learning",
                  "general",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="sample-actions">
              <strong>{s.templates}</strong>
              {agentTemplates.map((t) => (
                <button
                  type="button"
                  key={t.name}
                  onClick={() => setValue({ ...t })}
                >
                  {s.useTemplate}: {t.name}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 1 && textArea(s.goal, "goal")}
        {step === 2 && textArea(s.inputs, "inputs")}
        {step === 3 && (
          <>
            {textArea("Role", "role")}
            {textArea(s.instructions, "instructions")}
          </>
        )}
        {step === 4 && (
          <>
            <p>{s.toolNotice}</p>
            <div className="tool-grid">
              {toolCatalog.map((tool) => (
                <label key={tool.id}>
                  <input
                    type="checkbox"
                    checked={value.tools.includes(tool.id)}
                    onChange={(e) =>
                      set(
                        "tools",
                        e.target.checked
                          ? [
                              ...value.tools.filter((x) => x !== "none"),
                              tool.id,
                            ]
                          : value.tools.filter((x) => x !== tool.id),
                      )
                    }
                  />
                  <span>
                    <strong>
                      {toolNames[tool.id as keyof typeof toolNames]}
                    </strong>
                    <small>
                      {s.notConnected} · {tool.risk}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <p>{s.memoryNotice}</p>
            <label>
              {s.memory}
              <select
                value={value.memoryStrategy}
                onChange={(e) => set("memoryStrategy", e.target.value as never)}
              >
                {[
                  "none",
                  "conversation",
                  "session",
                  "longTerm",
                  "rag",
                  "custom",
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </>
        )}
        {step === 6 && textArea(s.validation, "validationRules")}
        {step === 7 && (
          <div className="form-row">
            <label>
              Maximum retries
              <input
                type="number"
                min="0"
                max="10"
                value={value.retryPolicy.maximumRetries}
                onChange={(e) =>
                  set("retryPolicy", {
                    ...value.retryPolicy,
                    maximumRetries: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Backoff
              <select
                value={value.retryPolicy.backoff}
                onChange={(e) =>
                  set("retryPolicy", {
                    ...value.retryPolicy,
                    backoff: e.target.value as never,
                  })
                }
              >
                {["none", "fixed", "incremental", "exponential"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label>
              Retry condition
              <input
                value={value.retryPolicy.retryCondition}
                onChange={(e) =>
                  set("retryPolicy", {
                    ...value.retryPolicy,
                    retryCondition: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Stop condition
              <input
                value={value.retryPolicy.stopCondition}
                onChange={(e) =>
                  set("retryPolicy", {
                    ...value.retryPolicy,
                    stopCondition: e.target.value,
                  })
                }
              />
            </label>
          </div>
        )}
        {step === 8 && (
          <label>
            {s.approval}
            <textarea
              value={value.humanApprovalPoints[0]?.description ?? ""}
              onChange={(e) =>
                set(
                  "humanApprovalPoints",
                  e.target.value
                    ? [
                        {
                          title: "Human approval",
                          description: e.target.value,
                          stage: "before action",
                          required: true,
                          approverRole: "Responsible reviewer",
                        },
                      ]
                    : [],
                )
              }
            />
          </label>
        )}
        {step === 9 && textArea(s.output, "outputFormat")}
        {step === 10 && <>{textArea(s.completion, "completionCriteria")}{textArea(ui === "he" ? "סכמת פלט" : "Output schema", "outputSchema")}{textArea(ui === "he" ? "הערות סיכון" : "Risk notes", "riskNotes")}{textArea(ui === "he" ? "קלט לדוגמה" : "Sample input", "sampleInput")}{textArea(ui === "he" ? "תרחיש Mock" : "Mock scenario", "mockScenario")}{textArea(ui === "he" ? "טיפול בשגיאות" : "Error handling", "errorHandling")}</>}
        {step === 11 && (
          <div className="agent-review">
            <p>
              {s.quality}: {evaluateAgent(value).score}/100
            </p>
            <p>{s.disclaimer}</p>
            <section className="builder-test-cases"><h3>{ui === "he" ? "מקרי בדיקה" : "Test cases"}</h3>{(value.testCases ?? []).map((test, index) => <div key={test.id}><label>{ui === "he" ? "קלט" : "Input"}<input value={test.input} onChange={(event) => set("testCases", (value.testCases ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, input: event.target.value } : item))} /></label><label>{ui === "he" ? "מאפיינים צפויים" : "Expected characteristics"}<input value={test.expectedCharacteristics} onChange={(event) => set("testCases", (value.testCases ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, expectedCharacteristics: event.target.value } : item))} /></label><span>{test.status}</span></div>)}<button type="button" onClick={() => set("testCases", [...(value.testCases ?? []), { id: crypto.randomUUID(), input: "", expectedCharacteristics: "", forbiddenOutput: "", status: "draft" }])}>{ui === "he" ? "הוספת מקרה בדיקה" : "Add test case"}</button></section>
            <dl>
              <dt>{s.name}</dt>
              <dd>{value.name || "—"}</dd>
              <dt>{s.goal}</dt>
              <dd>{value.goal || "—"}</dd>
              <dt>{s.tools}</dt>
              <dd>{value.tools.join(", ")}</dd>
            </dl>
            <label>
              Status
              <select
                value={value.status}
                onChange={(e) => set("status", e.target.value as never)}
              >
                <option value="draft">{s.draft}</option>
                <option value="ready">{s.ready}</option>
              </select>
            </label>
            {errors.length > 0 && (
              <div role="alert">
                <strong>{s.required}</strong>
                <ul>
                  {errors.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            <button className="save-prompt" type="button" onClick={save}>
              {s.save}
            </button>
          </div>
        )}
        <div className="wizard-actions">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((x) => x - 1)}
          >
            {s.previous}
          </button>
          {step < 11 && (
            <button type="button" onClick={next}>
              {s.next}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
