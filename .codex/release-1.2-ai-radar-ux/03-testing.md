# Testing

Vitest covers Radar schema, translations, source allowlist, immutable filtering, date/freshness behavior, and profile focus behavior. Playwright covers the Radar workflow and profile menu in Hebrew/English, desktop/mobile, 320 px width, outside/Escape close, focus return, backdrop inertness, viewport containment, scroll independence, wrapping, clipping, and horizontal overflow.

## Browser evidence

Axe scans the Radar and open profile states. Reviewed visual baselines cover Hebrew and English desktop and mobile profile menus plus representative Radar states. The release matrix is 320 x 568, 390 x 844, 768 x 1024, and 1440 x 900 in both directions, including keyboard-only operation, a scrolled sidebar, repeated open/close, 200% zoom, and assistant coexistence.

## Release gate

Run focused lint, unit, E2E, accessibility, and visual tests while developing. Run `npm run validate:release` before the release commit. Record manual checks honestly; automation does not prove screen-reader or human visual review.
