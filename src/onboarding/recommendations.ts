import type { MainGoal, OnboardingProfile, StartingRecommendation } from "./types";

export const startingRecommendations: readonly StartingRecommendation[] = [
  { id: "foundations", route: "/lessons/ai-llm-agent", kind: "lesson", title: { he: "יסודות AI, מודלים וסוכנים", en: "AI, models, and agents foundations" }, description: { he: "התחלה קצרה שמסבירה את אבני הבניין לפני יצירה.", en: "A concise starting point before you build." } },
  { id: "prompt-pack", route: "/prompts/packs", kind: "promptPack", title: { he: "חבילת פרומפטים להתחלה", en: "Starter Prompt Pack" }, description: { he: "ייבוא דוגמאות מובנות לספרייה המקומית שלך.", en: "Import structured examples into your local library." } },
  { id: "starter-agent", route: "/agents/catalog", kind: "starterAgent", title: { he: "סוכן מוכן ללמידה", en: "Starter Agent" }, description: { he: "בחירת Blueprint מוכן ובדיקה במצב Mock.", en: "Choose a ready Blueprint and inspect it in Mock mode." } },
  { id: "workflow", route: "/workflows/new", kind: "project", title: { he: "בניית תהליך עבודה ראשון", en: "Build your first workflow" }, description: { he: "חיבור שלבים מקומיים בתהליך דטרמיניסטי.", en: "Connect local steps in a deterministic workflow." } },
  { id: "qa-tour", route: "/qa?tour=1", kind: "tour", title: { he: "סיור במרכז QA", en: "QA Center tour" }, description: { he: "היכרות עם שערים, ראיות ומוכנות לשחרור.", en: "Learn the gates, evidence, and release-readiness model." } },
  { id: "dashboard-tour", route: "/?tour=1", kind: "tour", title: { he: "סיור בפלטפורמה", en: "Platform tour" }, description: { he: "סקירה קצרה של למידה, יצירה וסביבת העבודה.", en: "A short tour of Learn, Build, and Workspace." } },
];

const goalRecommendation: Record<MainGoal, string> = {
  learn: "foundations", prompts: "prompt-pack", agent: "starter-agent", workflow: "workflow", qa: "qa-tour", explore: "dashboard-tour",
};

export function recommendStartingPath(profile: Pick<OnboardingProfile, "mainGoal" | "interests" | "experienceLevel">): StartingRecommendation {
  const id = profile.interests.includes("qa") && profile.mainGoal === "explore" ? "qa-tour" : goalRecommendation[profile.mainGoal];
  return startingRecommendations.find((item) => item.id === id) ?? startingRecommendations[0];
}

export function getRecommendation(id: string): StartingRecommendation {
  return startingRecommendations.find((item) => item.id === id) ?? startingRecommendations[0];
}
