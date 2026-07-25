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
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

/**
 * Elements explicitly opted out of comparison: real git commit/branch in the
 * QA Center header, each Recent Items row, and the About page's Commit/Build
 * facts. In each case the earlier mask targeted only the inline dynamic
 * value (a `<dd>` or `<time>`), not the row it sits in. `.runtime-facts dl >
 * div` lays each row out as `grid-template-columns: minmax(7rem, 0.3fr) 1fr`
 * (see src/styles/index.css) — a fixed, layout-determined track, not one
 * sized to the `<dd>`'s own text. But masking only the `<dd>` still reads
 * that element's own getBoundingClientRect(), whose exact pixel boundary can
 * shift by a hairline depending on the rendered width of its content (the
 * commit SHA and build timestamp differ every build, and without
 * `font-variant-numeric: tabular-nums` different digit glyphs have very
 * slightly different advance widths). Two builds with different text in the
 * same fixed-width cell can therefore mask a boundary that's a sub-pixel off
 * from one another, leaving a one- or two-pixel sliver uncovered right at
 * the edge. Masking the whole (content-independent) row container instead
 * of the inline value removes that boundary from comparison entirely.
 */
export function dynamicMasks(page: Page): Locator[] {
  return [
    page.locator('[data-visual-mask]:not([data-visual-mask="runtime-id"]), .recent-items li, .about-page .runtime-facts > div:nth-child(2), .about-page .runtime-facts > div:nth-child(3)'),
    page.locator('.runtime-facts dl > div:has([data-visual-mask="runtime-id"])'),
  ];
}

export const screenshotOptions = {
  animations: "disabled" as const,
};
