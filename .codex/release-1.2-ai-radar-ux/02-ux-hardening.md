# UX hardening

## Shared requirements

- Keep every page within the viewport at 320 px without hiding essential content.
- Use logical properties for semantic direction, bounded controls and readable wrapping.
- Preserve visible focus, 44 px controls, reduced motion, contrast, and keyboard operation at 200% zoom.
- Use the layer scale: base `0`, sticky `20`, popover `40`, modal `60`, critical notification `80`.

## Profile menu

Desktop uses a portal-based popover anchored to the trigger's logical start edge: right in RTL and left in LTR. Viewport collision handling clamps both axes. The solid, bounded surface sits above navigation with an inert backdrop so underlying navigation cannot be activated. It is independent of sidebar scrolling and clipping contexts.

Mobile uses a full-width bottom sheet inside the existing navigation dialog. It never creates a second scroll region over navigation. Opening moves focus to the first menu item; Escape or outside activation closes it; closing restores focus to the trigger. Arrow/Home/End keys provide menu navigation. Long labels wrap without separating icons or controls.

## Audit scope

Review AppLayout, desktop sidebar, mobile drawer, header, assistant, dialogs, popovers, shared fields/cards/tables, direction selectors, sticky/fixed positioning, transforms, overflow, and layer ownership in both languages and the required viewport matrix.
