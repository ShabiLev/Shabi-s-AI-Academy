export type MainGoal = "learn" | "prompts" | "agent" | "workflow" | "qa" | "explore";
export type ExperienceLevel = "beginner" | "some" | "advanced";
export type Interest = "qa" | "sql" | "product" | "development" | "promptEngineering" | "agents" | "automation" | "research";

export interface OnboardingProfile {
  schemaVersion: 1;
  mainGoal: MainGoal;
  experienceLevel: ExperienceLevel;
  interests: Interest[];
  completed: boolean;
  recommendationId: string;
  updatedAt: string;
}

export interface StartingRecommendation {
  id: string;
  route: string;
  title: { he: string; en: string };
  description: { he: string; en: string };
  kind: "lesson" | "promptPack" | "starterAgent" | "project" | "tour";
}
