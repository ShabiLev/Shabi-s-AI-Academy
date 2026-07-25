import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useExperience } from "../experience";
import { useLanguage } from "../i18n/LanguageContext";
import { getRecommendation, recommendStartingPath, useOnboarding, type ExperienceLevel, type MainGoal } from "../onboarding";

type StartingArea = "lessons" | "prompts" | "agents" | "projects";
const goals: Array<{ id: MainGoal; he: string; en: string }> = [
  { id: "learn", he: "ללמוד AI", en: "Learn AI" },
  { id: "productivity", he: "לשפר פרודוקטיביות", en: "Improve productivity" },
  { id: "prompts", he: "לבנות פרומפטים", en: "Build prompts" },
  { id: "agent", he: "לבנות סוכנים", en: "Build agents" },
  { id: "explore", he: "לחקור את הפלטפורמה", en: "Explore the platform" },
];
const levels: Array<{ id: ExperienceLevel; he: string; en: string }> = [
  { id: "beginner", he: "מתחיל", en: "Beginner" },
  { id: "intermediate", he: "ביניים", en: "Intermediate" },
  { id: "advanced", he: "מתקדם", en: "Advanced" },
];
const startingAreas: Array<{ id: StartingArea; recommendationId: string; he: string; en: string }> = [
  { id: "lessons", recommendationId: "foundations", he: "שיעורים", en: "Lessons" },
  { id: "prompts", recommendationId: "prompt-pack", he: "פרומפטים", en: "Prompts" },
  { id: "agents", recommendationId: "starter-agent", he: "סוכנים", en: "Agents" },
  { id: "projects", recommendationId: "workflow", he: "פרויקטים", en: "Projects" },
];

export function OnboardingPage() {
  const { language } = useLanguage();
  const { profile: stored, save } = useOnboarding();
  const { setMode } = useExperience();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(stored);
  const [startingArea, setStartingArea] = useState<StartingArea>("lessons");
  const he = language === "he";
  const selectedArea = startingAreas.find((area) => area.id === startingArea) ?? startingAreas[0];
  const recommendation = step >= 3 ? getRecommendation(selectedArea.recommendationId) : recommendStartingPath(profile);
  const finish = () => {
    save({ ...profile, completed: true, recommendationId: recommendation.id, updatedAt: new Date().toISOString() });
    setMode("beginner");
    navigate("/dashboard", { replace: true });
  };

  return <div className="page onboarding-page">
    <section className="onboarding-card" aria-labelledby="onboarding-title">
      <header>
        <span className="eyebrow">{he ? `שלב ${step} מתוך 4` : `Step ${step} of 4`}</span>
        <progress max={4} value={step} aria-label={he ? "התקדמות ההיכרות" : "Onboarding progress"} />
        <h1 id="onboarding-title">{he ? "התאמת האקדמיה אליך" : "Personalize your Academy"}</h1>
        <p>{he ? "ארבע החלטות קצרות. אפשר לדלג ולהתחיל במצב מתחילים." : "Four short decisions. You can skip and start in Beginner Mode."}</p>
      </header>
      {step === 1 && <fieldset><legend>{he ? "מה המטרה העיקרית שלך?" : "What is your main goal?"}</legend><div className="onboarding-options">{goals.map((goal) => <label key={goal.id}><input type="radio" name="goal" checked={profile.mainGoal === goal.id} onChange={() => setProfile((current) => ({ ...current, mainGoal: goal.id }))} />{goal[language]}</label>)}</div></fieldset>}
      {step === 2 && <fieldset><legend>{he ? "מה רמת הניסיון שלך?" : "What is your experience level?"}</legend><div className="onboarding-options">{levels.map((level) => <label key={level.id}><input type="radio" name="level" checked={profile.experienceLevel === level.id} onChange={() => setProfile((current) => ({ ...current, experienceLevel: level.id }))} />{level[language]}</label>)}</div></fieldset>}
      {step === 3 && <fieldset><legend>{he ? "מאיפה תרצה להתחיל?" : "Where would you like to start?"}</legend><div className="onboarding-options">{startingAreas.map((area) => <label key={area.id}><input type="radio" name="starting-area" checked={startingArea === area.id} onChange={() => setStartingArea(area.id)} />{area[language]}</label>)}</div></fieldset>}
      {step === 4 && <div><h2>{he ? "המסלול המומלץ עבורך" : "Your recommended starting path"}</h2><article className="recommendation-card"><span className="status-badge">{recommendation.kind}</span><h3>{recommendation.title[language]}</h3><p>{recommendation.description[language]}</p></article><p>{he ? "אפשר לשנות את הבחירות ואת ההמלצה מאוחר יותר דרך הפרופיל." : "You can change your choices and recommendation later from Profile."}</p></div>}
      <footer className="onboarding-actions">
        {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)}>{he ? "הקודם" : "Previous"}</button>}
        {step < 4 ? <button className="primary-button" type="button" onClick={() => setStep((current) => current + 1)}>{he ? "הבא" : "Next"}</button> : <button className="primary-button" type="button" onClick={finish}>{he ? "פתיחת לוח הבקרה" : "Open Dashboard"}</button>}
        <button className="text-button" type="button" onClick={finish}>{he ? "דילוג לעת עתה" : "Skip for now"}</button>
      </footer>
    </section>
  </div>;
}
