# Version 1.4 release recovery audit

Version: `1.4.0-beta.1`
Branch: `fix/1.4.0-ci-memory-visual-release`

The machine-readable record is [`release-recovery-audit.json`](release-recovery-audit.json). Seventeen confirmed findings were recorded: fourteen code/configuration defects were fixed, one dependency risk was deliberately not force-fixed, and Linux visual approval plus GitHub main rules remain external/human blockers. No Critical finding was confirmed. High findings are RR-001–004, RR-006–009, RR-011, and RR-013–016; RR-017 is Medium.

Direct `latest` selectors were replaced with compatible ranges anchored to `package-lock.json`: `@tailwindcss/vite` `^4.3.2`, React/React DOM `^19.2.7`, React Router `^7.18.1`, Tailwind `^4.3.2`, Testing Library packages `^6.9.1`/`^16.3.2`/`^14.6.1`, Node/React type packages `^26.1.1`/`^19.2.17`/`^19.2.3`, React Hooks/Refresh `^7.1.1`/`^0.5.3`, globals `^17.7.0`, TypeScript `^6.0.3`, and typescript-eslint `^8.63.0`. Risk is limited to compatible updates; `npm ci`, unit, browser, build, and release validation provide verification.

Release readiness remains blocked until every mandatory command is current and green, reviewed Linux images are committed, human UX/security/content reviews are approved, the npm advisory is accepted or removed upstream, and an administrator verifies the main ruleset.
