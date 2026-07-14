import type { PageMetadata, ProductArea } from "./types";

const text = (he: string, en: string) => ({ he, en });
const areas: Record<ProductArea, ReturnType<typeof text>> = {
  home: text("בית", "Home"), learn: text("למידה", "Learn"), build: text("יצירה", "Build"),
  workspace: text("סביבת עבודה", "Workspace"), more: text("עוד", "More"), account: text("חשבון", "Account"),
};

type Seed = Omit<PageMetadata, "pattern" | "purpose" | "primaryTask" | "helpId" | "glossaryTerms" | "visibility" | "access"> & Partial<Pick<PageMetadata, "purpose" | "primaryTask" | "helpId" | "glossaryTerms" | "visibility" | "access">>;
const seed = (value: Seed): PageMetadata => ({
  ...value,
  pattern: new RegExp(`^${value.route.replace(/:[^/]+/g, "[^/]+")}/?$`),
  purpose: value.purpose ?? value.summary,
  primaryTask: value.primaryTask ?? value.summary,
  helpId: value.helpId ?? value.id,
  glossaryTerms: value.glossaryTerms ?? [],
  visibility: value.visibility ?? "beginner",
  access: value.access ?? "protected",
});

export const pageRegistry: PageMetadata[] = [
  seed({ id: "dashboard", route: "/dashboard", area: "home", title: text("לוח המשימות", "Task dashboard"), summary: text("המשיכו מהפעולה החשובה הבאה.", "Continue from your next useful action."), primaryAction: { label: text("המשך למידה", "Continue learning"), to: "/lessons" }, helpId: "dashboard", tourId: "dashboard" }),
  seed({ id: "onboarding", route: "/onboarding", area: "home", title: text("התחלה מודרכת", "Guided start"), summary: text("התאימו את האקדמיה למטרות שלכם.", "Personalize the Academy around your goals."), helpId: "getting-started" }),
  seed({ id: "lessons", route: "/lessons", area: "learn", title: text("שיעורים", "Lessons"), summary: text("למדו מושגי AI במסלול מעשי.", "Learn AI concepts through a practical path."), primaryAction: { label: text("התחילו שיעור", "Start a lesson"), to: "/lessons" }, glossaryTerms: ["ai", "llm"], tourId: "lessons" }),
  seed({ id: "lesson", route: "/lessons/:lessonSlug", area: "learn", title: text("שיעור", "Lesson"), summary: text("למדו, תרגלו ושמרו התקדמות.", "Learn, practise, and save progress."), parent: "lessons", glossaryTerms: ["ai", "llm"] }),
  seed({ id: "radar", route: "/radar", area: "learn", title: text("רדאר AI", "AI Radar"), summary: text("עקבו אחר מגמות ממקורות גלויים ומתועדים.", "Track trends from transparent, documented sources."), helpId: "ai-radar", glossaryTerms: ["provider"] }),
  seed({ id: "prompts", route: "/prompts", area: "build", title: text("ספריית הפרומפטים", "Prompt Library"), summary: text("צרו ושפרו הוראות לשימוש חוזר.", "Create and refine reusable instructions."), primaryAction: { label: text("פרומפט חדש", "New prompt"), to: "/prompts/new" }, glossaryTerms: ["prompt", "system-prompt"], helpId: "prompt-library", tourId: "prompts" }),
  seed({ id: "prompt-new", route: "/prompts/new", area: "build", title: text("יצירת פרומפט", "Create prompt"), summary: text("בנו הוראה ברורה עם הקשר וקריטריונים.", "Build a clear instruction with context and criteria."), parent: "prompts", glossaryTerms: ["prompt", "context-window"], helpId: "prompt-workshop" }),
  seed({ id: "prompt-packs", route: "/prompts/packs", area: "build", title: text("חבילות פרומפטים", "Prompt Packs"), summary: text("התחילו מאוסף משימות מוכן.", "Start from a curated task collection."), parent: "prompts", glossaryTerms: ["prompt"] }),
  seed({ id: "prompt-catalog", route: "/prompts/catalog", area: "build", title: text("קטלוג פרומפטים", "Prompt Catalog"), summary: text("ייבאו עותק מקומי מקטלוג מובנה.", "Import a local copy from the built-in catalog."), parent: "prompts", helpId: "starter-catalog", glossaryTerms: ["local-storage"] }),
  seed({ id: "prompt-details", route: "/prompts/:promptId", area: "build", title: text("פרטי פרומפט", "Prompt details"), summary: text("בדקו, שכפלו או ערכו פרומפט.", "Review, duplicate, or edit a prompt."), parent: "prompts", glossaryTerms: ["prompt"] }),
  seed({ id: "prompt-edit", route: "/prompts/:promptId/edit", area: "build", title: text("עריכת פרומפט", "Edit prompt"), summary: text("שפרו את העותק המקומי בבטחה.", "Refine your local copy safely."), parent: "prompts", glossaryTerms: ["prompt"] }),
  seed({ id: "prompt-catalog-details", route: "/prompts/catalog/:catalogId", area: "build", title: text("פרומפט מהקטלוג", "Catalog prompt"), summary: text("בדקו מקור ורישיון לפני ייבוא.", "Review source and license before import."), parent: "prompt-catalog", glossaryTerms: ["prompt"] }),
  seed({ id: "agents", route: "/agents", area: "build", title: text("הסוכנים שלי", "My Agents"), summary: text("שלבו הוראות, קלטים וכלים מתוכננים למשימה.", "Combine instructions, inputs, and planned tools for a task."), primaryAction: { label: text("בחרו סוכן התחלתי", "Choose a Starter Agent"), to: "/agents/catalog" }, secondaryAction: { label: text("צרו סוכן", "Create an Agent"), to: "/agents/new" }, glossaryTerms: ["agent", "tool", "human-approval"], helpId: "agent-library", tourId: "agents" }),
  seed({ id: "agent-new", route: "/agents/new", area: "build", title: text("יצירת סוכן", "Create agent"), summary: text("הגדירו תפקיד, הוראות וקריטריוני השלמה.", "Define a role, instructions, and completion criteria."), parent: "agents", glossaryTerms: ["agent", "tool"], helpId: "agent-builder" }),
  seed({ id: "agent-catalog", route: "/agents/catalog", area: "build", title: text("סוכנים התחלתיים", "Starter Agents"), summary: text("בחרו תבנית בטוחה והתאימו עותק מקומי.", "Choose a safe template and adapt a local copy."), parent: "agents", glossaryTerms: ["agent"] }),
  seed({ id: "agent-details", route: "/agents/:agentId", area: "build", title: text("פרטי סוכן", "Agent details"), summary: text("בדקו את התפקיד, הכלים והתוצאה המצופה.", "Review the role, tools, and expected outcome."), parent: "agents", glossaryTerms: ["agent", "tool"] }),
  seed({ id: "agent-edit", route: "/agents/:agentId/edit", area: "build", title: text("עריכת סוכן", "Edit agent"), summary: text("עדכנו הוראות וכלים מתוכננים.", "Update instructions and planned tools."), parent: "agents", glossaryTerms: ["agent", "tool"] }),
  seed({ id: "agent-simulate", route: "/agents/:agentId/simulate", area: "build", title: text("סימולציית סוכן", "Agent simulation"), summary: text("בדקו התנהגות ללא ביצוע חי.", "Inspect behavior without live execution."), parent: "agents", glossaryTerms: ["agent", "mock-run"] }),
  seed({ id: "prompt-playground", route: "/playground/prompts", area: "build", title: text("מגרש פרומפטים", "Prompt Playground"), summary: text("בדקו פרומפטים בסימולציה מקומית.", "Test prompts in a local simulation."), glossaryTerms: ["prompt", "mock-run"], tourId: "prompt-playground" }),
  seed({ id: "agent-playground", route: "/playground/agents", area: "build", title: text("מגרש סוכנים", "Agent Playground"), summary: text("הריצו תרחיש סוכן ללא ספק חי.", "Run an agent scenario without a live provider."), glossaryTerms: ["agent", "dry-run"], tourId: "agent-playground" }),
  seed({ id: "workflows", route: "/workflows", area: "build", title: text("תהליכי עבודה", "Workflows"), summary: text("חברו שלבים לרצף מקומי שניתן לבדיקה.", "Connect steps into a testable local sequence."), primaryAction: { label: text("תהליך חדש", "New workflow"), to: "/workflows/new" }, glossaryTerms: ["workflow", "runtime"], tourId: "workflows" }),
  seed({ id: "workflow-builder", route: "/workflows/:workflowId", area: "build", title: text("בונה תהליכים", "Workflow Builder"), summary: text("סדרו שלבים ואמתו את הזרימה.", "Arrange steps and validate the flow."), parent: "workflows", glossaryTerms: ["workflow", "validation"] }),
  seed({ id: "projects", route: "/projects", area: "workspace", title: text("פרויקטים", "Projects"), summary: text("ארגנו למידה ונכסים סביב תוצאה.", "Organize learning and assets around an outcome."), primaryAction: { label: text("פרויקט חדש", "New project"), to: "/projects/new" }, tourId: "projects" }),
  seed({ id: "project-details", route: "/projects/:projectId", area: "workspace", title: text("פרטי פרויקט", "Project details"), summary: text("רכזו משימות, נכסים והתקדמות.", "Bring tasks, assets, and progress together."), parent: "projects" }),
  seed({ id: "project-settings", route: "/projects/:projectId/settings", area: "workspace", title: text("הגדרות פרויקט", "Project settings"), summary: text("עדכנו את מטרת הפרויקט והפרטים.", "Update the project goal and details."), parent: "projects" }),
  seed({ id: "knowledge", route: "/knowledge", area: "workspace", title: text("מאגר ידע", "Knowledge Base"), summary: text("שמרו הקשר מקומי לשימוש בעבודה.", "Keep local context ready for your work."), primaryAction: { label: text("מסמך חדש", "New document"), to: "/knowledge/new" }, glossaryTerms: ["knowledge-base", "rag"], tourId: "knowledge" }),
  seed({ id: "knowledge-details", route: "/knowledge/:documentId", area: "workspace", title: text("מסמך ידע", "Knowledge document"), summary: text("קראו ועדכנו הקשר שמור.", "Review and maintain saved context."), parent: "knowledge", glossaryTerms: ["knowledge-base"] }),
  seed({ id: "knowledge-edit", route: "/knowledge/:documentId/edit", area: "workspace", title: text("עריכת מסמך ידע", "Edit knowledge document"), summary: text("עדכנו תוכן מקומי בבטחה.", "Update local content safely."), parent: "knowledge", glossaryTerms: ["knowledge-base"] }),
  seed({ id: "runs", route: "/runs", area: "workspace", title: text("היסטוריית הרצות", "Run History"), summary: text("בדקו תוצאות וסימולציות מקומיות קודמות.", "Review previous local simulations and results."), glossaryTerms: ["runtime", "mock-run", "dry-run"], helpId: "run-history" }),
  seed({ id: "run-details", route: "/runs/:runId", area: "workspace", title: text("פרטי הרצה", "Run details"), summary: text("בדקו ציר זמן, קלטים ותוצאות.", "Inspect the timeline, inputs, and results."), parent: "runs", glossaryTerms: ["runtime", "retry"] }),
  seed({ id: "search", route: "/search", area: "more", title: text("חיפוש", "Search"), summary: text("מצאו תוכן ונכסים בכל האקדמיה.", "Find content and assets across the Academy.") }),
  seed({ id: "assistant", route: "/assistant", area: "more", title: text("עוזר מקומי", "Local Assistant"), summary: text("קבלו הכוונה מובנית לפי המסך הנוכחי.", "Get structured guidance for the current screen."), glossaryTerms: ["ai"] }),
  seed({ id: "help", route: "/help", area: "more", title: text("מרכז עזרה", "Help Center"), summary: text("מצאו הדרכה מוכוונת משימה.", "Find task-oriented product guidance."), access: "protected" }),
  seed({ id: "glossary", route: "/glossary", area: "more", title: text("מילון מונחים", "Glossary"), summary: text("הכירו מושגים מרכזיים בעברית ובאנגלית.", "Understand core concepts in Hebrew and English."), access: "protected" }),
  seed({ id: "settings", route: "/settings", area: "more", title: text("הגדרות", "Settings"), summary: text("התאימו שפה, חוויה ונתונים מקומיים.", "Manage language, experience, and local data.") }),
  seed({ id: "profile", route: "/profile", area: "account", title: text("פרופיל", "Profile"), summary: text("נהלו פרטים, מטרות והעדפות חוויה.", "Manage details, goals, and experience preferences.") }),
  seed({ id: "account-security", route: "/account/security", area: "account", title: text("אבטחת חשבון", "Account security"), summary: text("נהלו סיסמה, הפעלה ובקשות חשבון.", "Manage password, session, and account requests."), access: "authenticated" }),
  seed({ id: "account-migration", route: "/account/migration", area: "account", title: text("העברת מידע מקומי", "Local data migration"), summary: text("בדקו והעתיקו מידע מקומי לחשבון בלי למחוק את המקור.", "Review and copy local data to your account without deleting the source."), access: "authenticated", glossaryTerms:["cloud-sync","local-storage"] }),
  ...[["admin","ניהול","Admin"],["admin-users","משתמשים","Users"],["admin-content","תוכן","Content"],["admin-audit","ביקורת מערכת","System audit"]].map(([id,he,en])=>seed({id,route:id==="admin"?"/admin":`/admin/${id.replace("admin-","")}`,area:"account",title:text(he,en),summary:text("בסיס ניהול מאובטח לקריאה בלבד.","Secure read-only administration foundation."),access:"admin",visibility:"advanced"})),
  seed({ id: "qa", route: "/qa", area: "more", title: text("מרכז QA", "QA Center"), summary: text("בדקו מוכנות, נגישות ואיכות שחרור.", "Review readiness, accessibility, and release quality."), visibility: "advanced", tourId: "qa" }),
  ...["analytics", "how-to", "docs", "release", "developer", "roadmap", "journey", "changelog"].map((id) => seed({ id, route: `/${id}`, area: id === "journey" ? "learn" : "more", title: text(id === "journey" ? "מסע למידה" : id, id.replace("-", " ")), summary: text("כלים ומידע תומכים.", "Supporting tools and information."), visibility: id === "developer" ? "developer" : "advanced" })),
];

export function resolvePageMetadata(pathname: string) {
  return pageRegistry.find((page) => page.pattern.test(pathname)) ?? seed({ id: "unknown", route: pathname, area: "more", title: text("האקדמיה", "Academy"), summary: text("סביבת העבודה המקומית שלכם.", "Your local-first workspace.") });
}

export function getPageById(id: string) { return pageRegistry.find((page) => page.id === id); }
export function getAreaLabel(area: ProductArea) { return areas[area]; }
