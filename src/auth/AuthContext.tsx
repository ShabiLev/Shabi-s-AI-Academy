/* eslint-disable react-refresh/only-export-components -- Provider and hook belong together. */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AcademyUser, AuthContextValue } from './types'

const SESSION_KEY = 'shabis-ai-academy-demo-session'

export const demoUser: AcademyUser = {
  id: 'demo-user',
  displayNameHe: 'שבי',
  displayNameEn: 'Shabi',
  email: 'demo@shabis-ai-academy.local',
  role: 'AI Academy Learner',
  avatarInitials: 'SA',
}

function hasDemoSession() {
  try { return window.sessionStorage.getItem(SESSION_KEY) === 'active' } catch { return false }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AcademyUser | null>(() => hasDemoSession() ? demoUser : null)
  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    demoLogin: () => {
      try { window.sessionStorage.setItem(SESSION_KEY, 'active') } catch { /* Demo persistence is optional. */ }
      setUser(demoUser)
    },
    signOut: () => {
      try { window.sessionStorage.removeItem(SESSION_KEY) } catch { /* Continue signing out in memory. */ }
      setUser(null)
    },
  }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
