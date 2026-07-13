import { BrowserRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { AgentsPage } from "./pages/AgentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LessonsPage } from "./pages/LessonsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { PromptLibraryPage } from "./pages/PromptLibraryPage";
import { RadarPage } from "./pages/RadarPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { LessonPage } from "./pages/LessonPage";
import { CourseProgressProvider } from "./course/CourseProgressContext";
import { PromptLibraryProvider } from "./prompts/PromptLibraryContext";
import { PromptBuilderPage } from "./pages/PromptBuilderPage";
import { PromptDetailsPage } from "./pages/PromptDetailsPage";
import { QACenterPage } from "./pages/QACenterPage";
import { AgentLibraryProvider } from "./agents/AgentLibraryContext";
import { AgentBuilderPage } from "./pages/AgentBuilderPage";
import { AgentDetailsPage } from "./pages/AgentDetailsPage";
import { AgentSimulationPage } from "./pages/AgentSimulationPage";
import { HowToPage } from "./pages/HowToPage";
import { PromptCatalogPage } from "./pages/PromptCatalogPage";
import { PromptCatalogDetailsPage } from "./pages/PromptCatalogDetailsPage";
import { PromptPacksPage } from "./pages/PromptPacksPage";
import { RuntimeProvider } from "./runtime/RuntimeContext";

const RunHistoryPage = lazy(() => import("./pages/RunHistoryPage").then((module) => ({ default: module.RunHistoryPage })));
const RunDetailsPage = lazy(() => import("./pages/RunDetailsPage").then((module) => ({ default: module.RunDetailsPage })));

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProgressProvider>
          <PromptLibraryProvider>
            <AgentLibraryProvider>
              <RuntimeProvider>
                <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="lessons" element={<LessonsPage />} />
                    <Route
                      path="lessons/:lessonSlug"
                      element={<LessonPage />}
                    />
                    <Route
                      path="prompt-library"
                      element={<PromptLibraryPage />}
                    />
                    <Route path="prompts" element={<PromptLibraryPage />} />
                    <Route path="prompts/new" element={<PromptBuilderPage />} />
                    <Route path="prompts/catalog" element={<PromptCatalogPage />} />
                    <Route path="prompts/catalog/:catalogId" element={<PromptCatalogDetailsPage />} />
                    <Route path="prompts/packs" element={<PromptPacksPage />} />
                    <Route
                      path="prompts/:promptId"
                      element={<PromptDetailsPage />}
                    />
                    <Route
                      path="prompts/:promptId/edit"
                      element={<PromptBuilderPage />}
                    />
                    <Route path="agents" element={<AgentsPage />} />
                    <Route path="agents/new" element={<AgentBuilderPage />} />
                    <Route
                      path="agents/:agentId"
                      element={<AgentDetailsPage />}
                    />
                    <Route
                      path="agents/:agentId/edit"
                      element={<AgentBuilderPage />}
                    />
                    <Route
                      path="agents/:agentId/simulate"
                      element={<AgentSimulationPage />}
                    />
                    <Route path="how-to" element={<HowToPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="radar" element={<RadarPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="qa" element={<QACenterPage />} />
                    <Route path="runs" element={<Suspense fallback={null}><RunHistoryPage /></Suspense>} />
                    <Route path="runs/:runId" element={<Suspense fallback={null}><RunDetailsPage /></Suspense>} />
                  </Route>
                </Route>
                </Routes>
              </RuntimeProvider>
            </AgentLibraryProvider>
          </PromptLibraryProvider>
        </CourseProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
