import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeterministicNotice } from "../components/evaluations/DeterministicNotice";
import { RubricBuilder } from "../components/evaluations/RubricBuilder";
import {
  evaluationCompetitors,
  readOnlyEvaluators,
  useEvaluations,
} from "../evaluations";
import { useLanguage } from "../i18n/LanguageContext";
import { useAgentLibrary } from "../agents/AgentLibraryContext";
import { usePromptLibrary } from "../prompts/PromptLibraryContext";
import { useMissions } from "../missions";

const legacyCompetitorOptions = [
  {
    value: "accessible-react-v1.3",
    he: "סוכן React נגיש — גרסה 1.3",
    en: "Accessible React Agent — version 1.3",
  },
  {
    value: "baseline-react-v1.2",
    he: "סוכן React בסיסי — גרסה 1.2",
    en: "Baseline React Agent — version 1.2",
  },
  {
    value: "guided-team-v2.0",
    he: "צוות מודרך — גרסה 2.0",
    en: "Guided Team — version 2.0",
  },
  {
    value: "expert-team-v2.0",
    he: "צוות Expert — גרסה 2.0",
    en: "Expert Team — version 2.0",
  },
] as const;
const systemCompetitorOptions = evaluationCompetitors.length
  ? evaluationCompetitors.map((item) => ({
      value: item.id,
      ...item.name,
      kind: item.kind,
    }))
  : legacyCompetitorOptions.map((item, index) => ({
      ...item,
      kind: index < 2 ? "agent-preset" : "team-preset",
    }));

export function EvaluationBuilderPage() {
  const { language } = useLanguage();
  const evaluations = useEvaluations();
  const agents = useAgentLibrary();
  const prompts = usePromptLibrary();
  const missions = useMissions();
  const navigate = useNavigate();
  const he = language === "he";
  const [name, setName] = useState("");
  const [mission, setMission] = useState("mission-accessible-react-snapshot");
  const [competitors, setCompetitors] = useState<string[]>([
    "accessible-react-v1.3",
    "baseline-react-v1.2",
  ]);
  const [repetitions, setRepetitions] = useState(2);
  const [seed, setSeed] = useState("academy-19-beta");
  const [rubricId, setRubricId] = useState("react-ui-feature");
  const [evaluatorIds, setEvaluatorIds] = useState<string[]>([
    "requirements-evaluator",
    "accessibility-evaluator",
    "reality-checker",
  ]);
  const [submitted, setSubmitted] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const availableRubrics = evaluations.snapshot.rubrics.filter(
    (rubric) =>
      !evaluations.snapshot.versions.some(
        (version) =>
          version.entityId === (rubric.lineageId ?? rubric.id) &&
          version.version === (rubric.version ?? "1.0.0") &&
          version.status === "deprecated",
      ),
  );
  const competitorOptions = [
    ...systemCompetitorOptions,
    ...agents.state.agents
      .filter((item) => item.status !== "archived")
      .map((item) => ({
        value: item.id,
        he: `${item.name} — Agent v${item.version}`,
        en: `${item.name} — Agent v${item.version}`,
        kind: "agent",
      })),
    ...prompts.state.prompts.map((item) => ({
      value: item.id,
      he: `${item.title} — Prompt v${item.version}`,
      en: `${item.title} — Prompt v${item.version}`,
      kind: "prompt",
    })),
    ...missions.teams.map((item) => ({
      value: item.id,
      he: `${item.name.he} — צוות`,
      en: `${item.name.en} — team`,
      kind: "team",
    })),
  ];
  const missionOptions = missions.missions.map((item) => ({
    value: item.id,
    label: item.title,
  }));
  const selectedKinds = new Set(
    competitorOptions
      .filter((item) => competitors.includes(item.value))
      .map((item) => item.kind),
  );
  const valid =
    name.trim().length >= 4 &&
    mission.length > 0 &&
    competitors.length >= 2 &&
    competitors.length <= 5 &&
    selectedKinds.size === 1 &&
    repetitions >= 1 &&
    repetitions <= 5 &&
    seed.trim().length >= 4 &&
    evaluatorIds.length > 0;
  const toggle = (value: string) =>
    setCompetitors((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : current.length < 5
          ? [...current, value]
          : current,
    );
  const submit = () => {
    setSubmitted(true);
    if (!valid) {
      requestAnimationFrame(() => alertRef.current?.focus());
      return;
    }
    const timestamp = new Date().toISOString();
    const experiment = evaluations.createExperiment({
      id: `evaluation-${crypto.randomUUID()}`,
      actorId: evaluations.actorId,
      name: name.trim(),
      missionSnapshotId: mission,
      competitorIds: competitors,
      rubricId,
      evaluatorIds,
      repetitionCount: repetitions,
      seed: seed.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    navigate(`/evaluations/${experiment.id}`);
  };

  return (
    <div
      className="page evaluation-page evaluation-builder-page"
      data-testid="evaluation-builder"
    >
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            {he
              ? "קלט קפוא · השוואה חוזרת"
              : "Frozen input · repeatable comparison"}
          </p>
          <h1>{he ? "בניית ניסוי הערכה" : "Build an evaluation experiment"}</h1>
          <p>
            {he
              ? "אמתו את החוזה לפני ההרצה. לאחר התחלה, שינוי מתחרה או גרסה מחייב ניסוי חדש."
              : "Validate the contract before running. After start, changing a competitor or version requires a new experiment."}
          </p>
        </div>
      </header>
      <DeterministicNotice language={language} />
      {submitted && !valid ? (
        <div
          ref={alertRef}
          id="evaluation-setup-error"
          className="evaluation-alert"
          role="alert"
          tabIndex={-1}
        >
          {he
            ? "ההגדרה עדיין אינה תקינה. בדקו שם, snapshot, 2–5 מתחרים, מספר חזרות, seed ומעריך אחד לפחות."
            : "The setup is not valid yet. Check the name, snapshot, 2–5 competitors, repetition count, seed, and at least one evaluator."}
        </div>
      ) : null}
      <div className="evaluation-builder-grid">
        <section className="evaluation-panel evaluation-setup-panel">
          <h2>{he ? "1. הגדרת הניסוי" : "1. Experiment setup"}</h2>
          <label>
            {he ? "שם תיאורי" : "Descriptive name"}
            <input
              value={name}
              maxLength={120}
              aria-invalid={submitted && name.trim().length < 4}
              aria-describedby={
                submitted && name.trim().length < 4
                  ? "evaluation-setup-error"
                  : undefined
              }
              onChange={(event) => setName(event.target.value)}
              placeholder={
                he
                  ? "לדוגמה: נגישות בגרסה 1.3 מול 1.2"
                  : "Example: accessibility in version 1.3 versus 1.2"
              }
            />
          </label>
          <label>
            {he ? "Mission snapshot בלתי משתנה" : "Immutable Mission snapshot"}
            <select
              value={mission}
              aria-invalid={submitted && !mission}
              aria-describedby={
                submitted && !mission ? "evaluation-setup-error" : undefined
              }
              onChange={(event) => setMission(event.target.value)}
            >
              <option value="mission-accessible-react-snapshot">
                {he
                  ? "משימת React נגישה — snapshot הדגמה מובנה"
                  : "Accessible React mission — built-in demo snapshot"}
              </option>
              {missionOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="">
                {he ? "בחירת snapshot" : "Choose a snapshot"}
              </option>
            </select>
          </label>
          <fieldset
            aria-describedby={
              submitted && (competitors.length < 2 || competitors.length > 5)
                ? "evaluation-setup-error"
                : undefined
            }
          >
            <legend>
              {he ? "מתחרים — נדרשים 2 עד 5" : "Competitors — 2 to 5 required"}
            </legend>
            <div className="evaluation-picker-grid">
              {competitorOptions.map((option) => (
                <label key={option.value} className="evaluation-picker">
                  <input
                    type="checkbox"
                    checked={competitors.includes(option.value)}
                    onChange={() => toggle(option.value)}
                  />
                  <span>
                    <strong>{option[language]}</strong>
                    <small>
                      {he
                        ? "גרסה בלתי משתנה · מקור מקומי"
                        : "Immutable version · local source"}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <p className="field-hint" aria-live="polite">
              {he
                ? `${competitors.length} מתחרים נבחרו`
                : `${competitors.length} competitors selected`}
            </p>
          </fieldset>
          <div className="evaluation-inline-fields">
            <label>
              {he ? "חזרות תחומות" : "Bounded repetitions"}
              <input
                type="number"
                min="1"
                max="5"
                value={repetitions}
                aria-invalid={submitted && (repetitions < 1 || repetitions > 5)}
                aria-describedby={
                  submitted && (repetitions < 1 || repetitions > 5)
                    ? "evaluation-setup-error"
                    : undefined
                }
                onChange={(event) => setRepetitions(Number(event.target.value))}
              />
            </label>
            <label>
              {he ? "Seed דטרמיניסטי" : "Deterministic seed"}
              <input
                dir="ltr"
                value={seed}
                maxLength={64}
                aria-invalid={submitted && seed.trim().length < 4}
                aria-describedby={
                  submitted && seed.trim().length < 4
                    ? "evaluation-setup-error"
                    : undefined
                }
                onChange={(event) => setSeed(event.target.value)}
              />
            </label>
          </div>
          <fieldset
            aria-describedby={
              submitted && evaluatorIds.length === 0
                ? "evaluation-setup-error"
                : undefined
            }
          >
            <legend>
              {he
                ? "מעריכים בלתי תלויים, קריאה בלבד"
                : "Independent, read-only evaluators"}
            </legend>
            {readOnlyEvaluators.map((evaluator) => (
              <label className="evaluation-picker" key={evaluator.id}>
                <input
                  type="checkbox"
                  checked={evaluatorIds.includes(evaluator.id)}
                  onChange={() =>
                    setEvaluatorIds((current) =>
                      current.includes(evaluator.id)
                        ? current.filter((id) => id !== evaluator.id)
                        : [...current, evaluator.id],
                    )
                  }
                />
                <span>
                  <strong>{evaluator.name[language]}</strong>
                  <small>
                    {evaluator.realityChecker
                      ? he
                        ? "רשאי לחסום אישור, לא לערוך"
                        : "May block certification, cannot edit"
                      : he
                        ? "קריאה ואימות בלבד; אינו בעל המימוש"
                        : "Observe and validate only; does not own implementation"}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
        </section>
        <aside className="evaluation-rubric-picker">
          <label>
            {he ? "Rubric מובנה או אישי" : "Built-in or user rubric"}
            <select
              value={rubricId}
              onChange={(event) => setRubricId(event.target.value)}
            >
              {availableRubrics.map((rubric) => (
                <option value={rubric.id} key={rubric.id}>
                  {rubric.name[language]}
                </option>
              ))}
            </select>
          </label>
          <RubricBuilder
            language={language}
            rubric={
              availableRubrics.find((rubric) => rubric.id === rubricId) ??
              availableRubrics[0]
            }
            usageCount={evaluations.experiments.filter((item) => item.rubricId === rubricId).length}
            onSave={(rubric) => {
              evaluations.saveRubric(rubric);
              setRubricId(rubric.id);
            }}
            onRollback={() => { const restored = evaluations.rollbackRubric(rubricId); setRubricId(restored.id); }}
            onDeprecate={() => { evaluations.deprecateRubric(rubricId); setRubricId("react-ui-feature"); }}
          />
        </aside>
      </div>
      <div className="evaluation-sticky-actions">
        <button type="button" onClick={() => navigate("/evaluations")}>
          {he ? "ביטול" : "Cancel"}
        </button>
        <button type="button" className="primary-button" onClick={submit}>
          {he ? "יצירת טיוטת ניסוי" : "Create experiment draft"}
        </button>
        <span className="evaluation-action-clearance" aria-hidden="true" />
      </div>
    </div>
  );
}
