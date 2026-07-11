import type { TranslationKey } from '../../i18n/types'
import type { ComponentProps } from 'react'
import type { Icon } from '../common/Icon'
export interface NavigationItem { to: string; label: TranslationKey; icon: ComponentProps<typeof Icon>['name']; end?: boolean }
export const navigationItems: NavigationItem[] = [
  { to: '/', label: 'nav.dashboard', icon: 'dashboard', end: true }, { to: '/lessons', label: 'nav.lessons', icon: 'lessons' },
  { to: '/prompts', label: 'nav.prompts', icon: 'prompts' }, { to: '/agents', label: 'nav.agents', icon: 'agents' },
  { to: '/projects', label: 'nav.projects', icon: 'projects' }, { to: '/radar', label: 'nav.radar', icon: 'radar' },
  { to: '/settings', label: 'nav.settings', icon: 'settings' }, { to: '/qa', label: 'nav.qa', icon: 'qa' },
]
