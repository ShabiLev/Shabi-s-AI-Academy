import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { AgentsPage } from './pages/AgentsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LessonsPage } from './pages/LessonsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { PromptLibraryPage } from './pages/PromptLibraryPage'
import { RadarPage } from './pages/RadarPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'

export function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route index element={<DashboardPage />} /><Route path="lessons" element={<LessonsPage />} /><Route path="prompt-library" element={<PromptLibraryPage />} /><Route path="agents" element={<AgentsPage />} /><Route path="projects" element={<ProjectsPage />} /><Route path="radar" element={<RadarPage />} /><Route path="settings" element={<SettingsPage />} /></Route></Route>
  </Routes></AuthProvider></BrowserRouter>
}
