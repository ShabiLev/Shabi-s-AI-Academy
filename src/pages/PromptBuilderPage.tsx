import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { categories, emptyInput, type PromptInput } from "../prompts/types";
import { categoryLabels, promptUi } from "../prompts/uiText";
import { PromptPreview } from "../components/prompts/PromptPreview";
const samples: PromptInput[] = [
  {
    ...emptyInput,
    title: "QA Test Case Generator",
    language: "en",
    category: "qa",
    role: "Act as a senior QA engineer.",
    task: "Create functional and negative test cases for the supplied requirement.",
    context: "Web application tested on mobile and desktop.",
    constraints: "Do not invent unsupported features.",
    outputFormat:
      "Return a table with ID, steps, expected result, priority, and type.",
  },
  {
    ...emptyInput,
    title: "SQL Query Reviewer",
    language: "en",
    category: "sql",
    task: "Review the supplied SQL query for correctness, performance, and readability.",
    context: "PostgreSQL production reporting workload.",
    constraints: "Do not change business semantics.",
    outputFormat: "List findings, risk, and a revised query.",
  },
  {
    ...emptyInput,
    title: "Jira Release Risk Analyzer",
    language: "en",
    category: "jira",
    task: "Analyze Jira issues for release risk.",
    context: "Include open blockers, regressions, and untested changes.",
    constraints: "Flag missing evidence instead of guessing.",
    outputFormat: "Return an executive summary and prioritized risk table.",
  },
  {
    ...emptyInput,
    title: "דוא״ל מקצועי ללקוח",
    language: "he",
    category: "customer",
    task: "נסח הודעת דוא״ל מקצועית וברורה ללקוח.",
    context: "עדכון על עיכוב קצר בגרסה.",
    constraints: "שמור על שקיפות ואל תבטיח מועד שלא אושר.",
    outputFormat: "נושא ולאחריו גוף הודעה קצר.",
  },
];
export function PromptBuilderPage() {
  const { promptId } = useParams(),
    { language } = useLanguage(),
    ui = language === "he" ? "he" : "en",
    s = promptUi[ui],
    { state, get, create, update, saveDraft } = usePromptLibrary(),
    source = new URLSearchParams(useLocation().search).get("source"),
    navigate = useNavigate(),
    existing = promptId ? get(promptId) : undefined,
    sourceDraft =
      source === "lesson2"
        ? { ...samples[0], notes: "Source: Lesson 2" }
        : undefined;
  const [value, setValue] = useState<PromptInput>(() =>
      existing
        ? { ...existing }
        : ({
            ...emptyInput,
            ...(sourceDraft &&
            (!state.draft?.task ||
              window.confirm(
                ui === "he"
                  ? "להחליף את הטיוטה הקיימת?"
                  : "Replace the existing draft?",
              ))
              ? sourceDraft
              : state.draft),
          } as PromptInput),
    ),
    [errors, setErrors] = useState<Record<string, string>>({});
  const saveDraftRef = useRef(saveDraft);
  useEffect(() => {
    saveDraftRef.current = saveDraft;
  }, [saveDraft]);
  useEffect(() => {
    if (!existing) saveDraftRef.current(value);
  }, [value, existing]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!existing && value.task) {
        e.preventDefault();
      }
    };
    addEventListener("beforeunload", handler);
    return () => removeEventListener("beforeunload", handler);
  }, [existing, value.task]);
  if (promptId && !existing)
    return (
      <div className="page">
        <h1>{s.notFound}</h1>
      </div>
    );
  const set = (key: keyof PromptInput, v: unknown) =>
    setValue((x) => ({ ...x, [key]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { title?: string; task?: string } = {};
    if (!value.title.trim()) next.title = s.required;
    if (!value.task.trim()) next.task = s.required;
    setErrors(next);
    if (Object.keys(next).length) return;
    const p = existing ? update(existing.id, value) : create(value);
    if (p) navigate(`/prompts/${p.id}`);
  };
  return (
    <div className="page prompt-builder-page">
      <header className="page-heading">
        <h1>{existing ? s.edit : s.workshop}</h1>
        <Link to="/how-to#prompt-builder">
          {language === "he" ? "עזרה" : "Help"}
        </Link>
      </header>
      <div className="builder-grid">
        <form className="prompt-form" onSubmit={submit} noValidate>
          {(["title", "description"] as const).map((k) => (
            <label key={k}>
              {s[k]}
              <input
                value={value[k]}
                onChange={(e) => set(k, e.target.value)}
                aria-invalid={Boolean(errors[k])}
              />
              {errors[k] && <small role="alert">{errors[k]}</small>}
            </label>
          ))}
          <div className="form-row">
            <label>
              {s.language}
              <select
                value={value.language}
                onChange={(e) => set("language", e.target.value)}
              >
                <option value="he">עברית</option>
                <option value="en">English</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label>
              {s.category}
              <select
                value={value.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {categories.map((c) => (
                  <option value={c} key={c}>
                    {categoryLabels[ui][c]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            {s.tags}
            <input
              value={value.tags.join(", ")}
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          {(
            [
              "role",
              "task",
              "context",
              "constraints",
              "outputFormat",
              "examples",
              "notes",
            ] as const
          ).map((k) => (
            <label key={k}>
              {s[k]}
              <textarea
                rows={k === "task" ? 4 : 3}
                value={value[k]}
                onChange={(e) => set(k, e.target.value)}
                aria-invalid={Boolean(errors[k])}
              />
              {errors[k] && <small role="alert">{errors[k]}</small>}
            </label>
          ))}
          <div className="sample-actions">
            <span>{s.loadExamples}</span>
            {samples.map((sample, i) => (
              <button
                key={sample.title}
                type="button"
                onClick={() => setValue(sample)}
              >
                {i + 1}. {sample.title}
              </button>
            ))}
          </div>
          <button className="save-prompt" type="submit">
            {s.save}
          </button>
        </form>
        <PromptPreview value={value} ui={ui} />
      </div>
    </div>
  );
}
