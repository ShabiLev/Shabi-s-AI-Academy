import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { AgentsPage } from "./pages/AgentsPage";
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
import { CommandPaletteProvider } from "./commands";
import { AssistantProvider } from "./assistant";
import { WorkflowProvider } from "./workflows";
import { WorkspaceProvider } from "./workspace";
import { configuredRouterMode, type RouterMode } from "./config/routerMode";
import { ExperienceProvider } from "./experience";
import { OnboardingProvider } from "./onboarding";

const RunHistoryPage = lazy(() => import("./pages/RunHistoryPage").then((module) => ({ default: module.RunHistoryPage })));
const DashboardPage = lazy(() => import("./pages/GuidedDashboardPage").then((module) => ({ default: module.GuidedDashboardPage })));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage").then((module) => ({ default: module.OnboardingPage })));
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
const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const LearningJourneyPage = lazy(() => import("./pages/LearningJourneyPage").then((module) => ({ default: module.LearningJourneyPage })));
const RoadmapPage = lazy(() => import("./pages/RoadmapPage").then((module) => ({ default: module.RoadmapPage })));
const ChangelogPage = lazy(() => import("./pages/ChangelogPage").then((module) => ({ default: module.ChangelogPage })));
const DocumentationPage = lazy(() => import("./pages/DocumentationPage").then((module) => ({ default: module.DocumentationPage })));
const ReleaseCenterPage = lazy(() => import("./pages/ReleaseCenterPage").then((module) => ({ default: module.ReleaseCenterPage })));
const DeveloperModePage = lazy(() => import("./pages/DeveloperModePage").then((module) => ({ default: module.DeveloperModePage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then((module) => ({ default: module.SearchPage })));
const AssistantPage = lazy(() => import("./pages/AssistantPage").then((module) => ({ default: module.AssistantPage })));
const WorkflowsPage = lazy(() => import("./pages/WorkflowsPage").then((module) => ({ default: module.WorkflowsPage })));
const WorkflowBuilderPage = lazy(() => import("./pages/WorkflowBuilderPage").then((module) => ({ default: module.WorkflowBuilderPage })));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));

export interface AppProps {
  routerMode?: RouterMode;
}

export function App({ routerMode = configuredRouterMode }: AppProps) {
  const Router = routerMode === "hash" ? HashRouter : BrowserRouter;

  return (
    <Router>
      <AuthProvider>
        <ExperienceProvider>
          <OnboardingProvider>
        <CourseProgressProvider>
          <PromptLibraryProvider>
            <AgentLibraryProvider>
              <ProjectProvider>
                <KnowledgeProvider>
                  <RuntimeProvider>
                  <WorkspaceProvider>
                  <CommandPaletteProvider>
                  <WorkflowProvider>
                  <AssistantProvider>
                <Routes>
                <Route path="login" element={<LoginPage />} />
                <Route path="about" element={<Suspense fallback={null}><AboutPage /></Suspense>} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
                    <Route path="dashboard" element={<Suspense fallback={null}><DashboardPage /></Suspense>} />
                    <Route path="onboarding" element={<Suspense fallback={null}><OnboardingPage /></Suspense>} />
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
                    <Route path="journey" element={<Suspense fallback={null}><LearningJourneyPage /></Suspense>} />
                    <Route path="roadmap" element={<Suspense fallback={null}><RoadmapPage /></Suspense>} />
                    <Route path="changelog" element={<Suspense fallback={null}><ChangelogPage /></Suspense>} />
                    <Route path="docs" element={<Suspense fallback={null}><DocumentationPage /></Suspense>} />
                    <Route path="release" element={<Suspense fallback={null}><ReleaseCenterPage /></Suspense>} />
                    <Route path="developer" element={<Suspense fallback={null}><DeveloperModePage /></Suspense>} />
                    <Route path="search" element={<Suspense fallback={null}><SearchPage /></Suspense>} />
                    <Route path="assistant" element={<Suspense fallback={null}><AssistantPage /></Suspense>} />
                    <Route path="workflows" element={<Suspense fallback={null}><WorkflowsPage /></Suspense>} />
                    <Route path="workflows/new" element={<Suspense fallback={null}><WorkflowBuilderPage /></Suspense>} />
                    <Route path="workflows/:workflowId" element={<Suspense fallback={null}><WorkflowBuilderPage /></Suspense>} />
                    <Route path="analytics" element={<Suspense fallback={null}><AnalyticsPage /></Suspense>} />
                    <Route path="radar" element={<RadarPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="qa" element={<QACenterPage />} />
                    <Route path="runs" element={<Suspense fallback={null}><RunHistoryPage /></Suspense>} />
                    <Route path="runs/:runId" element={<Suspense fallback={null}><RunDetailsPage /></Suspense>} />
                  </Route>
                </Route>
                </Routes>
                  </AssistantProvider>
                  </WorkflowProvider>
                  </CommandPaletteProvider>
                  </WorkspaceProvider>
                  </RuntimeProvider>
                </KnowledgeProvider>
              </ProjectProvider>
            </AgentLibraryProvider>
          </PromptLibraryProvider>
        </CourseProgressProvider>
          </OnboardingProvider>
        </ExperienceProvider>
      </AuthProvider>
    </Router>
  );
}
