import type { CourseModule, Lesson, LocalizedText } from "./types";
const t = (he: string, en: string): LocalizedText => ({ he, en });
const o = (id: string, he: string, en: string) => ({ id, label: t(he, en) });
const quiz = (prefix: string) => [
  {
    id: "q1",
    prompt: t(
      "מה מספק עובדות שהמודל אינו צריך לנחש?",
      "What supplies facts the model should not guess?",
    ),
    type: "single-choice" as const,
    options: [
      o("a", "הקשר", "Context"),
      o("b", "עיצוב", "Decoration"),
      o("c", "ניחוש", "Guessing"),
    ],
    correctOptionId: "a",
    explanation: t(
      "הקשר מספק עובדות רלוונטיות.",
      "Context supplies relevant facts.",
    ),
  },
  {
    id: "q2",
    prompt: t(
      "ניסוח בטוח מבטיח תשובה נכונה.",
      "Confident wording guarantees a correct answer.",
    ),
    type: "true-false" as const,
    options: [o("true", "נכון", "True"), o("false", "לא נכון", "False")],
    correctOptionId: "false",
    explanation: t(
      "שטף אינו הוכחה לנכונות.",
      "Fluency is not proof of correctness.",
    ),
  },
  {
    id: "q3",
    prompt: t(
      `מה חשוב בתהליך ${prefix}?`,
      `What matters in a ${prefix} process?`,
    ),
    type: "single-choice" as const,
    options: [
      o(
        "a",
        "אימות אנושי ותוצר שניתן לסקור",
        "Human validation and reviewable output",
      ),
      o("b", "גישה ללא הגבלה", "Unlimited access"),
      o("c", "הסתרת הנחות", "Hidden assumptions"),
    ],
    correctOptionId: "a",
    explanation: t(
      "אימות ותוצר ברור מצמצמים סיכון.",
      "Validation and clear output reduce risk.",
    ),
  },
];
export const courseModules: CourseModule[] = [
  {
    id: "foundations",
    order: 1,
    title: t("יסודות ה-AI", "AI Foundations"),
    description: t(
      "יסודות מעשיים לעבודה מדויקת ואחראית עם מערכות AI.",
      "Practical foundations for accurate, responsible work with AI systems.",
    ),
    lessonIds: [
      "ai-llm-agent",
      "professional-prompt-anatomy",
      "context-constraints-output",
      "hallucinations-verification",
      "repeatable-ai-workflow",
    ],
  },
  {
    id: "agent-foundations",
    order: 2,
    title: t("יסודות סוכני AI", "AI Agents Foundations"),
    description: t(
      "תכנון סוכן שקוף, מוגבל וניתן לבדיקה לפני חיבור לכלים אמיתיים.",
      "Design a transparent, bounded, testable agent before connecting real tools.",
    ),
    lessonIds: ["anatomy-of-an-agent"],
  },
];
const common = (
  id: string,
  slug: string,
  order: number,
  minutes: number,
  title: LocalizedText,
  summary: LocalizedText,
  available = true,
): Lesson => ({
  id,
  slug,
  moduleId: "foundations",
  order,
  estimatedMinutes: minutes,
  difficulty: order > 3 ? "intermediate" : "beginner",
  available,
  title,
  summary,
  learningObjectives: [],
  sections: [],
  examples: [],
  quiz: [],
});
const lesson1 = common(
  "ai-llm-agent",
  "ai-llm-agent",
  1,
  15,
  t("AI, מודל שפה ואייג'נט", "AI, LLM and Agent"),
  t(
    "הבדלים בין התחום, המודל, מוצר הצ׳אט והמערכת האייג׳נטית.",
    "Distinguish the field, model, chat product, and agent system.",
  ),
);
lesson1.learningObjectives = [
  t(
    "להסביר את ההבדלים בין AI, מודל שפה, מוצר צ׳אט ואייג׳נט.",
    "Explain the differences between AI, an LLM, a chat product, and an Agent.",
  ),
  t(
    "לזהות משימות למודל בלבד, לכלים או לתהליך אייג׳נטי.",
    "Identify LLM-only, tool-assisted, and agent tasks.",
  ),
  t("להכיר את לולאת הביצוע של אייג׳נט.", "Recognize the Agent execution loop."),
];
lesson1.sections = [
  {
    id: "intro",
    title: t("מבוא", "Introduction"),
    paragraphs: [
      t(
        "AI הוא התחום הרחב. LLM הוא מודל שמייצר שפה. ChatGPT ו-Claude הם מוצרים שמוסיפים ממשק ויכולות. אייג׳נט הוא מערכת שמקדמת מטרה באמצעות כלים ופעולות.",
        "AI is the broad field. An LLM generates language. ChatGPT and Claude are products adding interfaces and capabilities. An Agent pursues a goal using tools and actions.",
      ),
    ],
  },
  {
    id: "ai",
    title: t("בינה מלאכותית", "AI"),
    paragraphs: [
      t(
        "AI כולל זיהוי תמונות, איתור הונאות, אופטימיזציית מסלולים ויצירת שפה. אין בכך טענה שמערכת חושבת כמו אדם.",
        "AI includes image recognition, fraud detection, route optimization, and language generation. This does not imply human-like thought.",
      ),
    ],
  },
  {
    id: "llm",
    title: t("מודל שפה גדול", "LLM"),
    paragraphs: [
      t(
        "LLM חוזה טוקנים לפי הקשר. הוא אינו מאגר אמת ועלול לנסח תשובה שוטפת ובטוחה אך שגויה, ולכן טענות חשובות דורשות אימות.",
        "An LLM predicts tokens from context. It is not a truth database and can sound fluent and confident while wrong, so important claims require verification.",
      ),
    ],
  },
  {
    id: "product",
    title: t("מוצר צ׳אט", "Chat Product"),
    paragraphs: [
      t(
        "ממשק, זיכרון, כלים, חיפוש, קבצים ומחברים הם יכולות מוצר סביב המודל, ולא בהכרח יכולות פנימיות של המודל.",
        "UI, memory, tools, search, files, and connectors are product capabilities around a model, not necessarily intrinsic model capabilities.",
      ),
    ],
  },
  {
    id: "agent",
    title: t("אייג׳נט ולולאת ביצוע", "Agent and execution loop"),
    paragraphs: [
      t(
        "רמת העצמאות נקבעת לפי התכנון וההרשאות; אייג׳נט אינו עצמאי לחלוטין כברירת מחדל.",
        "Autonomy depends on design and permissions; an Agent is not fully autonomous by default.",
      ),
    ],
    steps: [
      t("מטרה", "Goal"),
      t("תכנון", "Plan"),
      t("בחירת כלי", "Choose Tool"),
      t("פעולה", "Act"),
      t("צפייה בתוצאה", "Observe Result"),
      t("אימות", "Validate"),
      t("ניסיון חוזר או סיום", "Retry or Finish"),
    ],
  },
  {
    id: "qa",
    title: t("דוגמת QA", "QA example"),
    paragraphs: [
      t(
        "צ׳אט יכול ליצור מקרי בדיקה מדרישה שסופקה. תהליך אייג׳נטי קורא את הדרישה, בודק Jira וכיסוי רגרסיה, מזהה סיכונים, יוצר בדיקות, מאמת שדות ומכין תוצר לסקירה. אישור אנושי נשאר חשוב.",
        "A chat can draft tests from a supplied requirement. An agent workflow reads it, checks Jira and regression coverage, identifies risks, generates tests, validates fields, and prepares reviewable output. Human approval remains important.",
      ),
    ],
  },
  {
    id: "summary",
    title: t("השוואה וסיכום", "Comparison and summary"),
    paragraphs: [],
    table: {
      headers: [t("מושג", "Concept"), t("תפקיד", "Purpose")],
      rows: [
        [t("AI", "AI"), t("התחום הרחב", "Broad field")],
        [
          t("LLM", "LLM"),
          t("חיזוי ויצירת טוקנים", "Token prediction and generation"),
        ],
        [
          t("מוצר צ׳אט", "Chat Product"),
          t(
            "ממשק ויכולות סביב מודל",
            "Interface and capabilities around a model",
          ),
        ],
        [
          t("אייג׳נט", "Agent"),
          t(
            "תהליך להשגת מטרה בעזרת פעולות וכלים",
            "Goal-driven process using actions and tools",
          ),
        ],
      ],
    },
  },
];
lesson1.exercise = {
  id: "classify",
  title: t("תרגיל סיווג", "Classification exercise"),
  instructions: t(
    "סווגו: שכתוב דוא״ל, בדיקת יומן, הסבר SQL, דוח סיכוני Jira, תרגום, וניטור בדיקות.",
    "Classify: email rewrite, calendar check, SQL explanation, Jira risk report, translation, and test monitoring.",
  ),
  solution: t(
    "LLM: שכתוב, הסבר ותרגום. כלי: יומן. אייג׳נט: דוח רב-מקורות וניטור מתמשך.",
    "LLM: rewrite, explanation, translation. Tool: calendar. Agent: multi-source report and ongoing monitoring.",
  ),
};
lesson1.quiz = quiz("agent");
const lesson2 = common(
  "professional-prompt-anatomy",
  "professional-prompt-anatomy",
  2,
  20,
  t("המבנה של פרומפט מקצועי", "Anatomy of a Professional Prompt"),
  t(
    "הפיכת בקשה עמומה למפרט ברור וניתן לשימוש חוזר.",
    "Turn a vague request into a clear, reusable specification.",
  ),
);
lesson2.learningObjectives = [
  t(
    "להפוך בקשה עמומה למפרט פעולה.",
    "Turn a vague request into an actionable specification.",
  ),
  t(
    "להשתמש בתפקיד, משימה, הקשר, מגבלות ופורמט פלט.",
    "Use Role, Task, Context, Constraints, and Output Format.",
  ),
  t(
    "לזהות מידע חסר וליצור תבנית חוזרת.",
    "Recognize missing information and create a reusable template.",
  ),
];
lesson2.sections = [
  {
    id: "weak",
    title: t("ניתוח בקשה חלשה", "Weak prompt analysis"),
    paragraphs: [
      t(
        "״צור מקרי בדיקה להתחברות״ חסר היקף, התנהגות, מגבלות ומבנה פלט ולכן מחייב ניחושים.",
        "“Create test cases for login” lacks scope, behavior, constraints, and output structure, forcing guesses.",
      ),
    ],
  },
  {
    id: "parts",
    title: t("חמשת החלקים", "Five parts"),
    paragraphs: [
      t(
        "תפקיד הוא אופציונלי ואינו תחליף להקשר. משימה מגדירה פעולה; הקשר מספק עובדות; מגבלות קובעות גבולות; פורמט פלט מגדיר תוצר שניתן לסקור.",
        "Role is optional and does not replace context. Task defines action; Context supplies facts; Constraints set boundaries; Output Format defines a reviewable deliverable.",
      ),
    ],
    steps: [
      t("תפקיד", "Role"),
      t("משימה", "Task"),
      t("הקשר", "Context"),
      t("מגבלות", "Constraints"),
      t("פורמט פלט", "Output Format"),
    ],
  },
  {
    id: "improve",
    title: t("שיפור צעד אחר צעד", "Step-by-step improvement"),
    paragraphs: [
      t(
        "פעל כמהנדס QA בכיר. צור מקרי בדיקה פונקציונליים ושליליים לכניסה עם דוא״ל וסיסמה, נעילה אחרי חמישה כישלונות, איפוס סיסמה ודפדפני נייד ומחשב. אין להניח כניסה חברתית ואין לספק הוראות חדירה.",
        "Act as a senior QA engineer. Create functional and negative cases for email/password login, lockout after five failures, password reset, and mobile/desktop browsers. Do not assume social login or provide penetration instructions.",
      ),
      t(
        "החזר טבלה עם מזהה, כותרת, תנאים מקדימים, צעדים, תוצאה צפויה, עדיפות וסוג בדיקה.",
        "Return a table with ID, title, preconditions, steps, expected result, priority, and test type.",
      ),
    ],
  },
  {
    id: "compare",
    title: t("לפני ואחרי", "Before and after"),
    paragraphs: [],
    table: {
      headers: [t("לפני", "Before"), t("אחרי", "After")],
      rows: [
        [
          t("בקשה עמומה", "Vague request"),
          t(
            "משימה, עובדות, גבולות ופורמט",
            "Task, facts, boundaries, and format",
          ),
        ],
      ],
    },
  },
  {
    id: "template",
    title: t("תבנית חוזרת", "Reusable template"),
    paragraphs: [
      t(
        "תפקיד: [אופציונלי]\nמשימה: [פעולה]\nהקשר: [עובדות]\nמגבלות: [גבולות]\nפלט: [מבנה ושדות]",
        "Role: [optional]\nTask: [action]\nContext: [facts]\nConstraints: [boundaries]\nOutput: [structure and fields]",
      ),
    ],
  },
  {
    id: "mistakes",
    title: t("טעויות נפוצות", "Common mistakes"),
    paragraphs: [
      t(
        "תפקיד מוגזם, הקשר חסר, משימה לא מדידה, מגבלות סותרות ופורמט פלט עמום.",
        "Exaggerated role, missing context, unmeasurable task, conflicting constraints, and vague output format.",
      ),
    ],
  },
];
lesson2.examples = [
  {
    id: "example",
    title: t("שיפור הפרומפט", "Prompt improvement"),
    before: t("צור מקרי בדיקה להתחברות.", "Create test cases for login."),
    after: t(
      "השתמשו במבנה בן חמשת החלקים לעיל.",
      "Use the five-part structure above.",
    ),
    explanation: t(
      "המבנה מפחית הנחות ומקל על סקירת התוצאה.",
      "The structure reduces assumptions and makes review easier.",
    ),
  },
];
lesson2.exercise = {
  id: "builder",
  title: t(
    "בונה פרומפט ומשימה מעשית",
    "Prompt builder and practical assignment",
  ),
  instructions: t(
    "כתבו פרומפט ל-SQL, ניתוח Jira, סיכום גרסה, דוא״ל ללקוח או מקרי בדיקה.",
    "Write a prompt for SQL, Jira analysis, a release summary, customer email, or test cases.",
  ),
};
lesson2.quiz = quiz("prompt");
lesson2.assignmentDraft = true;
const lesson3 = common(
  "anatomy-of-an-agent",
  "anatomy-of-an-agent",
  1,
  25,
  t("האנטומיה של סוכן", "Anatomy of an Agent"),
  t(
    "הגדירו מטרה, כלים, אימות, ניסיונות חוזרים, אישור אנושי ותנאי סיום.",
    "Define goals, tools, validation, retries, human approval, and completion criteria.",
  ),
);
lesson3.moduleId = "agent-foundations";
lesson3.learningObjectives = [
  t(
    "להבחין בין הוראות, כלים וזיכרון.",
    "Distinguish instructions, tools, and memory.",
  ),
  t(
    "לתכנן נקודות אימות ואישור אנושי.",
    "Design validation and human-approval points.",
  ),
  t(
    "להגדיר מתי לנסות שוב ומתי לעצור.",
    "Define when to retry and when to stop.",
  ),
];
lesson3.sections = [
  {
    id: "loop",
    title: t("לולאת הסוכן", "The agent loop"),
    paragraphs: [
      t(
        "סוכן מקבל מטרה וקלט, מתכנן פעולה, משתמש רק בכלים שהוגדרו, בוחן את התוצאה ומסיים או מנסה שוב לפי מדיניות מפורשת.",
        "An agent receives a goal and inputs, plans an action, uses only declared tools, validates the result, and finishes or retries under an explicit policy.",
      ),
    ],
    steps: [
      t("מטרה וקלט", "Goal and inputs"),
      t("תכנון ופעולה", "Plan and act"),
      t("אימות", "Validate"),
      t("סיום או ניסיון חוזר", "Finish or retry"),
    ],
  },
  {
    id: "safety",
    title: t("גבולות ואישור", "Boundaries and approval"),
    paragraphs: [
      t(
        "כלי הוא הרשאה, לא רק יכולת. פעולות משנות מצב דורשות נקודת אישור אנושי, תנאי עצירה ותוצר שניתן לסקירה.",
        "A tool is a permission, not merely a capability. State-changing actions need human approval, stop conditions, and reviewable output.",
      ),
      t(
        "הסימולציה באקדמיה מקומית ודטרמיניסטית; היא אינה מפעילה כלי חיצוני ואינה מוכיחה ביצוע בעולם האמיתי.",
        "Academy simulation is local and deterministic; it calls no external tool and does not prove real-world execution.",
      ),
    ],
  },
];
lesson3.exercise = {
  id: "build-agent",
  title: t("תכננו סוכן", "Design an agent"),
  instructions: t(
    "בחרו תרחיש, הגדירו תנאי השלמה ועצירה, וציינו היכן נדרש אישור אנושי. לאחר מכן פתחו את בונה הסוכנים.",
    "Choose a scenario, define completion and stop conditions, and identify human approval points. Then open Agent Builder.",
  ),
};
lesson3.quiz = quiz("agent design");
export const courseLessons = [
  lesson1,
  lesson2,
  lesson3,
  common(
    "context-constraints-output",
    "context-constraints-output",
    3,
    20,
    t("הקשר, מגבלות ופלט", "Context, Constraints and Output"),
    t(
      "שיפור תוצאות באמצעות עובדות וגבולות.",
      "Improve results with facts and boundaries.",
    ),
    false,
  ),
  common(
    "hallucinations-verification",
    "hallucinations-verification",
    4,
    20,
    t("הזיות ואימות", "Hallucinations and Verification"),
    t("בדיקת טענות ובניית אימות.", "Check claims and build verification."),
    false,
  ),
  common(
    "repeatable-ai-workflow",
    "repeatable-ai-workflow",
    5,
    25,
    t("תהליך AI חוזר ראשון", "Building Your First Repeatable AI Workflow"),
    t("הפיכת משימה לתהליך עקבי.", "Turn a task into a consistent workflow."),
    false,
  ),
];
export const getLessonBySlug = (slug: string) =>
  courseLessons.find((l) => l.slug === slug);
