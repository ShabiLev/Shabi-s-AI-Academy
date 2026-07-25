/* eslint-disable react-refresh/only-export-components -- Provider and typed hook form one preference boundary. */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../auth";
import { loadExperiencePreferences, saveExperiencePreferences } from "./experienceStorage";
import type { ExperienceMode, ExperiencePreferences } from "./types";

interface ExperienceContextValue extends ExperiencePreferences {
  setMode: (mode: ExperienceMode) => void;
  setDeveloperModeEnabled: (enabled: boolean) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const [state, setState] = useState(() => ({ userId, preferences: loadExperiencePreferences(window.localStorage, userId) }));
  const preferences = state.userId === userId ? state.preferences : loadExperiencePreferences(window.localStorage, userId);
  const value = useMemo<ExperienceContextValue>(() => {
    const update = (next: ExperiencePreferences) => { saveExperiencePreferences(next, window.localStorage, userId); setState({ userId, preferences: next }); };
    return {
      ...preferences,
      setMode: (mode) => update({ ...preferences, mode, developerModeEnabled: mode === "advanced" && preferences.developerModeEnabled }),
      setDeveloperModeEnabled: (enabled) => update({ ...preferences, mode: enabled ? "advanced" : preferences.mode, developerModeEnabled: enabled }),
    };
  }, [preferences, userId]);
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error("useExperience must be used within ExperienceProvider");
  return value;
}
