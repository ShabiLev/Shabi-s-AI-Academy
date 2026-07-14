import type { LocalizedText } from "../guidance/types";
export interface GlossaryTerm { id: string; name: LocalizedText; definition: LocalizedText; example: LocalizedText; relatedLesson: string; relatedFeature: string; availability?: LocalizedText }
