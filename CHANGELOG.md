# Changelog

All notable changes to this project are documented here following the Keep a Changelog format.

## [0.3.0] - 2026-07-11

### Added

- Playwright E2E infrastructure, automatic server startup, desktop/mobile projects, reports, traces, screenshots, and videos
- GitHub Actions validation and failure artifacts
- Typed bilingual course model, catalog, lesson pages, local progress, quizzes, drafts, reset, and two complete lessons

### Changed

- Dashboard progress and Continue Learning now use saved progress
- Validation now includes browser regression tests

### Fixed

- Removed hardcoded progress and excluded Coming soon lessons from calculations
- Improved responsive lesson, table, and quiz behavior

## [0.2.0] - 2026-07-11

### Added

- Authentication-ready architecture
- Demo login page
- Protected routes
- User profile menu
- Mobile Home and Back navigation
- Language selection in Settings

### Changed

- Improved desktop and mobile headers
- Language selector moved from the header to Settings
- Responsive behavior improved
- Hebrew user display name corrected to שבי

### Fixed

- Mobile layout overlap risks
- Empty placeholder layout region
- RTL and LTR responsive inconsistencies
- Unsafe fixed-size layout behavior

## [0.1.0] - 2026-07-09

### Added

- Initial React, TypeScript, Vite application foundation
- Bilingual dashboard and routed academy sections
