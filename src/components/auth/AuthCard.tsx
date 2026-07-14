import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth";
import { useLanguage } from "../../i18n/LanguageContext";
export function AuthCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  const { isConfigured } = useAuth(); const { language } = useLanguage();
  return <main className="auth-page"><section className="auth-card" aria-labelledby="auth-title"><Link className="auth-brand" to="/">Shabi's AI Academy</Link><h1 id="auth-title">{title}</h1><p>{description}</p>{!isConfigured && <div className="auth-unavailable" role="status"><strong>{language === "he" ? "שירות החשבון אינו מוגדר" : "Account service is not configured"}</strong><p>{language === "he" ? "אפשר להמשיך כאורח וכל הנתונים המקומיים ימשיכו לעבוד." : "You can continue as Guest; all local features remain available."}</p></div>}{children}<p className="auth-legal"><Link to="/privacy">{language === "he" ? "פרטיות" : "Privacy"}</Link> · <Link to="/terms">{language === "he" ? "תנאים" : "Terms"}</Link> · <Link to="/about">About</Link></p></section></main>;
}
