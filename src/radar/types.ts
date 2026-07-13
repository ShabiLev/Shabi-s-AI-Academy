export type RadarCategory = "models" | "agents" | "evaluation" | "safety" | "governance" | "open-source";
export type RadarHorizon = "now" | "next" | "watch";

export interface LocalizedRadarText {
  readonly he: string;
  readonly en: string;
}

export interface RadarItem {
  readonly id: string;
  readonly publisher: string;
  readonly sourceUrl: string;
  readonly publishedAt: string;
  readonly verifiedAt: string;
  readonly category: RadarCategory;
  readonly horizon: RadarHorizon;
  readonly title: LocalizedRadarText;
  readonly summary: LocalizedRadarText;
  readonly implication: LocalizedRadarText;
  readonly featured: boolean;
}
