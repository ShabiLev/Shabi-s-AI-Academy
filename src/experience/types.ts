export type ExperienceMode = "beginner" | "advanced";

export interface ExperiencePreferences {
  schemaVersion: 1;
  mode: ExperienceMode;
  developerModeEnabled: boolean;
}
