import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AgentsPage } from './pages/AgentsPage'
import { DashboardPage } from './pages/DashboardPage'
import { LessonsPage } from './pages/LessonsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { PromptLibraryPage } from './pages/PromptLibraryPage'
import { RadarPage } from './pages/RadarPage'
import { SettingsPage } from './pages/SettingsPage'

export function App() {
  return <BrowserRouter><Routes><Route element={<AppLayout />}><Route index element={<DashboardPage />} /><Route path="lessons" element={<LessonsPage />} /><Route path="prompt-library" element={<PromptLibraryPage />} /><Route path="agents" element={<AgentsPage />} /><Route path="projects" element={<ProjectsPage />} /><Route path="radar" element={<RadarPage />} /><Route path="settings" element={<SettingsPage />} /></Route></Routes></BrowserRouter>
}
