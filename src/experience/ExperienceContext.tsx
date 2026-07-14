/* eslint-disable react-refresh/only-export-components -- Provider and typed hook form one preference boundary. */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { loadExperiencePreferences, saveExperiencePreferences } from "./experienceStorage";
import type { ExperienceMode, ExperiencePreferences } from "./types";

interface ExperienceContextValue extends ExperiencePreferences {
  setMode: (mode: ExperienceMode) => void;
  setDeveloperModeEnabled: (enabled: boolean) => void;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(loadExperiencePreferences);
  const value = useMemo<ExperienceContextValue>(() => {
    const update = (next: ExperiencePreferences) => { saveExperiencePreferences(next); setPreferences(next); };
    return {
      ...preferences,
      setMode: (mode) => update({ ...preferences, mode, developerModeEnabled: mode === "advanced" && preferences.developerModeEnabled }),
      setDeveloperModeEnabled: (enabled) => update({ ...preferences, mode: enabled ? "advanced" : preferences.mode, developerModeEnabled: enabled }),
    };
  }, [preferences]);
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error("useExperience must be used within ExperienceProvider");
  return value;
}
