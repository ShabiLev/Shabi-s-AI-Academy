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
import {
  FIRST_VISIT_TOUR_ID,
  beginWalkthrough,
  closeWalkthrough,
  completeWalkthrough,
  createWalkthroughRecord,
  readWalkthroughRecord,
  updateWalkthroughStep,
  writeWalkthroughRecord,
  type WalkthroughRecord,
  type WalkthroughRunMode,
} from "./walkthroughStorage";

interface TourContextValue {
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

type BubblePlacement = "top" | "bottom" | "left" | "right" | "center";

const TourContext = createContext<TourContextValue | null>(null);
const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function visibleWalkthroughTarget(name: string): HTMLElement | undefined {
  const names = name === "main-navigation" ? ["main-navigation", "mobile-menu"] : [name];
  const candidates = names.flatMap((targetName) =>
    [...document.querySelectorAll<HTMLElement>(`[data-walkthrough="${targetName}"]`)],
  );
  for (const element of candidates) {
    const group = element.closest("details");
    if (group && !group.open) group.open = true;
  }
  return candidates.find((element) => {
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
  const [walkthroughState, setWalkthroughState] = useState(() => ({
    actorId,
    record: readWalkthroughRecord(actorId, language),
  }));
  const firstVisit = walkthroughState.actorId === actorId
    ? walkthroughState.record
    : readWalkthroughRecord(actorId, language);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [runMode, setRunMode] = useState<WalkthroughRunMode>("first-visit");
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [dialogHeight, setDialogHeight] = useState(320);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const temporarilyClosedRef = useRef(false);
  const tour = activeId ? findTour(activeId) : undefined;
  const currentStep = tour?.steps[step];

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
    if (activeId && runMode !== "manual-replay") {
      saveFirstVisit((current) => finish
        ? completeWalkthrough(current, language)
        : closeWalkthrough(current, step, runMode, language));
    }
    temporarilyClosedRef.current = !finish && runMode !== "manual-replay";
    setActiveId(null);
    setStep(0);
    setTargetRect(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, [activeId, language, runMode, saveFirstVisit, step]);

  const beginFirstVisit = useCallback((mode: WalkthroughRunMode) => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    temporarilyClosedRef.current = false;
    setRunMode(mode);
    saveFirstVisit((current) => beginWalkthrough(current, mode, language));
    setStep(mode === "resume" ? firstVisit.currentStep : 0);
    setActiveId(FIRST_VISIT_TOUR_ID);
    if (location.pathname !== "/dashboard") navigate("/dashboard");
  }, [firstVisit.currentStep, language, location.pathname, navigate, saveFirstVisit]);

  const startTour = useCallback((id: string) => {
    const next = findTour(id);
    if (!next) return;
    if (id === FIRST_VISIT_TOUR_ID) {
      beginFirstVisit(firstVisit.status === "completed" ? "manual-replay" : "first-visit");
      return;
    }
  }, [beginFirstVisit, firstVisit.status]);

  const resetFirstVisit = useCallback(() => {
    const next = createWalkthroughRecord(language);
    writeWalkthroughRecord(actorId, next);
    setWalkthroughState({ actorId, record: next });
    if (activeId === FIRST_VISIT_TOUR_ID) {
      setActiveId(null);
      setStep(0);
    }
    temporarilyClosedRef.current = false;
  }, [activeId, actorId, language]);

  useEffect(() => {
    if (activeId || !onboarding.profile.completed || location.pathname !== "/dashboard") return;
    if (document.querySelector("[role='dialog'], [aria-modal='true']")) return;
    if (firstVisit.status === "completed" || temporarilyClosedRef.current) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      beginFirstVisit(firstVisit.status === "in-progress" ? "resume" : "first-visit");
    });
    return () => { active = false; };
  }, [activeId, beginFirstVisit, firstVisit.status, location.pathname, onboarding.profile.completed]);

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
    saveFirstVisit((current) => updateWalkthroughStep(current, nextStep, runMode, language));
  }, [language, runMode, saveFirstVisit]);

  const advance = useCallback(() => {
    if (!tour || step >= tour.steps.length - 1) return;
    if (currentStep?.action === "open-mobile-navigation") {
      window.dispatchEvent(new Event("academy:open-navigation"));
    }
    const next = step + 1;
    setFirstVisitStep(next);
  }, [currentStep?.action, setFirstVisitStep, step, tour]);

  const retreat = useCallback(() => {
    if (step === 0) return;
    const next = step - 1;
    setFirstVisitStep(next);
  }, [setFirstVisitStep, step]);

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
    if (!activeId || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const updateDialogHeight = () => setDialogHeight(dialog.offsetHeight || 320);
    updateDialogHeight();
    const observer = new ResizeObserver(updateDialogHeight);
    observer.observe(dialog);
    return () => observer.disconnect();
  }, [activeId, step]);

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

  const bubbleLayout = useMemo((): { style?: CSSProperties; placement: BubblePlacement } => {
    if (!targetRect || typeof window === "undefined" || window.innerWidth <= 768) {
      return { placement: targetRect ? "bottom" : "center" };
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(448, viewportWidth - 32);
    const height = Math.min(dialogHeight, viewportHeight - 32);
    const gap = 24;
    const preferred = currentStep?.placement === "top" || currentStep?.placement === "bottom"
      ? currentStep.placement
      : currentStep?.placement === "start"
        ? (language === "he" ? "right" : "left")
        : currentStep?.placement === "end"
          ? (language === "he" ? "left" : "right")
          : "right";
    const opposite: Record<Exclude<BubblePlacement, "center">, Exclude<BubblePlacement, "center">> = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };
    const candidates = [...new Set([preferred, opposite[preferred], "bottom", "top", "right", "left"])] as Array<Exclude<BubblePlacement, "center">>;
    const fits = (placement: Exclude<BubblePlacement, "center">) => {
      if (placement === "right") return targetRect.left + targetRect.width + gap + width <= viewportWidth - 16;
      if (placement === "left") return targetRect.left - gap - width >= 16;
      if (placement === "bottom") return targetRect.top + targetRect.height + gap + height <= viewportHeight - 16;
      return targetRect.top - gap - height >= 16;
    };
    const placement = candidates.find(fits) ?? preferred;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    let left = targetCenterX - width / 2;
    let top = targetCenterY - height / 2;
    if (placement === "right") left = targetRect.left + targetRect.width + gap;
    if (placement === "left") left = targetRect.left - width - gap;
    if (placement === "bottom") top = targetRect.top + targetRect.height + gap;
    if (placement === "top") top = targetRect.top - height - gap;
    left = Math.min(Math.max(16, left), viewportWidth - width - 16);
    top = Math.min(Math.max(16, top), viewportHeight - height - 16);
    const pointerOffset = placement === "left" || placement === "right"
      ? Math.min(Math.max(36, targetCenterY - top), height - 36)
      : Math.min(Math.max(36, targetCenterX - left), width - 36);
    return {
      placement,
      style: {
        left,
        top,
        width,
        maxHeight: viewportHeight - 32,
        "--tour-pointer-offset": `${pointerOffset}px`,
      } as CSSProperties,
    };
  }, [currentStep?.placement, dialogHeight, language, targetRect]);
  const spotlightStyle = targetRect ? {
    top: Math.max(8, targetRect.top - 8),
    left: Math.max(8, targetRect.left - 8),
    width: Math.min(window.innerWidth - 16, targetRect.width + 16),
    height: Math.min(window.innerHeight - 16, targetRect.height + 16),
  } : undefined;

  const value = useMemo<TourContextValue>(() => ({
    activeId,
    firstVisit,
    startTour,
    restartFirstVisit: () => beginFirstVisit("manual-replay"),
    resetFirstVisit,
  }), [activeId, beginFirstVisit, firstVisit, resetFirstVisit, startTour]);

  return <TourContext.Provider value={value}>
    {children}
    {tour && <div className={`tour-layer${targetRect ? " has-target" : ""}`} role="presentation" data-tour-id={tour.id}>
      <div className="tour-overlay" aria-hidden="true" />
      {spotlightStyle && <div className="tour-spotlight" aria-hidden="true" style={spotlightStyle} />}
      <section
        ref={dialogRef}
        className="tour-card walkthrough-bubble"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
        onKeyDown={trapFocus}
        style={bubbleLayout.style}
        data-placement={bubbleLayout.placement}
      >
        {bubbleLayout.placement !== "center" && <span className="walkthrough-pointer" aria-hidden="true" />}
        <button ref={closeRef} className="tour-skip" type="button" onClick={() => close()}>
          {language === "he" ? "לא עכשיו" : "Not now"}
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
                ? (step === 0 ? "התחלת הסיור" : "הבא")
                : (step === 0 ? "Start tour" : "Next")}
            </button>
            : <button type="button" className="button button-primary" onClick={() => close(true)}>
              {language === "he" ? "הבנתי" : "Got it"}
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
