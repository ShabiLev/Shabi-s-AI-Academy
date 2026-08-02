import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "../components/common/ProgressBar";
import { useLanguage } from "../i18n/LanguageContext";
import { useOutcomes } from "../outcomes";
import { calculateProjectProgress, useProjects } from "../projects";

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams();
  const { language } = useLanguage();
  const { get, remove, link } = useProjects();
  const { outcomes, create } = useOutcomes();
  const navigate = useNavigate();
  const [creatingOutcome, setCreatingOutcome] = useState(false);
  const project = get(projectId);
  if (!project) return <div className="page"><h1>{language === "he" ? "הפרויקט לא נמצא" : "Project not found"}</h1><Link to="/projects">Projects</Link></div>;
  const labels = language === "he" ? {
    edit: "עריכה", remove: "מחיקה", linked: "פריטים מקושרים", activity: "פעילות",
    noCascade: "מחיקת פרויקט אינה מוחקת את פריטי המקור.", knowledge: "הוספת מסמך ידע",
    outcomes: "תוצאות עבודה", createOutcome: "יצירת תוצאה מהמצב הנוכחי", noOutcomes: "עדיין לא נוצרה תוצאה עבור פרויקט זה.", openOutcome: "פתיחה",
  } : {
    edit: "Edit", remove: "Delete", linked: "Linked items", activity: "Activity",
    noCascade: "Deleting a project does not delete source items.", knowledge: "Add knowledge document",
    outcomes: "Outcomes", createOutcome: "Create outcome from current state", noOutcomes: "No outcome has been created for this project yet.", openOutcome: "Open",
  };
  const linkedOutcomes = outcomes.filter((outcome) => project.outcomeIds.includes(outcome.id));
  const progress = calculateProjectProgress(project, linkedOutcomes);
  const createProjectOutcome = () => {
    if (creatingOutcome) return;
    setCreatingOutcome(true);
    const outcome = create({
      title: project.name,
      summary: project.objective || project.description || project.name,
      intent: project.targetOutcome || project.objective || project.description || project.name,
      status: "ready",
      realityMode: "local",
      sourceModule: "project",
      sourceEntityId: project.id,
      projectId: project.id,
      resultType: "project-outcome",
      resultLocation: `/projects/${project.id}`,
      usageInstructions: language === "he" ? "סקירת מצב הפרויקט וצירוף ראיות לפני אימות." : "Review the project state and attach evidence before verifying.",
      nextActions: [{ id: "review", label: language === "he" ? "סקירת התוצאה" : "Review the outcome", route: `/projects/${project.id}` }],
      limitations: [language === "he" ? "מקומי בלבד; טרם אומת." : "Local only; not yet verified."],
      deliverableIds: [],
      evidenceIds: [],
      verificationState: "unverified",
    });
    if (outcome) link(project.id, "outcomeIds", outcome.id);
    window.setTimeout(() => setCreatingOutcome(false), 1_000);
  };
  return <div className="page">
    <header className="page-header">
      <div><h1>{project.name}</h1><p>{project.description}</p></div>
      <div className="card-actions">
        <Link to={`/projects/${project.id}/settings`}>{labels.edit}</Link>
        <Link to={`/knowledge/new?project=${project.id}`}>{labels.knowledge}</Link>
        <button onClick={() => { if (confirm(labels.noCascade)) { remove(project.id); navigate("/projects"); } }}>{labels.remove}</button>
      </div>
    </header>
    <p>{labels.noCascade}</p>
    <section>
      <h2>{labels.linked}</h2>
      <dl className="runtime-facts">
        <div><dt>Prompts</dt><dd>{project.promptIds.length}</dd></div>
        <div><dt>Agents</dt><dd>{project.agentIds.length}</dd></div>
        <div><dt>Runs</dt><dd>{project.runIds.length}</dd></div>
        <div><dt>Documents</dt><dd>{project.documentIds.length}</dd></div>
      </dl>
    </section>
    <section>
      <h2>{labels.outcomes}</h2>
      <ProgressBar value={progress} labelKey="a11y.projectProgressLabel" />
      <button type="button" disabled={creatingOutcome} onClick={createProjectOutcome}>{labels.createOutcome}</button>
      {!linkedOutcomes.length ? <p>{labels.noOutcomes}</p> : (
        <ul>{linkedOutcomes.map((outcome) => <li key={outcome.id}>{outcome.title} — <Link to={`/outcomes/${outcome.id}`}>{labels.openOutcome}</Link></li>)}</ul>
      )}
    </section>
    <section>
      <h2>{labels.activity}</h2>
      <ol>{project.activity.map((activity) => <li key={activity.id}><time>{activity.timestamp}</time> {activity.summary}</li>)}</ol>
    </section>
  </div>;
}
