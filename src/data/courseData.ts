export interface CourseModule { id: string; order: number; lessonIds: string[] }
export interface Lesson { id: string; moduleId: string; order: number; durationMinutes: number; difficulty: 'beginner' | 'intermediate' | 'advanced'; completed: boolean }
export interface ProgressSummary { percent: number; completedLessons: number; totalLessons: number; dailyMinutes: [number, number] }
export interface Project { id: string; progress: number; status: 'planning' | 'active' | 'complete' }
export interface AgentPreview { id: string; type: 'qa' | 'sql' | 'release'; available: boolean }

export const courseModules: CourseModule[] = [{ id: 'foundations', order: 1, lessonIds: ['welcome', 'ai-foundations', 'design-before-coding'] }]
export const lessons: Lesson[] = [
  { id: 'welcome', moduleId: 'foundations', order: 1, durationMinutes: 15, difficulty: 'beginner', completed: true },
  { id: 'ai-foundations', moduleId: 'foundations', order: 2, durationMinutes: 20, difficulty: 'beginner', completed: false },
  { id: 'design-before-coding', moduleId: 'foundations', order: 3, durationMinutes: 20, difficulty: 'beginner', completed: false },
]
export const progressSummary: ProgressSummary = { percent: 2, completedLessons: 1, totalLessons: 40, dailyMinutes: [15, 30] }
export const activeProject: Project = { id: 'ai-command-center', progress: 0, status: 'planning' }
export const agentPreviews: AgentPreview[] = [
  { id: 'qa-agent', type: 'qa', available: false }, { id: 'sql-agent', type: 'sql', available: false },
  { id: 'release-agent', type: 'release', available: false },
]
export const currentLesson = lessons.find((lesson) => lesson.id === 'design-before-coding')!
