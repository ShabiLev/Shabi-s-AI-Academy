/* eslint-disable react-refresh/only-export-components -- Provider and hook share the tour state contract. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { useGuestProfile } from "../../guest-profile";
import { useLanguage } from "../../i18n/LanguageContext";
import { useOnboarding } from "../../onboarding";
import { findTour } from "./tourData";
import { readCompletedTours, writeCompletedTours } from "./tourStorage";
import {
  FIRST_VISIT_TOUR_ID,
  createWalkthroughRecord,
  readWalkthroughRecord,
  writeWalkthroughRecord,
  type WalkthroughRecord,
} from "./walkthroughStorage";

interface TourContextValue {
  completed: string[];
  activeId: string | null;
  firstVisit: WalkthroughRecord;
  startTour: (id: string) => void;
  restartFirstVisit: () => void;
  resetFirstVisit: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TourContext = createContext<TourContextValue | null>(null);
const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function visibleWalkthroughTarget(name: string): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(`[data-walkthrough="${name}"]`)]
    .find((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    });
}

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const guest = useGuestProfile();
  const onboarding = useOnboarding();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const actorId = user?.accountType === "cloud" ? user.id : guest.profile.anonymousProfileId;
  const [completed, setCompleted] = useState(readCompletedTours);
  const [walkthroughState, setWalkthroughState] = useState(() => ({
    actorId,
    record: readWalkthroughRecord(actorId, language),
  }));
  const firstVisit = walkthroughState.actorId === actorId
    ? walkthroughState.record
    : readWalkthroughRecord(actorId, language);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const tour = activeId ? findTour(activeId) : undefined;
  const currentStep = tour?.steps[step];
  const isFirstVisit = activeId === FIRST_VISIT_TOUR_ID;

  const saveFirstVisit = useCallback((change: (record: WalkthroughRecord) => WalkthroughRecord) => {
    setWalkthroughState((current) => {
      const base = current.actorId === actorId ? current.record : readWalkthroughRecord(actorId, language);
      const next = change(base);
      writeWalkthroughRecord(actorId, next);
      return { actorId, record: next };
    });
  }, [actorId, language]);

  useEffect(() => {
    if (walkthroughState.actorId === actorId) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setActiveId(null);
      setStep(0);
      setWalkthroughState({ actorId, record: readWalkthroughRecord(actorId, language) });
    });
    return () => { active = false; };
  }, [actorId, language, walkthroughState.actorId]);

  useEffect(() => {
    if (firstVisit.language === language) return;
    let active = true;
    queueMicrotask(() => {
      if (active) saveFirstVisit((current) => ({ ...current, language, updatedAt: new Date().toISOString() }));
    });
    return () => { active = false; };
  }, [firstVisit.language, language, saveFirstVisit]);

  const close = useCallback((finish = false) => {
    if (activeId) {
      if (isFirstVisit) {
        const timestamp = new Date().toISOString();
        saveFirstVisit((current) => ({
          ...current,
          status: finish ? "completed" : "dismissed",
          currentStep: finish ? 7 : step,
          updatedAt: timestamp,
          completedAt: finish ? timestamp : current.completedAt,
          dismissedAt: finish ? null : timestamp,
          language,
        }));
      } else if (finish) {
        setCompleted((current) => {
          const next = [...new Set([...current, activeId])];
          writeCompletedTours(next);
          return next;
        });
      }
    }
    setActiveId(null);
    setStep(0);
    setTargetRect(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [activeId, isFirstVisit, language, saveFirstVisit, step]);

  const beginFirstVisit = useCallback((restart = false) => {
    const timestamp = new Date().toISOString();
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    saveFirstVisit((current) => ({
      ...current,
      status: "in-progress",
      currentStep: 0,
      startedAt: restart || !current.startedAt ? timestamp : current.startedAt,
      updatedAt: timestamp,
      completedAt: null,
      dismissedAt: null,
      language,
    }));
    setStep(0);
    setActiveId(FIRST_VISIT_TOUR_ID);
    if (location.pathname !== "/dashboard") navigate("/dashboard");
  }, [language, location.pathname, navigate, saveFirstVisit]);

  const startTour = useCallback((id: string) => {
    const next = findTour(id);
    if (!next) return;
    if (id === FIRST_VISIT_TOUR_ID) {
      beginFirstVisit(true);
      return;
    }
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setStep(0);
    setActiveId(id);
    navigate(next.route);
  }, [beginFirstVisit, navigate]);

  const resetFirstVisit = useCallback(() => {
    const next = createWalkthroughRecord(language);
    writeWalkthroughRecord(actorId, next);
    setWalkthroughState({ actorId, record: next });
    if (activeId === FIRST_VISIT_TOUR_ID) {
      setActiveId(null);
      setStep(0);
    }
  }, [activeId, actorId, language]);

  useEffect(() => {
    if (activeId || !onboarding.profile.completed || location.pathname !== "/dashboard") return;
    if (document.querySelector("[role='dialog'], [aria-modal='true']")) return;
    if (firstVisit.status === "completed" || firstVisit.status === "dismissed") return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setStep(firstVisit.status === "in-progress" ? firstVisit.currentStep : 0);
      setActiveId(FIRST_VISIT_TOUR_ID);
    });
    return () => { active = false; };
  }, [activeId, firstVisit.currentStep, firstVisit.status, location.pathname, onboarding.profile.completed]);

  const updateTarget = useCallback(() => {
    if (!currentStep?.target) {
      setTargetRect(null);
      return true;
    }
    const target = visibleWalkthroughTarget(currentStep.target);
    if (!target) return false;
    const reduced = document.documentElement.dataset.motion === "reduced"
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
    const rect = target.getBoundingClientRect();
    setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    return true;
  }, [currentStep]);

  const setFirstVisitStep = useCallback((nextStep: number) => {
    setStep(nextStep);
    saveFirstVisit((current) => ({
      ...current,
      status: "in-progress",
      currentStep: nextStep,
      startedAt: current.startedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language,
    }));
  }, [language, saveFirstVisit]);

  const advance = useCallback(() => {
    if (!tour || step >= tour.steps.length - 1) return;
    if (currentStep?.action === "open-mobile-navigation") {
      window.dispatchEvent(new Event("academy:open-navigation"));
    }
    const next = step + 1;
    if (isFirstVisit) setFirstVisitStep(next);
    else setStep(next);
  }, [currentStep?.action, isFirstVisit, setFirstVisitStep, step, tour]);

  const retreat = useCallback(() => {
    if (step === 0) return;
    const next = step - 1;
    if (isFirstVisit) setFirstVisitStep(next);
    else setStep(next);
  }, [isFirstVisit, setFirstVisitStep, step]);

  useEffect(() => {
    if (!activeId || !tour) return;
    const app = document.querySelector<HTMLElement>(".app-shell");
    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = app ? app.getAttribute("aria-hidden") : null;
    if (app) {
      app.setAttribute("inert", "");
      app.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (app) {
        app.removeAttribute("inert");
        if (previousAriaHidden === null) app.removeAttribute("aria-hidden");
        else app.setAttribute("aria-hidden", previousAriaHidden);
      }
    };
  }, [activeId, close, tour]);

  useEffect(() => {
    if (!activeId || !tour) return;
    let disposed = false;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (disposed || updateTarget() || !currentStep?.target) return;
        console.info("[walkthrough] skipped unavailable target", {
          tourId: tour.id,
          step,
          target: currentStep.target,
        });
        advance();
      });
    });
    const observer = new MutationObserver(() => updateTarget());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    const onLayout = () => updateTarget();
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      disposed = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      observer.disconnect();
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [activeId, advance, currentStep?.target, step, tour, updateTarget]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])];
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const cardStyle = useMemo<CSSProperties | undefined>(() => {
    if (!targetRect || typeof window === "undefined" || window.innerWidth <= 768) return undefined;
    const width = Math.min(448, window.innerWidth - 32);
    const left = Math.min(Math.max(16, targetRect.left + targetRect.width + 20), window.innerWidth - width - 16);
    const top = Math.min(Math.max(16, targetRect.top), window.innerHeight - 360);
    return { left, top, width };
  }, [targetRect]);
  const spotlightStyle = targetRect ? {
    top: Math.max(8, targetRect.top - 8),
    left: Math.max(8, targetRect.left - 8),
    width: Math.min(window.innerWidth - 16, targetRect.width + 16),
    height: Math.min(window.innerHeight - 16, targetRect.height + 16),
  } : undefined;

  const value = useMemo<TourContextValue>(() => ({
    completed,
    activeId,
    firstVisit,
    startTour,
    restartFirstVisit: () => beginFirstVisit(true),
    resetFirstVisit,
  }), [activeId, beginFirstVisit, completed, firstVisit, resetFirstVisit, startTour]);

  return <TourContext.Provider value={value}>
    {children}
    {tour && <div className={`tour-layer${targetRect ? " has-target" : ""}`} role="presentation" data-tour-id={tour.id}>
      <div className="tour-overlay" aria-hidden="true" />
      {spotlightStyle && <div className="tour-spotlight" aria-hidden="true" style={spotlightStyle} />}
      <section
        ref={dialogRef}
        className="tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
        onKeyDown={trapFocus}
        style={cardStyle}
      >
        <button ref={closeRef} className="tour-skip" type="button" onClick={() => close()}>
          {language === "he" ? (isFirstVisit ? "לא עכשיו" : "דלג") : (isFirstVisit ? "Not now" : "Skip")}
        </button>
        <p className="eyebrow" aria-live="polite">
          {language === "he" ? `שלב ${step + 1} מתוך ${tour.steps.length}` : `Step ${step + 1} of ${tour.steps.length}`}
        </p>
        <progress value={step + 1} max={tour.steps.length} aria-label={language === "he" ? "התקדמות בסיור" : "Tour progress"} />
        <h2 id="tour-title">{currentStep?.title[language]}</h2>
        <p id="tour-description">{currentStep?.description[language]}</p>
        <div className="tour-actions">
          <button type="button" className="button button-secondary" disabled={step === 0} onClick={retreat}>
            {language === "he" ? "הקודם" : "Previous"}
          </button>
          {step < tour.steps.length - 1
            ? <button type="button" className="button button-primary" onClick={advance}>
              {language === "he"
                ? (isFirstVisit && step === 0 ? "התחלת הסיור" : "הבא")
                : (isFirstVisit && step === 0 ? "Start tour" : "Next")}
            </button>
            : <button type="button" className="button button-primary" onClick={() => close(true)}>
              {language === "he" ? "סיום" : "Finish"}
            </button>}
        </div>
      </section>
    </div>}
  </TourContext.Provider>;
}

export function useGuidedTour() {
  const value = useContext(TourContext);
  if (!value) throw new Error("useGuidedTour must be used within GuidedTourProvider");
  return value;
}
