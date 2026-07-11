export interface HelpSection {
  id: string;
  slug: string;
  category: string;
  titleHe: string;
  titleEn: string;
  summaryHe: string;
  summaryEn: string;
  stepsHe: string[];
  stepsEn: string[];
  tipsHe: string[];
  tipsEn: string[];
  warningsHe: string[];
  warningsEn: string[];
  keywords: string[];
  relatedRoutes: string[];
  relatedHelpIds: string[];
  order: number;
}
