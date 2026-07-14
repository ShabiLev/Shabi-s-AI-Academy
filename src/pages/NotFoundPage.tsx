import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

export function NotFoundPage() {
  const { language } = useLanguage();
  const he = language === "he";
  return (
    <main className="legal-page" id="main-content">
      <article>
        <p className="eyebrow">404</p>
        <h1>{he ? "העמוד לא נמצא" : "Page not found"}</h1>
        <p>{he ? "הקישור אינו זמין. שום מידע מקומי לא שונה." : "This link is unavailable. No local data was changed."}</p>
        <div className="card-actions">
          <Link className="button button-primary" to="/">{he ? "חזרה לדף הבית" : "Return home"}</Link>
          <Link className="button button-secondary" to="/help">{he ? "פתיחת מרכז העזרה" : "Open Help Center"}</Link>
        </div>
      </article>
    </main>
  );
}
