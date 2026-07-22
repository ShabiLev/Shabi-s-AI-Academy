import type { CapabilityRecord } from "./capabilityRegistry";

export const coreCapabilities: readonly CapabilityRecord[] = [
  {
    id: "aos.event-bus",
    title: { he: "אפיק האירועים של AOS", en: "AOS Event Bus" },
    description: { he: "הפצת אירועים מקומית, מסונכרנת ומוגבלת לצורכי שילוב ואבחון.", en: "Bounded synchronous local events for integration and diagnostics." },
    version: "1.0.0",
    owner: "AOS Core",
    inputs: ["typed event payload"], outputs: ["subscriber delivery", "bounded diagnostics"],
    permissions: ["local-read"], dependencies: [], provider: "in-process",
    modelRequirements: [], mcpRequirements: [], availability: "available", riskLevel: "low",
    latencyClass: "instant", costClass: "none", modes: ["offline", "online"], health: "healthy",
    documentationUrl: "/aos/core",
  },
  {
    id: "aos.scheduler",
    title: { he: "מתזמן AOS", en: "AOS Scheduler" },
    description: { he: "בסיס בטוח להגדרות משימה, הפעלה ידנית ומיפוי ל-GitHub Actions.", en: "Safe task definitions, manual simulation, and GitHub Actions mapping." },
    version: "1.0.0",
    owner: "AOS Core",
    inputs: ["validated task definition"], outputs: ["bounded audit record"],
    permissions: ["explicit per task"], dependencies: ["aos.event-bus"], provider: "local simulation / GitHub Actions",
    modelRequirements: [], mcpRequirements: [], availability: "available", riskLevel: "medium",
    latencyClass: "background", costClass: "none", modes: ["offline", "online"], health: "healthy",
    documentationUrl: "/aos/core",
  },
  {
    id: "radar.cached-feed",
    title: { he: "ספק Radar שמור", en: "Cached Radar feed" },
    description: { he: "טעינת רשומות Radar ציבוריות ומאומתות ללא מפתחות פרטיים בדפדפן.", en: "Loads validated public Radar records without private browser credentials." },
    version: "1.0.0",
    owner: "AI Radar",
    inputs: ["unknown JSON feed"], outputs: ["validated Radar records"],
    permissions: ["network-read"], dependencies: ["aos.event-bus"], provider: "same-origin static feed",
    modelRequirements: [], mcpRequirements: [], availability: "degraded", riskLevel: "medium",
    latencyClass: "interactive", costClass: "none", modes: ["offline", "online"], health: "unverified",
    documentationUrl: "/radar",
  },
] as const;

