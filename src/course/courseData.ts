import type { CourseModule, Lesson, LocalizedText } from "./types";

const t = (he: string, en: string): LocalizedText => ({ he, en });

type LessonSeed = readonly [slug: string, he: string, en: string];
type ModuleSeed = {
  readonly id: string;
  readonly he: string;
  readonly en: string;
  readonly lessons: readonly LessonSeed[];
};

const modules: readonly ModuleSeed[] = [
  { id: "ai-foundations", he: "יסודות הבינה המלאכותית", en: "AI Foundations", lessons: [
    ["ai-llm-agent", "AI, מודל שפה וסוכן", "AI, LLM and Agent"],
    ["language-model-basics", "יסודות מודלי שפה", "Language Model Basics"],
    ["capabilities-and-limits", "יכולות, מגבלות ואי־ודאות", "Capabilities, Limits and Uncertainty"],
    ["responsible-ai-work", "עבודה אחראית עם AI", "Responsible AI Work"],
    ["repeatable-ai-workflow", "תהליך עבודה חוזר עם AI", "A Repeatable AI Workflow"],
  ]},
  { id: "prompt-engineering", he: "הנדסת פרומפטים", en: "Prompt Engineering", lessons: [
    ["professional-prompt-anatomy", "האנטומיה של פרומפט מקצועי", "Anatomy of a Professional Prompt"],
    ["context-constraints-output", "הקשר, מגבלות ופלט", "Context, Constraints and Output"],
    ["examples-and-variables", "דוגמאות ומשתנים", "Examples and Variables"],
    ["prompt-iteration", "שיפור פרומפטים באופן שיטתי", "Systematic Prompt Iteration"],
    ["prompt-quality-review", "סקירת איכות לפרומפט", "Prompt Quality Review"],
  ]},
  { id: "context-verification", he: "הקשר ואימות", en: "Context and Verification", lessons: [
    ["grounding-with-context", "עיגון תשובות בהקשר", "Grounding with Context"],
    ["hallucination-detection", "זיהוי הזיות", "Detecting Hallucinations"],
    ["source-evaluation", "הערכת מקורות", "Evaluating Sources"],
    ["verification-workflows", "תהליכי אימות", "Verification Workflows"],
    ["evidence-and-citations", "ראיות וציטוטים", "Evidence and Citations"],
  ]},
  { id: "models-parameters", he: "מודלים ופרמטרים", en: "Models and Parameters", lessons: [
    ["model-selection", "בחירת מודל למשימה", "Selecting a Model"],
    ["tokens-and-context", "טוקנים וחלון הקשר", "Tokens and Context Windows"],
    ["temperature-and-sampling", "טמפרטורה ודגימה", "Temperature and Sampling"],
    ["cost-latency-quality", "עלות, זמן תגובה ואיכות", "Cost, Latency and Quality"],
  ]},
  { id: "agent-design", he: "תכנון סוכנים", en: "Agent Design", lessons: [
    ["anatomy-of-an-agent", "האנטומיה של סוכן", "Anatomy of an Agent"],
    ["goals-and-roles", "מטרות ותפקידים", "Goals and Roles"],
    ["planning-and-control", "תכנון ובקרת ביצוע", "Planning and Control"],
    ["validation-and-completion", "אימות ותנאי השלמה", "Validation and Completion"],
    ["human-approval", "אישור אנושי וגבולות", "Human Approval and Boundaries"],
  ]},
  { id: "tools-function-calling", he: "כלים וקריאות פונקציה", en: "Tools and Function Calling", lessons: [
    ["tool-contracts", "חוזים לכלים", "Tool Contracts"],
    ["input-output-schemas", "סכמות קלט ופלט", "Input and Output Schemas"],
    ["tool-risk", "סיכונים והרשאות לכלים", "Tool Risk and Permissions"],
    ["tool-failure-handling", "טיפול בכשלי כלים", "Handling Tool Failures"],
  ]},
  { id: "memory", he: "זיכרון", en: "Memory", lessons: [
    ["memory-types", "סוגי זיכרון במערכות AI", "Memory Types in AI Systems"],
    ["conversation-memory", "זיכרון שיחה", "Conversation Memory"],
    ["memory-privacy", "פרטיות ומחזור חיים של זיכרון", "Memory Privacy and Lifecycle"],
    ["memory-evaluation", "הערכת איכות הזיכרון", "Evaluating Memory"],
  ]},
  { id: "rag", he: "אחזור והפקה (RAG)", en: "Retrieval-Augmented Generation", lessons: [
    ["rag-foundations", "יסודות RAG", "RAG Foundations"],
    ["chunking-metadata", "חלוקה למקטעים ומטא־נתונים", "Chunking and Metadata"],
    ["retrieval-and-ranking", "אחזור ודירוג", "Retrieval and Ranking"],
    ["citations-and-evaluation", "ציטוטים והערכת RAG", "Citations and RAG Evaluation"],
  ]},
  { id: "mcp-automation", he: "MCP ואוטומציה", en: "MCP and Automation", lessons: [
    ["mcp-foundations", "יסודות MCP", "MCP Foundations"],
    ["servers-resources-tools", "שרתים, משאבים וכלים", "Servers, Resources and Tools"],
    ["workflow-automation", "תכנון אוטומציות", "Workflow Automation"],
    ["automation-safety", "בטיחות באוטומציה", "Automation Safety"],
  ]},
  { id: "production-ai", he: "מערכות AI לייצור", en: "Production AI Systems", lessons: [
    ["production-architecture", "ארכיטקטורת AI לייצור", "Production AI Architecture"],
    ["observability-and-evals", "תצפיתיות והערכות", "Observability and Evaluations"],
    ["security-and-privacy", "אבטחה ופרטיות", "Security and Privacy"],
    ["release-and-rollback", "שחרור ונסיגה", "Release and Rollback"],
    ["continuous-improvement", "שיפור מתמשך", "Continuous Improvement"],
  ]},
] as const;

export const courseModules: CourseModule[] = modules.map((module, index) => ({
  id: module.id,
  order: index + 1,
  title: t(module.he, module.en),
  description: t(
    `מסלול מעשי בנושא ${module.he}, עם דוגמאות, תרגול ואימות.`,
    `A practical ${module.en} path with examples, exercises, and verification.`,
  ),
  lessonIds: module.lessons.map(([slug]) => slug),
}));

const makeLesson = (
  seed: LessonSeed,
  module: ModuleSeed,
  order: number,
  globalOrder: number,
): Lesson => {
  const [slug, heTitle, enTitle] = seed;
  const difficulty = globalOrder < 15 ? "beginner" : globalOrder < 34 ? "intermediate" : "advanced";
  const standardQuiz: Lesson["quiz"] = [{
    id: "verification",
    prompt: t("מהו הצעד החשוב ביותר לפני שימוש בתוצר?", "What is the most important step before using the result?"),
    type: "single-choice",
    options: [
      { id: "verify", label: t("אימות מול קריטריונים ומקורות", "Verify against criteria and sources") },
      { id: "trust", label: t("להסתמך על ניסוח בטוח", "Trust confident wording") },
      { id: "share", label: t("לשתף מיד", "Share immediately") },
    ],
    correctOptionId: "verify",
    explanation: t("אימות מפורש מצמצם טעויות ומבהיר אחריות.", "Explicit verification reduces errors and clarifies responsibility."),
  }];
  const foundationQuiz: Lesson["quiz"] = [
    { id: "context", prompt: t("מה מספק עובדות שהמודל אינו צריך לנחש?", "What supplies facts the model should not guess?"), type: "single-choice", options: [{ id: "context", label: t("הקשר", "Context") }, { id: "guess", label: t("ניחוש", "Guessing") }], correctOptionId: "context", explanation: t("הקשר מספק עובדות רלוונטיות.", "Context supplies relevant facts.") },
    { id: "confidence", prompt: t("ניסוח בטוח מבטיח תשובה נכונה.", "Confident wording guarantees correctness."), type: "true-false", options: [{ id: "true", label: t("נכון", "True") }, { id: "false", label: t("לא נכון", "False") }], correctOptionId: "false", explanation: t("שטף אינו הוכחה לנכונות.", "Fluency is not proof of correctness.") },
    { id: "review", prompt: t("מה חשוב בתהליך מקצועי?", "What matters in a professional process?"), type: "single-choice", options: [{ id: "review", label: t("אימות אנושי ותוצר שניתן לסקור", "Human validation and reviewable output") }, { id: "hidden", label: t("הנחות נסתרות", "Hidden assumptions") }], correctOptionId: "review", explanation: t("אימות ותוצר ברור מצמצמים סיכון.", "Validation and clear output reduce risk.") },
  ];
  return {
    id: slug,
    slug,
    moduleId: module.id,
    order,
    estimatedMinutes: 18 + (globalOrder % 4) * 4,
    difficulty,
    available: true,
    title: t(heTitle, enTitle),
    summary: t(
      `לומדים את עקרונות ${heTitle} ומיישמים אותם בתהליך עבודה שניתן לבדיקה.`,
      `Learn the principles of ${enTitle} and apply them in a reviewable workflow.`,
    ),
    learningObjectives: [
      t(`להסביר את המושגים המרכזיים של ${heTitle}.`, `Explain the core concepts of ${enTitle}.`),
      t("ליישם את העקרונות בדוגמה מקצועית.", "Apply the principles to a professional example."),
      t("לזהות סיכונים ולבנות נקודת אימות.", "Identify risks and design a verification point."),
    ],
    prerequisites: globalOrder === 1 ? [] : ["השיעור הקודם מומלץ אך אינו חובה / Previous lesson recommended, not required"],
    sections: [
      {
        id: "concepts",
        title: t("מושגים ועקרונות", "Concepts and principles"),
        paragraphs: [
          t(
            `${heTitle} הוא חלק מתהליך הנדסי רחב: מגדירים מטרה, מספקים הקשר, מציבים גבולות ובודקים את התוצאה. אין להניח שפלט בטוח בניסוחו הוא בהכרח נכון.`,
            `${enTitle} belongs to a broader engineering process: define the goal, supply context, set boundaries, and verify the result. Confident wording is not evidence of correctness.`,
          ),
          t("העבודה באקדמיה מקומית ומדגימה יכולות באופן שקוף; חיבורים חיצוניים אינם מוצגים כפעילים.", "Academy work is local and demonstrates capabilities transparently; external connections are never presented as active."),
        ],
      },
      {
        id: "workflow",
        title: t("תהליך עבודה מעשי", "Practical workflow"),
        paragraphs: [t("התחילו במקרה קטן, תעדו הנחות, הגדירו תוצר צפוי והשוו את התוצאה לקריטריונים מפורשים.", "Start with a small case, record assumptions, define the expected deliverable, and compare the result with explicit criteria.")],
        steps: [t("הגדרת מטרה", "Define the goal"), t("איסוף הקשר", "Gather context"), t("ביצוע מבוקר", "Execute with controls"), t("אימות ותיעוד", "Verify and document")],
      },
      {
        id: "mistakes",
        title: t("טעויות נפוצות", "Common mistakes"),
        paragraphs: [t("הימנעו מהקשר חסר, הרשאות רחבות, הסתמכות על ניסוח משכנע ושמירת מידע רגיש.", "Avoid missing context, broad permissions, reliance on persuasive wording, and storage of sensitive data.")],
      },
    ],
    examples: [{
      id: "practical-example",
      title: t("דוגמה מקצועית", "Professional example"),
      before: t("בדקו את זה.", "Check this."),
      after: t("נתחו את הקלט שסופק בלבד, ציינו הנחות, החזירו ממצאים לפי חומרה והוסיפו צעדי אימות.", "Analyze only the supplied input, state assumptions, return findings by severity, and add verification steps."),
      explanation: t("הגרסה המשופרת מגדירה מקור, גבולות, מבנה פלט ובקרה אנושית.", "The improved version defines source, boundaries, output structure, and human review."),
    }],
    exercise: {
      id: "exercise",
      title: t("תרגול", "Exercise"),
      instructions: t(`כתבו דוגמה קצרה ל-${heTitle} והגדירו כיצד תבדקו אותה.`, `Write a short ${enTitle} example and define how you will verify it.`),
      tasks: [t("הגדירו קלט ותוצר.", "Define input and output."), t("הוסיפו מגבלה אחת.", "Add one constraint."), t("כתבו בדיקת איכות.", "Write a quality check.")],
      solution: t("פתרון טוב מציין מקורות, הנחות, גבולות וקריטריון הצלחה מדיד.", "A good solution states sources, assumptions, boundaries, and a measurable success criterion."),
    },
    quiz: slug === "ai-llm-agent" ? foundationQuiz : standardQuiz,
    miniProject: t(`בנו תהליך קטן המשתמש ב-${heTitle} ושמרו את תוצאת הבדיקה.`, `Build a small workflow using ${enTitle} and retain its verification result.`),
    relatedPromptIds: ["quality-review"],
    relatedAgentIds: ["qa-release-analyst"],
    references: ["Academy Engineering Kit", "NIST AI Risk Management Framework"],
    version: 1,
    assignmentDraft: true,
  };
};

let globalOrder = 0;
export const courseLessons: Lesson[] = modules.flatMap((module) =>
  module.lessons.map((seed, index) => makeLesson(seed, module, index + 1, ++globalOrder)),
);

export const getLessonBySlug = (slug: string) => courseLessons.find((lesson) => lesson.slug === slug);
