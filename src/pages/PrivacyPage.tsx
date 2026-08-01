import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export function PrivacyPage() {
  const { language } = useLanguage();
  const he = language === "he";
  return <main className="legal-page"><article>
    <Link to="/">Shabi's AI Academy</Link>
    <h1>{he ? "הודעת פרטיות לפרויקט הבטא" : "Beta project Privacy Notice"}</h1>
    <p className="legal-notice">{he ? "מסמך זה מיועד לבחינת פרויקט הבטא ואינו ייעוץ משפטי." : "This notice supports beta project review and is not legal advice."}</p>
    <h2>{he ? "נתונים מקומיים" : "Browser-local data"}</h2>
    <p>{he ? "במצב אורח, התקדמות, פרומפטים, סוכנים, פרויקטים, משימות, צוותים, מפת מיומנויות, חבילות הקשר והעדפות נשמרים בפרופיל הדפדפן הנוכחי. מצב WALK ME נשמר בנפרד. ניקוי אחסון הדפדפן עלול למחוק אותם." : "In Guest mode, progress, prompts, agents, projects, missions, teams, Skill Map evidence, Context Packs, and preferences stay in the current browser profile. WALK ME state is stored separately. Clearing browser storage can remove them."}</p>
    <h2>{he ? "משימות, צוותים והרשאות" : "Missions, teams, and permissions"}</h2>
    <p>{he ? "המשימות והצוותים מופרדים לפי שחקן מקומי, מוגבלים בגודל ונבדקים בעת טעינה. תוכן פגום מועבר להסגר. Simulate ו-Dry Run אינם מפעילים ספק AI או כלי. Local Execute מוגבל למצב המשימה בדפדפן בלבד; Connected Execute מושבת, ואין להזין מפתחות או סודות." : "Missions and teams are actor-scoped, bounded, and validated when loaded. Malformed content is quarantined. Simulate and Dry Run do not invoke an AI provider or tool. Local Execute is limited to mission state in this browser; Connected Execute is disabled, and keys or secrets must never be entered."}</p>
    <h2>{he ? "חשבון וענן" : "Account and cloud data"}</h2>
    <p>{he ? "כאשר Supabase מוגדר ואתם נרשמים, ספק האימות מנהל דוא״ל והפעלה. סנכרון ענן הוא אופציונלי ואינו מוצג כמושלם עד לאישור." : "When Supabase is configured and you register, the auth provider manages email and session data. Cloud sync is optional and is not shown as complete until confirmed."}</p>
    <h2>{he ? "ייצוא, מחיקה וניתוח שימוש" : "Export, deletion, and analytics"}</h2>
    <p>{he ? "גיבוי מקומי לאחר תצוגה מקדימה כולל גם ריצות הערכה, ראיות ועקבות כגרף מוגן ומשייך אותם במפורש לפרופיל היעד בעת שחזור. WALK ME אינו נכלל. ניתוח השימוש כבוי עד להסכמה מפורשת ומוגבל לסוג אירוע, זמן וקטגוריה גסה; הוא דוחה מטרות, תוכן, מזהים, הערות, נתונים אישיים וסודות." : "After preview, a local backup also includes evaluation runs, evidence, and traces as a protected graph and explicitly binds them to the target profile during restore. WALK ME is excluded. Analytics stays off until explicit consent and is limited to event type, time, and coarse category; it rejects goals, content, identifiers, notes, personal data, and secrets."}</p>
    <h2>{he ? "מגבלות בטא" : "Beta limitations"}</h2>
    <p>{he ? "התכונות עשויות להשתנות, ואין התחייבות לזמינות ענן או לשמירת נתונים ללא גיבוי." : "Features may change, and cloud availability or retention without a backup is not guaranteed."}</p>
    <Link to="/terms">{he ? "תנאי שימוש" : "Terms"}</Link>
  </article></main>;
}
