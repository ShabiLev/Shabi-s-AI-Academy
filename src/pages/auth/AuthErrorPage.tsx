import { Link } from "react-router-dom";
import { AuthCard } from "../../components/auth/AuthCard";
import { useLanguage } from "../../i18n/LanguageContext";
export function AuthErrorPage() { const { language } = useLanguage(); return <AuthCard title={language === "he" ? "לא ניתן להשלים את הפעולה" : "We could not complete that action"} description={language === "he" ? "לא נחשפו פרטי חשבון. נסו שוב באמצעות קישור חדש." : "No account details were exposed. Try again with a new link."}><div className="inline-actions"><Link className="button button-primary" to="/auth/login">{language === "he" ? "לכניסה" : "Sign in"}</Link><Link to="/auth/forgot-password">{language === "he" ? "בקשת איפוס" : "Request reset"}</Link></div></AuthCard>; }
