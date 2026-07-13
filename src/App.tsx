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
import { RuntimeProvider } from "./runtime/RuntimeContext";
import { ProjectProvider } from "./projects";
import { KnowledgeProvider } from "./knowledge";

const RunHistoryPage = lazy(() => import("./pages/RunHistoryPage").then((module) => ({ default: module.RunHistoryPage })));
const RunDetailsPage = lazy(() => import("./pages/RunDetailsPage").then((module) => ({ default: module.RunDetailsPage })));
const StarterAgentsPage = lazy(() => import("./pages/StarterAgentsPage").then((module) => ({ default: module.StarterAgentsPage })));
const PromptPacksPage = lazy(() => import("./pages/PromptPacksPage").then((module) => ({ default: module.PromptPacksPage })));
const PromptPlaygroundPage = lazy(() => import("./pages/PromptPlaygroundPage").then((module) => ({ default: module.PromptPlaygroundPage })));
const AgentPlaygroundPage = lazy(() => import("./pages/AgentPlaygroundPage").then((module) => ({ default: module.AgentPlaygroundPage })));
const ProjectFormPage = lazy(() => import("./pages/ProjectFormPage").then((module) => ({ default: module.ProjectFormPage })));
const ProjectDetailsPage = lazy(() => import("./pages/ProjectDetailsPage").then((module) => ({ default: module.ProjectDetailsPage })));
const KnowledgePage = lazy(() => import("./pages/KnowledgePage").then((module) => ({ default: module.KnowledgePage })));
const KnowledgeFormPage = lazy(() => import("./pages/KnowledgeFormPage").then((module) => ({ default: module.KnowledgeFormPage })));
const KnowledgeDetailsPage = lazy(() => import("./pages/KnowledgeDetailsPage").then((module) => ({ default: module.KnowledgeDetailsPage })));

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CourseProgressProvider>
          <PromptLibraryProvider>
            <AgentLibraryProvider>
              <ProjectProvider>
                <KnowledgeProvider>
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
                    <Route path="prompts/packs" element={<Suspense fallback={null}><PromptPacksPage /></Suspense>} />
                    <Route
                      path="prompts/:promptId"
                      element={<PromptDetailsPage />}
                    />
                    <Route
                      path="prompts/:promptId/edit"
                      element={<PromptBuilderPage />}
                    />
                    <Route path="agents" element={<AgentsPage />} />
                    <Route path="agents/catalog" element={<Suspense fallback={null}><StarterAgentsPage /></Suspense>} />
                    <Route path="playground/prompts" element={<Suspense fallback={null}><PromptPlaygroundPage /></Suspense>} />
                    <Route path="playground/agents" element={<Suspense fallback={null}><AgentPlaygroundPage /></Suspense>} />
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
                    <Route path="projects/new" element={<Suspense fallback={null}><ProjectFormPage /></Suspense>} />
                    <Route path="projects/:projectId" element={<Suspense fallback={null}><ProjectDetailsPage /></Suspense>} />
                    <Route path="projects/:projectId/settings" element={<Suspense fallback={null}><ProjectFormPage /></Suspense>} />
                    <Route path="knowledge" element={<Suspense fallback={null}><KnowledgePage /></Suspense>} />
                    <Route path="knowledge/new" element={<Suspense fallback={null}><KnowledgeFormPage /></Suspense>} />
                    <Route path="knowledge/:documentId" element={<Suspense fallback={null}><KnowledgeDetailsPage /></Suspense>} />
                    <Route path="knowledge/:documentId/edit" element={<Suspense fallback={null}><KnowledgeFormPage /></Suspense>} />
                    <Route path="radar" element={<RadarPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="qa" element={<QACenterPage />} />
                    <Route path="runs" element={<Suspense fallback={null}><RunHistoryPage /></Suspense>} />
                    <Route path="runs/:runId" element={<Suspense fallback={null}><RunDetailsPage /></Suspense>} />
                  </Route>
                </Route>
                </Routes>
                  </RuntimeProvider>
                </KnowledgeProvider>
              </ProjectProvider>
            </AgentLibraryProvider>
          </PromptLibraryProvider>
        </CourseProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
