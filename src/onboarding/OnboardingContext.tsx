/* eslint-disable react-refresh/only-export-components -- Provider and hook share the onboarding storage boundary. */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../auth";
import { useGuestProfile } from "../guest-profile";
import { loadOnboardingProfile, saveOnboardingProfile } from "./onboardingStorage";
import type { OnboardingProfile } from "./types";

interface OnboardingContextValue { profile: OnboardingProfile; save: (profile: OnboardingProfile) => void; restart: () => void; }
const OnboardingContext = createContext<OnboardingContextValue | null>(null);
const radarTopicIds: Record<string, string> = {
  qa: "evaluation",
  promptEngineering: "prompting",
  development: "developer-tools",
  research: "models",
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const guest = useGuestProfile();
  const userId = user?.id ?? "anonymous";
  const [state, setState] = useState(() => ({ userId, profile: loadOnboardingProfile(localStorage, userId) }));
  const profile = state.userId === userId ? state.profile : loadOnboardingProfile(localStorage, userId);
  const value = useMemo<OnboardingContextValue>(() => ({
    profile,
    save: (next) => {
      saveOnboardingProfile(next, localStorage, userId);
      guest.update((current) => ({
        ...current,
        selectedTopics: [...new Set(next.interests.map((interest) => radarTopicIds[interest] ?? interest))].slice(0, 24),
        experienceMode: next.experienceLevel === "advanced" ? "advanced" : current.experienceMode,
      }));
      setState({ userId, profile: next });
    },
    restart: () => { const next = { ...profile, completed: false }; saveOnboardingProfile(next, localStorage, userId); setState({ userId, profile: next }); },
  }), [guest, profile, userId]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used within OnboardingProvider");
  return value;
}
