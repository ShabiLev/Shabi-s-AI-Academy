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
`;

/**
 * Call right before any screenshot: disables CSS animations/transitions and
 * waits for web fonts, so two runs on an unchanged UI produce pixel-identical
 * output regardless of timing.
 */
export async function stabilize(page: Page): Promise<void> {
  await page.addStyleTag({ content: disableAnimationsCss });
  await page.evaluate(() => document.fonts.ready);
}

/** Elements explicitly opted out of comparison (e.g. real git commit/branch in the QA Center header). */
export function dynamicMasks(page: Page): Locator[] {
  return [page.locator("[data-visual-mask], .about-page .runtime-facts > div:nth-child(2) dd, .about-page .runtime-facts > div:nth-child(3) dd")];
}

export const screenshotOptions = {
  animations: "disabled" as const,
};
