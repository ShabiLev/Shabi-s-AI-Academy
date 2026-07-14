/* eslint-disable react-refresh/only-export-components -- Provider and hook share the onboarding storage boundary. */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { loadOnboardingProfile, saveOnboardingProfile } from "./onboardingStorage";
import type { OnboardingProfile } from "./types";

interface OnboardingContextValue { profile: OnboardingProfile; save: (profile: OnboardingProfile) => void; restart: () => void; }
const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(loadOnboardingProfile);
  const value = useMemo<OnboardingContextValue>(() => ({
    profile,
    save: (next) => { saveOnboardingProfile(next); setProfile(next); },
    restart: () => { const next = { ...profile, completed: false }; saveOnboardingProfile(next); setProfile(next); },
  }), [profile]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used within OnboardingProvider");
  return value;
}
