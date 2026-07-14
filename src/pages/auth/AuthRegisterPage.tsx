import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { passwordIssues, useAuth, validEmail } from "../../auth";
import { AuthCard } from "../../components/auth/AuthCard";
import { useLanguage } from "../../i18n/LanguageContext";

export function AuthRegisterPage() {
  const { language } = useLanguage();
  const { isConfigured, register, status } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirm: "", language,
    terms: false, privacy: false, experienceLevel: "", mainGoal: "",
  });
  const update = (name: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [name]: value }));
  const he = language === "he";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !validEmail(form.email)
      || passwordIssues(form.password).length || form.password !== form.confirm
      || !form.terms || !form.privacy) {
      setMessage(he
        ? "השלימו את כל השדות ובדקו את הסיסמה וההסכמות."
        : "Complete all fields and check the password and consent boxes.");
      return;
    }
    const result = await register(form);
    if (result.ok) {
      navigate(result.requiresEmailVerification
        ? `/auth/verify-email?email=${encodeURIComponent(form.email)}`
        : "/onboarding", { replace: true });
    } else {
      setMessage(he
        ? "לא ניתן ליצור חשבון. נסו שוב או היכנסו לחשבון קיים."
        : "Unable to create an account. Try again or sign in to an existing account.");
    }
  };

  return <AuthCard
    title={he ? "יצירת חשבון" : "Create account"}
    description={he ? "צרו חשבון אופציונלי מבלי לאבד עבודה מקומית." : "Create an optional account without losing local work."}
  >
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-name-grid">
        <label>{he ? "שם פרטי" : "First name"}<input autoComplete="given-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></label>
        <label>{he ? "שם משפחה" : "Last name"}<input autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></label>
      </div>
      <label>{he ? "דוא״ל" : "Email"}<input type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
      <label>{he ? "סיסמה" : "Password"}<input type="password" autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} aria-describedby="password-rules" /></label>
      <p id="password-rules" className="form-help">{he ? "לפחות 10 תווים, אות גדולה, אות קטנה ומספר." : "At least 10 characters with upper case, lower case, and a number."}</p>
      <label>{he ? "אימות סיסמה" : "Confirm password"}<input type="password" autoComplete="new-password" value={form.confirm} onChange={(event) => update("confirm", event.target.value)} /></label>
      <label>{he ? "רמת ניסיון (רשות)" : "Experience level (optional)"}<select value={form.experienceLevel} onChange={(event) => update("experienceLevel", event.target.value)}><option value="">—</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      <label>{he ? "מטרה עיקרית (רשות)" : "Main goal (optional)"}<input value={form.mainGoal} onChange={(event) => update("mainGoal", event.target.value)} /></label>
      <label className="consent-row"><input type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} /><span>{he ? "אני מסכים/ה " : "I agree to the "}<Link to="/terms">{he ? "לתנאי השימוש" : "Terms"}</Link></span></label>
      <label className="consent-row"><input type="checkbox" checked={form.privacy} onChange={(event) => update("privacy", event.target.checked)} /><span>{he ? "קראתי את הודעת הפרטיות" : "I acknowledge the Privacy Notice"}</span></label>
      {message && <p role="alert">{message}</p>}
      <button className="button button-primary" disabled={!isConfigured || status === "loading"} type="submit">{status === "loading" ? (he ? "יוצרים…" : "Creating…") : (he ? "יצירת חשבון" : "Create account")}</button>
    </form>
    <Link to="/auth/login">{he ? "כבר יש לי חשבון" : "I already have an account"}</Link>
  </AuthCard>;
}
