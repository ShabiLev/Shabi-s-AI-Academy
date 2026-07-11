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
import { LessonPage } from './pages/LessonPage'
import { CourseProgressProvider } from './course/CourseProgressContext'
import { PromptLibraryProvider } from './prompts/PromptLibraryContext'
import { PromptBuilderPage } from './pages/PromptBuilderPage'
import { PromptDetailsPage } from './pages/PromptDetailsPage'

export function App() {
  return <BrowserRouter><AuthProvider><CourseProgressProvider><PromptLibraryProvider><Routes>
    <Route path="login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route index element={<DashboardPage />} /><Route path="lessons" element={<LessonsPage />} /><Route path="lessons/:lessonSlug" element={<LessonPage />} /><Route path="prompt-library" element={<PromptLibraryPage />} /><Route path="prompts" element={<PromptLibraryPage />} /><Route path="prompts/new" element={<PromptBuilderPage />} /><Route path="prompts/:promptId" element={<PromptDetailsPage />} /><Route path="prompts/:promptId/edit" element={<PromptBuilderPage />} /><Route path="agents" element={<AgentsPage />} /><Route path="projects" element={<ProjectsPage />} /><Route path="radar" element={<RadarPage />} /><Route path="settings" element={<SettingsPage />} /></Route></Route>
  </Routes></PromptLibraryProvider></CourseProgressProvider></AuthProvider></BrowserRouter>
}
