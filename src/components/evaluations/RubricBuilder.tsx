import { useState } from "react";
import {
  cloneBuiltInRubric,
  deterministicHash,
  type EvaluationRubric,
  type EvidenceType,
} from "../../evaluations";
import type { EvaluationLanguage } from "../../evaluations/uiText";
import { EvaluationBadge } from "./EvaluationBadge";

const evidenceTypes: EvidenceType[] = [
  "requirement",
  "output",
  "test",
  "accessibility",
  "security",
  "performance",
  "trace",
  "review",
];
const evidenceLabels: Record<EvidenceType, { he: string; en: string }> = {
  requirement: { he: "דרישה", en: "Requirement" },
  output: { he: "פלט", en: "Output" },
  test: { he: "בדיקה", en: "Test" },
  accessibility: { he: "נגישות", en: "Accessibility" },
  security: { he: "אבטחה", en: "Security" },
  performance: { he: "ביצועים", en: "Performance" },
  trace: { he: "עקבות", en: "Trace" },
  review: { he: "סקירה", en: "Review" },
};

export function RubricBuilder({
  language,
  rubric,
  onSave,
  onRollback,
  onDeprecate,
  usageCount = 0,
}: {
  language: EvaluationLanguage;
  rubric: EvaluationRubric;
  onSave?: (rubric: EvaluationRubric) => void;
  onRollback?: () => void;
  onDeprecate?: () => void;
  usageCount?: number;
}) {
  const he = language === "he";
  const [draft, setDraft] = useState<EvaluationRubric>();
  const [saved, setSaved] = useState(false);
  const current = draft ?? rubric;
  const total = current.criteria.reduce(
    (sum, criterion) => sum + criterion.weight,
    0,
  );
  const changedFields = draft
    ? [
        ...(draft.name[language] !== rubric.name[language] ? ["name"] : []),
        ...(draft.description[language] !== rubric.description[language]
          ? ["description"]
          : []),
        ...draft.criteria.flatMap((criterion, index) =>
          deterministicHash(criterion) ===
          deterministicHash(rubric.criteria[index])
            ? []
            : [`criteria.${criterion.id}`],
        ),
      ]
    : [];
  const changedFieldLabel = (value: string) => he
    ? value === "name" ? "שם" : value === "description" ? "תיאור" : value.startsWith("criteria.") ? `קריטריון ${value.slice("criteria.".length)}` : "שדה"
    : value;
  const sourceLabel = he ? ({ system: "מערכת", user: "משתמש" }[rubric.source]) : rubric.source;
  const valid =
    total === 100 &&
    current.criteria.every(
      (criterion) =>
        criterion.requiredEvidenceTypes.length > 0 &&
        criterion.scoringScale.anchors.length >= 2,
    );
  const beginEdit = () => {
    const timestamp = new Date().toISOString();
    const currentVersion = rubric.version ?? "1.0.0";
    const [major, minor, patch] = currentVersion.split(".").map(Number);
    const nextVersion = `${major}.${minor}.${patch + 1}`;
    setDraft(
      rubric.source === "system"
        ? structuredClone(
            cloneBuiltInRubric(
              rubric.id,
              `rubric-${crypto.randomUUID()}`,
              timestamp,
            ),
          )
        : {
            ...structuredClone(rubric),
            id: `rubric-${crypto.randomUUID()}`,
            sourceRubricId: rubric.id,
            lineageId: rubric.lineageId ?? rubric.id,
            version: nextVersion,
            parentVersionRef: {
              entityId: rubric.lineageId ?? rubric.id,
              version: currentVersion,
              contentHash: deterministicHash(rubric),
            },
            createdAt: timestamp,
            updatedAt: timestamp,
          },
    );
    setSaved(false);
  };
  const updateCriterion = (
    index: number,
    update: (
      criterion: EvaluationRubric["criteria"][number],
    ) => EvaluationRubric["criteria"][number],
  ) =>
    setDraft((value) =>
      value
        ? {
            ...value,
            updatedAt: new Date().toISOString(),
            criteria: value.criteria.map((criterion, criterionIndex) =>
              criterionIndex === index ? update(criterion) : criterion,
            ),
          }
        : value,
    );
  return (
    <section
      className="evaluation-panel evaluation-rubric"
      aria-labelledby="rubric-builder-heading"
    >
      <div className="evaluation-section-heading">
        <div>
          <p className="eyebrow">
            {draft
              ? he
                ? "עותק משתמש · המקור נשמר"
                : "User copy · source preserved"
              : rubric.source === "system"
                ? he
                  ? "Rubric מובנה ובלתי משתנה"
                  : "Immutable built-in rubric"
                : he
                  ? "Rubric משתמש"
                  : "User rubric"}
          </p>
          <h2 id="rubric-builder-heading">{current.name[language]}</h2>
        </div>
        <EvaluationBadge tone={valid ? "positive" : "danger"}>
          {total}%
        </EvaluationBadge>
      </div>
      <p>{current.description[language]}</p>
      <p className="field-hint">{he ? `גרסה ${current.version ?? "1.0.0"} · ${usageCount} ניסויים משתמשים בגרסה זו` : `Version ${current.version ?? "1.0.0"} · used by ${usageCount} experiments`}</p>
      {draft ? (
        <details className="evaluation-version-comparison">
          <summary>
            {he
              ? "השוואת גרסה ושדות ששונו"
              : "Version and changed-field comparison"}
          </summary>
          <dl>
            <div>
              <dt>{he ? "גרסת מקור" : "Source version"}</dt>
              <dd>
                {rubric.version ?? "1.0.0"} ·{" "}
                <code>{deterministicHash(rubric)}</code>
              </dd>
            </div>
            <div>
              <dt>{he ? "גרסה חדשה" : "New version"}</dt>
              <dd>
                {draft.version ?? "1.0.0"} ·{" "}
                <code>{deterministicHash(draft)}</code>
              </dd>
            </div>
            <div>
              <dt>{he ? "מקור" : "Provenance"}</dt>
              <dd>
                {sourceLabel} · <code>{rubric.id}</code>
              </dd>
            </div>
            <div>
              <dt>{he ? "שדות ששונו" : "Changed fields"}</dt>
              <dd>
                {changedFields.length
                  ? changedFields.map(changedFieldLabel).join(", ")
                  : he
                    ? "עדיין אין שינוי"
                    : "No changes yet"}
              </dd>
            </div>
          </dl>
        </details>
      ) : null}
      <ol className="evaluation-criteria-list">
        {current.criteria.map((criterion, index) => (
          <li key={criterion.id}>
            <div>
              {draft ? (
                <label>
                  {he ? "שם קריטריון" : "Criterion name"}
                  <input
                    value={criterion.name[language]}
                    onChange={(event) =>
                      updateCriterion(index, (item) => ({
                        ...item,
                        name: { ...item.name, [language]: event.target.value },
                      }))
                    }
                  />
                </label>
              ) : (
                <strong>{criterion.name[language]}</strong>
              )}
              <span>
                {criterion.blocking
                  ? he
                    ? "חוסם אישור"
                    : "Blocks certification"
                  : he
                    ? "לא חוסם"
                    : "Non-blocking"}{" "}
                · {criterion.scoringScale.min}–{criterion.scoringScale.max}
              </span>
            </div>
            {draft ? (
              <label>
                {he ? "משקל" : "Weight"}
                <input
                  aria-invalid={total !== 100}
                  type="number"
                  min="1"
                  max="100"
                  value={criterion.weight}
                  onChange={(event) =>
                    updateCriterion(index, (item) => ({
                      ...item,
                      weight: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ) : (
              <strong>{criterion.weight}%</strong>
            )}
            {draft ? (
              <div className="evaluation-rubric-editor">
                <label>
                  <input
                    type="checkbox"
                    checked={criterion.blocking}
                    onChange={(event) =>
                      updateCriterion(index, (item) => ({
                        ...item,
                        blocking: event.target.checked,
                      }))
                    }
                  />
                  {he ? "חוסם certification" : "Blocks certification"}
                </label>
                <fieldset>
                  <legend>{he ? "ראיות נדרשות" : "Required evidence"}</legend>
                  {evidenceTypes.map((type) => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={criterion.requiredEvidenceTypes.includes(type)}
                        onChange={(event) =>
                          updateCriterion(index, (item) => ({
                            ...item,
                            requiredEvidenceTypes: event.target.checked
                              ? [
                                  ...new Set([
                                    ...item.requiredEvidenceTypes,
                                    type,
                                  ]),
                                ]
                              : item.requiredEvidenceTypes.filter(
                                  (value) => value !== type,
                                ),
                          }))
                        }
                      />
                      {evidenceLabels[type][language]}
                    </label>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>{he ? "עוגני ציון" : "Score anchors"}</legend>
                  {criterion.scoringScale.anchors.map((anchor, anchorIndex) => (
                    <label key={`${criterion.id}-${anchorIndex}`}>
                      {he
                        ? `עוגן ${anchorIndex + 1}`
                        : `Anchor ${anchorIndex + 1}`}
                      <input
                        type="number"
                        min={criterion.scoringScale.min}
                        max={criterion.scoringScale.max}
                        value={anchor.score}
                        onChange={(event) =>
                          updateCriterion(index, (item) => ({
                            ...item,
                            scoringScale: {
                              ...item.scoringScale,
                              anchors: item.scoringScale.anchors.map(
                                (value, valueIndex) =>
                                  valueIndex === anchorIndex
                                    ? {
                                        ...value,
                                        score: Number(event.target.value),
                                      }
                                    : value,
                              ),
                            },
                          }))
                        }
                      />
                      <input
                        value={anchor.label[language]}
                        onChange={(event) =>
                          updateCriterion(index, (item) => ({
                            ...item,
                            scoringScale: {
                              ...item.scoringScale,
                              anchors: item.scoringScale.anchors.map(
                                (value, valueIndex) =>
                                  valueIndex === anchorIndex
                                    ? {
                                        ...value,
                                        label: {
                                          ...value.label,
                                          [language]: event.target.value,
                                        },
                                      }
                                    : value,
                              ),
                            },
                          }))
                        }
                      />
                    </label>
                  ))}
                </fieldset>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
      <p
        className={valid ? "field-hint" : "evaluation-alert"}
        aria-live="polite"
      >
        {valid
          ? he
            ? "המשקלים מסתכמים בדיוק ב־100 ולכל קריטריון יש ראיות ועוגנים."
            : "Weights total exactly 100 and every criterion has evidence and anchors."
          : he
            ? `נדרש סך 100, סוג ראיה אחד ושני עוגנים לכל קריטריון; הסך הנוכחי הוא ${total}.`
            : `A total of 100, one evidence type, and two anchors per criterion are required; current total is ${total}.`}
      </p>
      {!draft ? (
        <div className="evaluation-run-actions"><button type="button" onClick={beginEdit}>
          {rubric.source === "system"
            ? he
              ? "שכפול לעריכה"
              : "Clone to edit"
            : he
              ? "יצירת גרסה חדשה"
              : "Create new version"}
        </button>{rubric.source === "user" && onRollback ? <button type="button" onClick={onRollback}>{he ? "שחזור תוכן כגרסה חדשה" : "Restore content as new version"}</button> : null}{rubric.source === "user" && onDeprecate ? <button type="button" onClick={onDeprecate}>{he ? "הוצאה משימוש" : "Deprecate version"}</button> : null}</div>
      ) : (
        <div className="evaluation-run-actions">
          <button
            type="button"
            onClick={() => {
              if (!valid || !onSave) return;
              onSave(draft);
              setSaved(true);
              setDraft(undefined);
            }}
            disabled={!valid || !onSave}
          >
            {he ? "שמירת גרסה בלתי־משתנה" : "Save immutable version"}
          </button>
          <button type="button" onClick={() => setDraft(undefined)}>
            {he ? "ביטול" : "Cancel"}
          </button>
        </div>
      )}
      {saved ? (
        <p role="status">
          {he
            ? "ה־rubric נשמר מקומית ונבחר לניסוי."
            : "The rubric was saved locally and selected for the experiment."}
        </p>
      ) : null}
    </section>
  );
}
