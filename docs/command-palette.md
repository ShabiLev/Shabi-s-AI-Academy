# Command Palette

Ctrl/Cmd+K or Ctrl/Cmd+Shift+P opens the accessible application-wide Command Palette. One typed registry owns bilingual navigation, creation, workspace actions, and contextual commands, including availability and disabled reasons.

Arrow keys move through results, Enter executes, and Escape closes and restores focus. Medium-risk actions such as export or clearing recents require confirmation. Commands cannot execute arbitrary code; the executor accepts only the closed action union in `src/commands/types.ts`. History stays browser-local and bounded.

