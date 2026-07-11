export type Language = 'he' | 'en'

export type TranslationKey =
  | 'brand.name' | 'brand.tagline' | 'a11y.skipToContent' | 'a11y.openMenu' | 'a11y.closeMenu'
  | 'a11y.changeLanguage' | 'a11y.progressLabel' | 'a11y.projectProgressLabel' | 'common.comingSoon' | 'common.minutes' | 'common.beginner'
  | 'nav.dashboard' | 'nav.lessons' | 'nav.prompts' | 'nav.agents' | 'nav.projects' | 'nav.radar' | 'nav.settings'
  | 'header.workspace' | 'header.online' | 'header.hebrew' | 'header.english'
  | 'dashboard.eyebrow' | 'dashboard.welcome' | 'dashboard.level' | 'dashboard.missionLabel' | 'dashboard.mission'
  | 'dashboard.overallProgress' | 'dashboard.progressPercent' | 'dashboard.lessonsCompleted' | 'dashboard.dailyTime'
  | 'dashboard.continueLearning' | 'dashboard.lessonNumber' | 'dashboard.lessonTitle' | 'dashboard.continue'
  | 'dashboard.promptLibrary' | 'dashboard.noPrompts' | 'dashboard.promptDescription' | 'dashboard.openLibrary'
  | 'dashboard.myAgents' | 'dashboard.noAgents' | 'dashboard.agentsDescription' | 'dashboard.exploreAgents'
  | 'dashboard.activeProject' | 'dashboard.projectName' | 'dashboard.planning' | 'dashboard.viewProject'
  | 'dashboard.aiRadar' | 'dashboard.noUpdates' | 'dashboard.radarDescription'
  | 'pages.lessonsTitle' | 'pages.lessonsDescription' | 'pages.promptsTitle' | 'pages.promptsDescription'
  | 'pages.agentsTitle' | 'pages.agentsDescription' | 'pages.projectsTitle' | 'pages.projectsDescription'
  | 'pages.radarTitle' | 'pages.radarDescription' | 'pages.settingsTitle' | 'pages.settingsDescription'
  | 'pages.futureLabel' | 'pages.futureDescription'
  | 'footer.version' | 'footer.builtWhileLearning'

export type Translations = Record<TranslationKey, string>
