export interface Project { id: string; progress: number; status: 'planning' | 'active' | 'complete' }
export interface AgentPreview { id: string; type: 'qa' | 'sql' | 'release'; available: boolean }

export const activeProject: Project = { id: 'ai-command-center', progress: 0, status: 'planning' }
export const agentPreviews: AgentPreview[] = [
  { id: 'qa-agent', type: 'qa', available: false }, { id: 'sql-agent', type: 'sql', available: false },
  { id: 'release-agent', type: 'release', available: false },
]
