import { RecentItems } from "../components/profile/RecentItems";
import { useLanguage } from "../i18n/LanguageContext";

export function HistoryPage() {
  const { language } = useLanguage();
  return <div className="page">
    <header><p className="eyebrow">{language === "he" ? "סביבת העבודה שלך" : "Your workspace"}</p><h1>{language === "he" ? "היסטוריה" : "History"}</h1><p>{language === "he" ? "הפריטים האחרונים שפתחת, ערכת או הרצת במכשיר הזה." : "Items recently opened, edited, or run on this device."}</p></header>
    <RecentItems />
  </div>;
}
