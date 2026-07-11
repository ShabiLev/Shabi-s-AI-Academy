export interface AcademyUser {
  id: string
  displayNameHe: string
  displayNameEn: string
  email: string
  role: string
  avatarInitials: string
}

export interface AuthContextValue {
  user: AcademyUser | null
  isAuthenticated: boolean
  demoLogin: () => void
  signOut: () => void
}
