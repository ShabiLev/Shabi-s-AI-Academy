/* eslint-disable react-refresh/only-export-components -- Provider and hook share the tour state contract. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { findTour } from "./tourData";
import { readCompletedTours, writeCompletedTours } from "./tourStorage";

interface TourContextValue { completed: string[]; activeId: string | null; startTour: (id: string) => void; }
const TourContext = createContext<TourContextValue | null>(null);

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState(readCompletedTours);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tour = activeId ? findTour(activeId) : undefined;

  const close = useCallback((finish = false) => {
    if (finish && activeId) setCompleted((current) => { const next = [...new Set([...current, activeId])]; writeCompletedTours(next); return next; });
    setActiveId(null); setStep(0); requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [activeId]);
  const startTour = useCallback((id: string) => {
    const next = findTour(id); if (!next) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStep(0); setActiveId(id); navigate(next.route);
  }, [navigate]);

  useEffect(() => {
    if (!activeId) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  const value = useMemo(() => ({ completed, activeId, startTour }), [activeId, completed, startTour]);
  return <TourContext.Provider value={value}>{children}{tour && <div className="tour-layer" role="presentation">
    <button className="tour-overlay" aria-label={language === "he" ? "דלג על הסיור" : "Skip tour"} onClick={() => close()} />
    <section className="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-title" aria-describedby="tour-description">
      <button ref={closeRef} className="tour-skip" type="button" onClick={() => close()}>{language === "he" ? "דלג" : "Skip"}</button>
      <p className="eyebrow">{language === "he" ? `שלב ${step + 1} מתוך ${tour.steps.length}` : `Step ${step + 1} of ${tour.steps.length}`}</p>
      <progress value={step + 1} max={tour.steps.length} aria-label={language === "he" ? "התקדמות בסיור" : "Tour progress"} />
      <h2 id="tour-title">{tour.steps[step].title[language]}</h2><p id="tour-description">{tour.steps[step].description[language]}</p>
      <div className="tour-actions">
        <button type="button" className="button button-secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>{language === "he" ? "הקודם" : "Previous"}</button>
        {step < tour.steps.length - 1
          ? <button type="button" className="button button-primary" onClick={() => setStep((value) => value + 1)}>{language === "he" ? "הבא" : "Next"}</button>
          : <button type="button" className="button button-primary" onClick={() => close(true)}>{language === "he" ? "סיום" : "Finish"}</button>}
      </div>
    </section>
  </div>}</TourContext.Provider>;
}

export function useGuidedTour() { const value = useContext(TourContext); if (!value) throw new Error("useGuidedTour must be used within GuidedTourProvider"); return value; }
