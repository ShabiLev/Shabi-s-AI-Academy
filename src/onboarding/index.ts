export { OnboardingProvider, useOnboarding } from "./OnboardingContext";
export { emptyOnboardingProfile, loadOnboardingProfile, ONBOARDING_STORAGE_KEY, parseOnboardingProfile } from "./onboardingStorage";
export { getRecommendation, recommendStartingPath, startingRecommendations } from "./recommendations";
export { interestDisplayLabel, interestLabels, interests } from "./interestLabels";
export type { ExperienceLevel, Interest, MainGoal, OnboardingProfile, StartingRecommendation } from "./types";
