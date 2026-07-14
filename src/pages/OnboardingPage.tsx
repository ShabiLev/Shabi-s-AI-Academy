import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useExperience } from "../experience";
import { useLanguage } from "../i18n/LanguageContext";
import { recommendStartingPath, useOnboarding, type ExperienceLevel, type Interest, type MainGoal } from "../onboarding";

const goals: Array<{ id: MainGoal; he: string; en: string }> = [
  { id: "learn", he: "ללמוד AI וסוכנים", en: "Learn AI and agents" },
  { id: "prompts", he: "ליצור פרומפטים מקצועיים", en: "Create professional prompts" },
  { id: "agent", he: "לבנות סוכן", en: "Build an agent" },
  { id: "workflow", he: "לבנות תהליך עבודה", en: "Build a workflow" },
  { id: "qa", he: "להשתמש בכלי QA", en: "Use QA tools" },
  { id: "explore", he: "לחקור את הפלטפורמה", en: "Explore the platform" },
];
const levels: Array<{ id: ExperienceLevel; he: string; en: string }> = [
  { id: "beginner", he: "מתחיל", en: "Beginner" }, { id: "some", he: "ניסיון מסוים", en: "Some experience" }, { id: "advanced", he: "מתקדם", en: "Advanced" },
];
const interests: Array<{ id: Interest; he: string; en: string }> = [
  { id: "qa", he: "QA ובדיקות", en: "QA and testing" }, { id: "sql", he: "SQL ונתונים", en: "SQL and data" }, { id: "product", he: "ניהול מוצר", en: "Product management" }, { id: "development", he: "פיתוח", en: "Development" }, { id: "promptEngineering", he: "הנדסת פרומפטים", en: "Prompt Engineering" }, { id: "agents", he: "סוכני AI", en: "AI Agents" }, { id: "automation", he: "אוטומציה", en: "Automation" }, { id: "research", he: "מחקר", en: "Research" },
];

export function OnboardingPage() {
  const { language } = useLanguage();
  const { profile: stored, save } = useOnboarding();
  const experience = useExperience();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(stored);
  const he = language === "he";
  const recommendation = recommendStartingPath(profile);
  const updateInterest = (interest: Interest) => setProfile((current) => ({ ...current, interests: current.interests.includes(interest) ? current.interests.filter((item) => item !== interest) : [...current.interests, interest] }));
  const finish = () => {
    const completed = { ...profile, completed: true, recommendationId: recommendation.id, updatedAt: new Date().toISOString() };
    save(completed);
    experience.setMode(profile.experienceLevel === "advanced" ? "advanced" : "beginner");
    navigate("/dashboard", { replace: true });
  };

  return <div className="page onboarding-page">
    <section className="onboarding-card" aria-labelledby="onboarding-title">
      <header><span className="eyebrow">{he ? `שלב ${step} מתוך 7` : `Step ${step} of 7`}</span><progress max={7} value={step} aria-label={he ? "התקדמות ההיכרות" : "Onboarding progress"} /><h1 id="onboarding-title">{he ? "היכרות עם האקדמיה" : "Set up your Academy experience"}</h1></header>
      {step === 1 && <div><h2>{he ? "ברוכים הבאים" : "Welcome"}</h2><p>{he ? "כאן לומדים AI ובונים פרומפטים, סוכנים ותהליכי עבודה. רוב המידע נשמר בדפדפן המקומי; ענן זמין רק לאחר חיבור וכניסה." : "Learn AI and build prompts, agents, and workflows. Most data stays in this browser; cloud capabilities require configuration and sign-in."}</p><p role="note">{he ? "Mock הוא סימולציה ו-Dry Run הוא תצוגה מקדימה. אף אחד מהם אינו מפעיל ספק או כלי אמיתי." : "Mock is a simulation and Dry Run is a preview. Neither calls a live provider or real tool."}</p></div>}
      {step === 2 && <fieldset><legend>{he ? "מה המטרה העיקרית שלך?" : "What is your main goal?"}</legend><div className="onboarding-options">{goals.map((goal) => <label key={goal.id}><input type="radio" name="goal" checked={profile.mainGoal === goal.id} onChange={() => setProfile((current) => ({ ...current, mainGoal: goal.id }))} />{he ? goal.he : goal.en}</label>)}</div></fieldset>}
      {step === 3 && <fieldset><legend>{he ? "מה רמת הניסיון שלך?" : "What is your experience level?"}</legend><div className="onboarding-options">{levels.map((level) => <label key={level.id}><input type="radio" name="level" checked={profile.experienceLevel === level.id} onChange={() => setProfile((current) => ({ ...current, experienceLevel: level.id }))} />{he ? level.he : level.en}</label>)}</div></fieldset>}
      {step === 4 && <fieldset><legend>{he ? "מה מעניין אותך? אפשר לבחור כמה." : "What interests you? Choose any that apply."}</legend><div className="onboarding-options onboarding-options-grid">{interests.map((interest) => <label key={interest.id}><input type="checkbox" checked={profile.interests.includes(interest.id)} onChange={() => updateInterest(interest.id)} />{he ? interest.he : interest.en}</label>)}</div></fieldset>}
      {step === 5 && <div><h2>{he ? "נקודת התחלה מומלצת" : "Recommended starting path"}</h2><article className="recommendation-card"><span className="status-badge">{recommendation.kind}</span><h3>{recommendation.title[language]}</h3><p>{recommendation.description[language]}</p></article><p>{he ? "ההמלצה דטרמיניסטית ונגזרת רק מהבחירות שלך. אפשר לשנות אותה מאוחר יותר." : "This deterministic recommendation uses only your selections. You can change it later."}</p></div>}
      {step === 6 && <div><h2>{he ? "איך להמשיך?" : "Choose how to continue"}</h2><div className="onboarding-account-options"><Link className="primary-button" to="/auth/register">{he ? "יצירת חשבון" : "Create account"}</Link><Link to="/auth/login">{he ? "כניסה" : "Sign in"}</Link><button type="button" onClick={() => setStep(7)}>{he ? "המשך כאורח" : "Continue as Guest"}</button></div><p>{he ? "מצב אורח שומר עבודה מקומית בלבד. אפשר לחבר חשבון מאוחר יותר." : "Guest mode keeps work on this device only. You can connect an account later."}</p></div>}
      {step === 7 && <div><h2>{he ? "הכול מוכן" : "You're ready"}</h2><p>{he ? "לוח הבקרה יציג את המטרה, ההמלצה והפריטים האחרונים שלך." : "Your Dashboard will reflect your goal, recommendation, and recent work."}</p><button className="primary-button" type="button" onClick={finish}>{he ? "פתיחת לוח הבקרה" : "Open my Dashboard"}</button></div>}
      <footer className="onboarding-actions">{step > 1 && <button type="button" onClick={() => setStep((current) => Math.max(1, current - 1))}>{he ? "הקודם" : "Previous"}</button>}{step < 6 && <button className="primary-button" type="button" onClick={() => setStep((current) => Math.min(7, current + 1))}>{he ? "הבא" : "Next"}</button>}<Link to="/">{he ? "דילוג לעת עתה" : "Skip for now"}</Link></footer>
    </section>
  </div>;
}
