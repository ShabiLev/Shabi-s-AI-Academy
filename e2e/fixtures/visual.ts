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
  /* Even with the sidebar/header blur disabled above, .profile-backdrop's
     alpha blend over the dashboard content behind it still leaves ~1-unit
     GPU rounding jitter across the frame (desktop uses a lighter .34 alpha;
     the mobile sheet's heavier .66 alpha stays stable, which is the tell).
     Flattening it to an opaque approximation for screenshots removes the
     blend math entirely without changing any other baseline's appearance. */
  body:has(.profile-layer) .profile-backdrop {
    background: rgb(2, 6, 11) !important;
  }
`;

/**
 * Wait for web fonts to finish loading before any interaction that measures
 * layout — a click that triggers the browser's scroll-into-view (off-screen
 * targets) or app code that measures an element's `getBoundingClientRect()`
 * (e.g. ProfileMenu's popover positioning) can compute a different result
 * depending on whether fallback or final font metrics are in effect at that
 * instant. `stabilize()` already waits for fonts before the screenshot, but
 * that's too late if an earlier click already scrolled or positioned
 * something using not-yet-final metrics. Call this before such interactions,
 * not just before the capture.
 */
export async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
}

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

/**
 * Elements explicitly opted out of comparison (e.g. real git commit/branch
 * fields). `[data-visual-mask]` covers the general case (RunDetails,
 * RunHistory, Aos pages), but on the About and QA Center pages the masked
 * dd sits in a fractional (`1fr`/grid) column whose exact pixel width comes
 * from fractional-track rounding of the row's own width — that can differ
 * by a pixel between renders, leaving a 1-2px rounding sliver exposed right
 * at the dd-sized mask's own edge. Also masking the whole dt+dd row (whose
 * bounding box comes from fixed page/card padding, not fractional grid
 * math) on those two pages removes that sensitivity; the extra box just
 * overlaps the dd's own mask, so nothing is under-covered elsewhere.
 */
export function dynamicMasks(page: Page): Locator[] {
  return [
    page.locator(
      [
        "[data-visual-mask]",
        ".about-page .runtime-facts > div:nth-child(2)",
        ".about-page .runtime-facts > div:nth-child(3)",
        ".qa-header-grid > div:has(> [data-visual-mask])",
      ].join(", "),
    ),
  ];
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
