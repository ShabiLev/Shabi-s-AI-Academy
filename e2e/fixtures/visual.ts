import type { Locator, Page } from "@playwright/test";

const disableAnimationsCss = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
    caret-color: transparent !important;
  }
  progress, progress::-webkit-progress-bar, progress::-webkit-progress-value, progress::-moz-progress-bar {
    animation: none !important;
  }
  /* Compositing a translucent .profile-backdrop over the already-blurred
     sidebar/header is a real (if rare) source of ~1-unit GPU rounding jitter
     across almost the whole frame — only when the profile menu is open, which
     is why other pages stayed pixel-stable. Disabling blur only in that state
     keeps every other baseline's appearance unchanged. */
  body:has(.profile-layer) .desktop-sidebar,
  body:has(.profile-layer) .top-header {
    backdrop-filter: none !important;
  }
`;

/**
 * Call right before any screenshot: disables CSS animations/transitions and
 * waits for web fonts, so two runs on an unchanged UI produce pixel-identical
 * output regardless of timing.
 */
export async function stabilize(page: Page): Promise<void> {
  await page.addStyleTag({ content: disableAnimationsCss });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

/** Elements explicitly opted out of comparison (e.g. real git commit/branch in the QA Center header). */
export function dynamicMasks(page: Page): Locator[] {
  return [page.locator("[data-visual-mask], .about-page .runtime-facts > div:nth-child(2) dd, .about-page .runtime-facts > div:nth-child(3) dd")];
}

/**
 * Freeze Date.now()/new Date() to a fixed instant so timestamps recorded during
 * the test (e.g. Runtime event history) render identical text every run,
 * regardless of the locale's digit width for the actual hour/day. Only Date
 * results are frozen — setTimeout/async scheduling still runs in real time, so
 * this does not affect app behavior, only what "now" reports.
 */
export async function freezeClock(page: Page): Promise<void> {
  await page.clock.setFixedTime(new Date("2026-01-15T12:00:00.000Z"));
}

export const screenshotOptions = {
  animations: "disabled" as const,
};
