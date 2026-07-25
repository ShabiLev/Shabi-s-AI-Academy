import { useLanguage } from "../i18n/LanguageContext";

const releases = [
  { version: "1.6.0-beta.1", items: ["Dashboard reduced to one continuation section and four primary task tiles", "Four-step, skippable onboarding with a deterministic starting recommendation", "Dedicated History route for Recent Items and lightweight, dismissible contextual hints", "Bounded quality-runtime retention, storage audit, cleanup, and CI determinism tooling"] },
  { version: "1.5.0-beta.1", items: ["Live source-based AI Radar with history, favorites, and provider states", "AOS Event Bus, Scheduler, and Capability Registry foundations", "Sidebar groups collapsed by default; Recent Items moved from Dashboard to Profile/History", "Dashboard Workspace Overview, Workspace Status, and duplicate Recent Items removed"] },
  { version: "1.4.0-beta.1", items: ["Agent Operating System (AOS) governing how AI coding agents work in this repo", "Task classification, module registry, and evidence workflow", "Explicit file-based research and knowledge-ingestion pipeline", "New AOS dashboard with modules, research, evidence, handoffs, security, and releases views"] },
  { version: "1.3.0-beta.1", items: ["Guided Beginner and Advanced experiences", "Optional Supabase authentication and profiles", "Safe local-to-cloud migration architecture", "System-wide user-journey quality framework"] },
  { version: "1.2.0-beta.1", items: ["Source-based bilingual AI Radar", "Accessible portal profile menu and mobile sheet", "Responsive RTL/LTR and overflow hardening", "Expanded accessibility and visual regression coverage"] },
  { version: "1.1.0-beta.1", items: ["Integrated AI Workspace", "Global Search and Command Palette", "Local Assistant and safe action routing", "Advanced builders, workflows, analytics, and backup"] },
  { version: "1.0.0-beta.1", items: ["Complete bilingual curriculum", "Prompt packs and starter agents", "Playgrounds, Projects, and Knowledge Base", "Platform and deployment hardening"] },
  { version: "0.7.0-alpha.1", items: ["Deterministic Runtime Engine", "Mock and Dry Run", "Approval, retry, cancellation, and Run History"] },
  { version: "0.6.1", items: ["Engineering quality platform", "Prompt and Agent libraries"] },
];

export function ChangelogPage() {
  const { language } = useLanguage();
  return <div className="page"><h1>{language === "he" ? "יומן שינויים" : "Changelog"}</h1>{releases.map((release) => <article className="settings-card" key={release.version}><h2>{release.version}</h2><ul>{release.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div>;
}
