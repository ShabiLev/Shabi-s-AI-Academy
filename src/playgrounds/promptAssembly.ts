export interface PromptWorkspaceInput {
  systemInstruction: string;
  userPrompt: string;
  variables: Record<string, string>;
  context: string;
  constraints: string;
  outputFormat: string;
  examples: string;
}

export function replacePromptVariables(text: string, variables: Record<string, string>) {
  return text.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, key: string) => variables[key] ?? match);
}

export function assemblePrompt(input: PromptWorkspaceInput) {
  const sections = [
    ["System", input.systemInstruction], ["Task", replacePromptVariables(input.userPrompt, input.variables)],
    ["Context", input.context], ["Constraints", input.constraints], ["Output format", input.outputFormat], ["Examples", input.examples],
  ];
  return sections.filter(([, value]) => value.trim()).map(([label, value]) => `## ${label}\n${value.trim()}`).join("\n\n");
}

export const estimateTokens = (text: string) => Math.max(1, Math.ceil(text.trim().length / 4));
