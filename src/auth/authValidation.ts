export const normalizeEmail = (value: string) => value.trim().toLocaleLowerCase();
export function validEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value)) && value.length <= 254; }
export function passwordIssues(value: string): string[] { const issues: string[] = []; if (value.length < 10) issues.push("length"); if (!/[a-z]/.test(value)) issues.push("lowercase"); if (!/[A-Z]/.test(value)) issues.push("uppercase"); if (!/\d/.test(value)) issues.push("number"); return issues; }
